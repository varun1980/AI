import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AffiliateCategory } from '@prisma/client';

@Injectable()
export class AffiliateService {
  private readonly logger = new Logger(AffiliateService.name);

  constructor(private prisma: PrismaService) {}

  async trackClick(trackingCode: string, leadId?: string, sourceUrl?: string, ipAddress?: string) {
    const product = await this.prisma.affiliateProduct.findUnique({
      where: { trackingCode },
    });

    if (!product || !product.isActive) {
      throw new NotFoundException('Affiliate product not found');
    }

    // Record the click
    await this.prisma.affiliateClick.create({
      data: {
        productId: product.id,
        leadId,
        sourceUrl,
        ipAddress,
      },
    });

    // Increment click count
    await this.prisma.affiliateProduct.update({
      where: { id: product.id },
      data: { clickCount: { increment: 1 } },
    });

    this.logger.log(`Affiliate click: ${product.name} (${trackingCode})`);
    return product.affiliateUrl;
  }

  async recordConversion(trackingCode: string, conversionValue: number) {
    const product = await this.prisma.affiliateProduct.findUnique({
      where: { trackingCode },
    });

    if (!product) return;

    const commission =
      product.commissionType === 'PERCENTAGE'
        ? conversionValue * product.commissionRate
        : product.commissionRate;

    // Update the most recent click
    const recentClick = await this.prisma.affiliateClick.findFirst({
      where: { productId: product.id, converted: false },
      orderBy: { createdAt: 'desc' },
    });

    if (recentClick) {
      await this.prisma.affiliateClick.update({
        where: { id: recentClick.id },
        data: {
          converted: true,
          conversionValue,
          commissionEarned: commission,
          convertedAt: new Date(),
        },
      });
    }

    await this.prisma.affiliateProduct.update({
      where: { id: product.id },
      data: {
        conversionCount: { increment: 1 },
        totalEarnings: { increment: commission },
      },
    });

    // Record revenue
    await this.prisma.revenueRecord.create({
      data: {
        date: new Date(),
        source: 'AFFILIATE',
        amount: commission,
        currency: 'GBP',
        metadata: { productId: product.id, productName: product.name, commissionRate: product.commissionRate },
      },
    });

    this.logger.log(`Affiliate conversion: ${product.name} - earned £${commission.toFixed(2)}`);
    return { commission, product };
  }

  async getProducts(category?: AffiliateCategory, featured?: boolean) {
    return this.prisma.affiliateProduct.findMany({
      where: {
        isActive: true,
        ...(category ? { category } : {}),
        ...(featured !== undefined ? { isFeatured: featured } : {}),
      },
      orderBy: [{ isFeatured: 'desc' }, { totalEarnings: 'desc' }],
    });
  }

  async getFeaturedProducts() {
    return this.prisma.affiliateProduct.findMany({
      where: { isActive: true, isFeatured: true },
      orderBy: { totalEarnings: 'desc' },
      take: 6,
    });
  }

  async getAffiliateStats() {
    const products = await this.prisma.affiliateProduct.findMany({
      where: { isActive: true },
      orderBy: { totalEarnings: 'desc' },
    });

    const [totalClicks, totalConversions, totalEarnings] = await Promise.all([
      this.prisma.affiliateClick.count(),
      this.prisma.affiliateClick.count({ where: { converted: true } }),
      this.prisma.affiliateProduct.aggregate({ _sum: { totalEarnings: true } }),
    ]);

    const conversionRate = totalClicks > 0
      ? ((totalConversions / totalClicks) * 100).toFixed(1)
      : '0';

    return {
      products,
      totalClicks,
      totalConversions,
      conversionRate,
      totalEarnings: totalEarnings._sum.totalEarnings || 0,
    };
  }

