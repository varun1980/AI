import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2024-12-18.acacia',
    });
  }

  async createPaymentIntent(data: {
    amount: number;
    currency?: string;
    userId: string;
    bookingId?: string;
    packageId?: string;
    metadata?: Record<string, any>;
  }) {
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Create or retrieve Stripe customer
    let customerId = await this.getOrCreateStripeCustomer(user.email, user.id);

    // Create payment intent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(data.amount * 100), // Convert to cents
      currency: data.currency || 'gbp',
      customer: customerId,
      metadata: {
        userId: data.userId,
        bookingId: data.bookingId || '',
        packageId: data.packageId || '',
        ...data.metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Create payment record
    await this.prisma.payment.create({
      data: {
        userId: data.userId,
        bookingId: data.bookingId,
        packageId: data.packageId,
        stripePaymentId: paymentIntent.id,
        stripeCustomerId: customerId,
        amount: data.amount,
        currency: data.currency || 'gbp',
        status: PaymentStatus.PENDING,
        metadata: data.metadata,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  async handleWebhook(signature: string, rawBody: Buffer) {
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      throw new BadRequestException(`Webhook signature verification failed: ${err.message}`);
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;
      case 'charge.refunded':
        await this.handleRefund(event.data.object as Stripe.Charge);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const payment = await this.prisma.payment.findUnique({
      where: { stripePaymentId: paymentIntent.id },
      include: { booking: true },
    });

    if (!payment) {
      console.error('Payment not found:', paymentIntent.id);
      return;
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.SUCCEEDED },
    });

    // If associated with booking, confirm it
    if (payment.bookingId) {
      await this.prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'CONFIRMED' },
      });
    }
  }

  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
    await this.prisma.payment.updateMany({
      where: { stripePaymentId: paymentIntent.id },
      data: { status: PaymentStatus.FAILED },
    });
  }

  private async handleRefund(charge: Stripe.Charge) {
    const payment = await this.prisma.payment.findFirst({
      where: { stripePaymentId: charge.payment_intent as string },
    });

    if (payment) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.REFUNDED,
          refundAmount: charge.amount_refunded / 100,
          refundedAt: new Date(),
        },
      });
    }
  }

  async refundPayment(paymentId: string, amount?: number, reason?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    const refundAmount = amount || Number(payment.amount);

    const refund = await this.stripe.refunds.create({
      payment_intent: payment.stripePaymentId,
      amount: Math.round(refundAmount * 100),
      reason: 'requested_by_customer',
      metadata: {
        reason: reason || 'Refund requested',
      },
    });

    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: refundAmount >= Number(payment.amount)
          ? PaymentStatus.REFUNDED
          : PaymentStatus.PARTIALLY_REFUNDED,
        refundAmount: refundAmount,
        refundReason: reason,
        refundedAt: new Date(),
      },
    });

    return refund;
  }

  private async getOrCreateStripeCustomer(email: string, userId: string): Promise<string> {
    const existingPayment = await this.prisma.payment.findFirst({
      where: { userId, stripeCustomerId: { not: null } },
    });

    if (existingPayment?.stripeCustomerId) {
      return existingPayment.stripeCustomerId;
    }

    const customer = await this.stripe.customers.create({
      email,
      metadata: { userId },
    });

    return customer.id;
  }

  async getPaymentMethods(userId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { userId, stripeCustomerId: { not: null } },
    });

    if (!payment?.stripeCustomerId) {
      return [];
    }

    const paymentMethods = await this.stripe.paymentMethods.list({
      customer: payment.stripeCustomerId,
      type: 'card',
    });

    return paymentMethods.data;
  }
}
