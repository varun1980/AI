import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDigitalProductDto } from '../dto/create-digital-product.dto';
import Stripe from 'stripe';
import * as sgMail from '@sendgrid/mail';
import * as AWS from 'aws-sdk';

@Injectable()
export class DigitalProductsService {
  private readonly logger = new Logger(DigitalProductsService.name);
  private stripe: Stripe;
  private s3: AWS.S3;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.stripe = new Stripe(this.config.get<string>('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    this.s3 = new AWS.S3({
      accessKeyId: this.config.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.config.get<string>('AWS_SECRET_ACCESS_KEY'),
      region: this.config.get<string>('AWS_REGION') || 'eu-west-2',
    });

    sgMail.setApiKey(this.config.get<string>('SENDGRID_API_KEY') || '');
  }

  async createProduct(dto: CreateDigitalProductDto) {
    // Create Stripe product + price
    let stripePriceId: string | undefined;

    try {
      const stripeProduct = await this.stripe.products.create({
        name: dto.name,
        description: dto.description,
        metadata: { type: dto.type, category: dto.category || '' },
      });

      const stripePrice = await this.stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: Math.round(dto.priceGBP * 100),
        currency: 'gbp',
      });

      stripePriceId = stripePrice.id;
    } catch (err) {
      this.logger.warn(`Stripe product creation failed: ${err.message}`);
    }

    return this.prisma.digitalProduct.create({
      data: {
        ...dto,
        features: dto.features || [],
        stripePriceId,
      },
    });
  }

  async createCheckoutSession(productId: string, buyerEmail: string, successUrl: string, cancelUrl: string) {
    const product = await this.prisma.digitalProduct.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      throw new NotFoundException('Product not found');
    }

    // Create Stripe checkout session
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: product.name,
              description: product.description,
              images: product.thumbnailUrl ? [product.thumbnailUrl] : [],
            },
            unit_amount: Math.round(product.priceGBP * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: buyerEmail,
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        productId: product.id,
        buyerEmail,
      },
    });

    // Track view
    await this.prisma.digitalProduct.update({
      where: { id: productId },
      data: { viewCount: { increment: 1 } },
    });

    return { url: session.url, sessionId: session.id };
  }

  async fulfillOrder(stripeSessionId: string) {
    const session = await this.stripe.checkout.sessions.retrieve(stripeSessionId);

    if (session.payment_status !== 'paid') {
      throw new Error('Payment not completed');
    }

    const productId = session.metadata?.productId;
    const buyerEmail = session.metadata?.buyerEmail || session.customer_email || '';

    if (!productId) throw new Error('Product ID missing from session');

    const product = await this.prisma.digitalProduct.findUnique({
      where: { id: productId },
    });

    if (!product) throw new NotFoundException('Product not found');

    // Check for existing purchase (idempotency)
    const existing = await this.prisma.digitalProductPurchase.findFirst({
      where: { stripeSessionId },
    });

    if (existing) return existing;

    // Generate signed S3 download URL (7 days expiry)
    let downloadUrl: string | undefined;
    let downloadExpiry: Date | undefined;

    if (product.fileUrl) {
      const key = product.fileUrl.replace(`https://${this.config.get('AWS_S3_BUCKET')}.s3.amazonaws.com/`, '');
      downloadUrl = await this.generateSignedUrl(key);
      downloadExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    const amountPaid = (session.amount_total || 0) / 100;

    // Create purchase record
    const purchase = await this.prisma.digitalProductPurchase.create({
      data: {
        productId,
        buyerEmail,
        amountPaid,
        currency: 'GBP',
        stripePaymentId: typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
        stripeSessionId,
        downloadUrl,
        downloadExpiry,
        status: 'COMPLETED',
      },
    });

    // Update product stats
    await this.prisma.digitalProduct.update({
      where: { id: productId },
      data: {
        purchaseCount: { increment: 1 },
        totalRevenue: { increment: amountPaid },
      },
    });

    // Record revenue
    await this.prisma.revenueRecord.create({
      data: {
        date: new Date(),
        source: 'DIGITAL_PRODUCTS',
        amount: amountPaid,
        currency: 'GBP',
        metadata: { productId, productName: product.name },
      },
    });

    // Send download email
    await this.sendDownloadEmail(buyerEmail, product, downloadUrl);

    this.logger.log(`Order fulfilled: ${product.name} for ${buyerEmail} - £${amountPaid}`);
    return purchase;
  }

  async getProducts(type?: string, featured?: boolean) {
    return this.prisma.digitalProduct.findMany({
      where: {
        isActive: true,
        ...(type ? { type: type as any } : {}),
        ...(featured !== undefined ? { isFeatured: featured } : {}),
      },
      orderBy: [{ isFeatured: 'desc' }, { purchaseCount: 'desc' }],
    });
  }

  async getProductBySlug(slug: string) {
    const product = await this.prisma.digitalProduct.findUnique({
      where: { slug },
    });

    if (!product || !product.isActive) throw new NotFoundException('Product not found');
    return product;
  }

  async getDigitalProductStats() {
    const products = await this.prisma.digitalProduct.findMany({
      where: { isActive: true },
      orderBy: { totalRevenue: 'desc' },
    });

    const totalRevenue = await this.prisma.digitalProductPurchase.aggregate({
      _sum: { amountPaid: true },
      where: { status: 'COMPLETED' },
    });

    const totalPurchases = await this.prisma.digitalProductPurchase.count({
      where: { status: 'COMPLETED' },
    });

    const recentPurchases = await this.prisma.digitalProductPurchase.findMany({
      where: { status: 'COMPLETED' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { product: { select: { name: true, type: true } } },
    });

    return {
      products,
      totalRevenue: totalRevenue._sum.amountPaid || 0,
      totalPurchases,
      recentPurchases,
      averageOrderValue: totalPurchases > 0
        ? ((totalRevenue._sum.amountPaid || 0) / totalPurchases).toFixed(2)
        : '0',
    };
  }

  async seedDefaultProducts() {
    const products = [
      {
        name: 'Complete Youth Football Development Programme',
        slug: 'youth-football-development-programme',
        description: 'A comprehensive 12-week structured training programme designed for players aged 8-16. Includes daily drills, weekly objectives, and progress tracking sheets.',
        type: 'TRAINING_PLAN' as any,
        category: 'Youth Development',
        priceGBP: 29.99,
        compareAtPrice: 49.99,
        features: [
          '12-week progressive training plan',
          'Age-specific drill variations (8-10, 11-13, 14-16)',
          'Video drill demonstrations (30+ videos)',
          'Progress tracking worksheets',
          'Parent guidance notes',
          'Lifetime access & free updates',
        ],
        isFeatured: true,
        isActive: true,
        pageContent: '<p>Everything a young player needs to improve systematically over 12 weeks, designed by professional coach Gus Sanches.</p>',
      },
      {
        name: "The Football Parent's Handbook",
        slug: 'football-parents-handbook',
        description: "The definitive guide for parents supporting young footballers. How to encourage without pressuring, understand talent development, and communicate with coaches.",
        type: 'EBOOK' as any,
        category: 'Parent Resources',
        priceGBP: 14.99,
        compareAtPrice: 24.99,
        features: [
          '80-page comprehensive guide',
          'Understanding the football development pathway',
          'How to support without adding pressure',
          'Communicating with coaches effectively',
          'Nutrition and recovery for young players',
          'Mental resilience building techniques',
        ],
        isFeatured: true,
        isActive: true,
      },
      {
        name: 'Speed & Agility Masterclass for Footballers',
        slug: 'speed-agility-masterclass',
        description: 'A complete video course covering speed training, agility ladders, reaction drills, and explosive movement — all specifically designed for football.',
        type: 'VIDEO_COURSE' as any,
        category: 'Physical Training',
        priceGBP: 39.99,
        compareAtPrice: 69.99,
        features: [
          '6 hours of HD video content',
          '40+ individual exercises',
          'Equipment guide (most drills need no equipment)',
          'Printable workout cards',
          '4-week speed programme',
          'Access to private community',
        ],
        isFeatured: true,
        isActive: true,
      },
      {
        name: 'Football Nutrition Guide & Meal Plans',
        slug: 'football-nutrition-guide',
        description: 'Science-backed nutrition strategies for football players. Pre-match meals, recovery nutrition, hydration protocols, and a full 4-week meal plan.',
        type: 'MEAL_PLAN' as any,
        category: 'Nutrition',
        priceGBP: 19.99,
        compareAtPrice: 34.99,
        features: [
          '4-week structured meal plan',
          'Pre and post-match nutrition protocols',
          'Hydration guide',
          'Budget-friendly meal options',
          'Supplement guide (what\'s worth it & what\'s not)',
          'Recipe collection (60+ recipes)',
        ],
        isFeatured: false,
        isActive: true,
      },
      {
        name: 'Academy Tryout Preparation Bundle',
        slug: 'academy-tryout-bundle',
        description: 'Everything you need to prepare for and succeed at football academy trials. Includes mental preparation, physical conditioning, and technical skills audit.',
        type: 'BUNDLE' as any,
        category: 'Performance',
        priceGBP: 59.99,
        compareAtPrice: 99.99,
        features: [
          'Everything in the 12-week training plan',
          'Mental performance workbook',
          'Self-assessment skills audit',
          'What scouts actually look for (insider guide)',
          '30-day trial-specific preparation programme',
          'Email support from Gus Sanches',
        ],
        isFeatured: true,
        isActive: true,
      },
    ];

    let created = 0;
    for (const product of products) {
      const existing = await this.prisma.digitalProduct.findUnique({
        where: { slug: product.slug },
      });
      if (!existing) {
        await this.prisma.digitalProduct.create({ data: { ...product, features: product.features || [] } });
        created++;
      }
    }

    this.logger.log(`Seeded ${created} digital products`);
    return { created };
  }

  private async generateSignedUrl(key: string): Promise<string> {
    const bucket = this.config.get<string>('AWS_S3_BUCKET');
    return this.s3.getSignedUrlPromise('getObject', {
      Bucket: bucket,
      Key: key,
      Expires: 7 * 24 * 60 * 60, // 7 days
    });
  }

  private async sendDownloadEmail(buyerEmail: string, product: any, downloadUrl?: string) {
    const fromEmail = this.config.get<string>('SENDGRID_FROM_EMAIL') || 'gus@sanchescoaching.co.uk';

    try {
      await sgMail.send({
        to: buyerEmail,
        from: { email: fromEmail, name: 'Gus Sanches | Sanches Coaching' },
        subject: `Your purchase: ${product.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; padding: 40px;">
            <h1 style="color: #b8832b;">Purchase Confirmed!</h1>
            <h2>${product.name}</h2>
            <p style="color: #ccc;">Thank you for your purchase. Here's your download link:</p>
            ${downloadUrl ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${downloadUrl}" style="background: #b8832b; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                  Download Your Purchase
                </a>
              </div>
              <p style="color: #888; font-size: 12px; text-align: center;">This link expires in 7 days. Please download your file promptly.</p>
            ` : '<p style="color: #ccc;">Your content will be available shortly. We\'ll send another email when it\'s ready.</p>'}
            <p style="color: #ccc; margin-top: 30px;">
              Questions? Reply to this email and I'll get back to you personally.<br><br>
              Gus Sanches<br>
              <em>Head Coach, Sanches Coaching</em>
            </p>
          </div>
        `,
      });
    } catch (err) {
      this.logger.error(`Failed to send download email: ${err.message}`);
    }
  }
}