  async seedDefaultProducts() {
    const defaultProducts = [
      {
        name: 'Nike Phantom Training Ball',
        description: 'Professional quality training ball used by Gus Sanches in all his coaching sessions. Excellent feel and durability.',
        category: AffiliateCategory.SPORTS_GEAR,
        brand: 'Nike',
        affiliateUrl: 'https://www.amazon.co.uk/dp/B0EXAMPLE1?tag=sanchescoach-21',
        trackingCode: 'NIKE-PHANTOM-BALL',
        commissionRate: 0.04,
        commissionType: 'PERCENTAGE',
        productPrice: 24.99,
        networkName: 'Amazon Associates',
        isFeatured: true,
        isActive: true,
      },
      {
        name: 'Adidas Copa Training Boots',
        description: "The boots Gus recommends for players at every level. Perfect balance of feel and durability for training.",
        category: AffiliateCategory.FOOTWEAR,
        brand: 'Adidas',
        affiliateUrl: 'https://www.amazon.co.uk/dp/B0EXAMPLE2?tag=sanchescoach-21',
        trackingCode: 'ADIDAS-COPA-BOOTS',
        commissionRate: 0.04,
        commissionType: 'PERCENTAGE',
        productPrice: 65.00,
        networkName: 'Amazon Associates',
        isFeatured: true,
        isActive: true,
      },
      {
        name: 'Football Resistance Bands Set',
        description: 'Essential for speed, agility and strength training. Used in Sanches Coaching sessions.',
        category: AffiliateCategory.TRAINING_EQUIPMENT,
        brand: 'ProFit',
        affiliateUrl: 'https://www.amazon.co.uk/dp/B0EXAMPLE3?tag=sanchescoach-21',
        trackingCode: 'RESIST-BANDS-SET',
        commissionRate: 0.06,
        commissionType: 'PERCENTAGE',
        productPrice: 19.99,
        networkName: 'Amazon Associates',
        isFeatured: true,
        isActive: true,
      },
      {
        name: 'SoccerMentor Online Coaching Platform',
        description: 'World-class online football coaching videos. Gus Sanches recommends this as between-session learning.',
        category: AffiliateCategory.ONLINE_COURSES,
        brand: 'SoccerMentor',
        affiliateUrl: 'https://www.soccermentor.com?ref=sanchescoaching',
        trackingCode: 'SOCCER-MENTOR-SUB',
        commissionRate: 0.30,
        commissionType: 'PERCENTAGE',
        productPrice: 15.99,
        networkName: 'SoccerMentor Affiliate',
        isFeatured: true,
        isActive: true,
      },
      {
        name: 'Lucozade Sport Nutrition Bundle',
        description: 'Proper nutrition is part of training. This bundle covers pre and post-session fuelling.',
        category: AffiliateCategory.NUTRITION,
        brand: 'Lucozade Sport',
        affiliateUrl: 'https://www.amazon.co.uk/dp/B0EXAMPLE4?tag=sanchescoach-21',
        trackingCode: 'LUCOZADE-BUNDLE',
        commissionRate: 0.04,
        commissionType: 'PERCENTAGE',
        productPrice: 28.99,
        networkName: 'Amazon Associates',
        isFeatured: false,
        isActive: true,
      },
      {
        name: 'Adidas Youth Training Kit',
        description: 'Full training kit set for youth players. Great value and professional look.',
        category: AffiliateCategory.APPAREL,
        brand: 'Adidas',
        affiliateUrl: 'https://www.amazon.co.uk/dp/B0EXAMPLE5?tag=sanchescoach-21',
        trackingCode: 'ADIDAS-YOUTH-KIT',
        commissionRate: 0.04,
        commissionType: 'PERCENTAGE',
        productPrice: 39.99,
        networkName: 'Amazon Associates',
        isFeatured: false,
        isActive: true,
      },
    ];

    let created = 0;
    for (const product of defaultProducts) {
      const existing = await this.prisma.affiliateProduct.findUnique({
        where: { trackingCode: product.trackingCode },
      });
      if (!existing) {
        await this.prisma.affiliateProduct.create({ data: product });
        created++;
      }
    }

    this.logger.log(`Seeded ${created} affiliate products`);
    return { created };
  }
}
