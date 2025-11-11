import { Controller, Post, Get, Body, Headers, Req, UseGuards, RawBodyRequest } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('create-intent')
  @UseGuards(JwtAuthGuard)
  async createPaymentIntent(@Body() dto: any, @Req() req) {
    return this.paymentsService.createPaymentIntent({
      amount: dto.amount,
      currency: dto.currency,
      userId: req.user.id,
      bookingId: dto.bookingId,
      packageId: dto.packageId,
      metadata: dto.metadata,
    });
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    return this.paymentsService.handleWebhook(signature, req.rawBody);
  }

  @Get('payment-methods')
  @UseGuards(JwtAuthGuard)
  async getPaymentMethods(@Req() req) {
    return this.paymentsService.getPaymentMethods(req.user.id);
  }

  @Post('refund')
  @UseGuards(JwtAuthGuard)
  async refundPayment(@Body() dto: { paymentId: string; amount?: number; reason?: string }) {
    return this.paymentsService.refundPayment(dto.paymentId, dto.amount, dto.reason);
  }
}
