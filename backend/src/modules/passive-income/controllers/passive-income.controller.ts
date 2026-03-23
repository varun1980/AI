import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { RevenueTrackingService } from '../services/revenue-tracking.service';
import { LeadCaptureService } from '../services/lead-capture.service';
import { EmailFunnelService } from '../services/email-funnel.service';
import { ContentGenerationService } from '../services/content-generation.service';
import { AffiliateService } from '../services/affiliate.service';
import { DigitalProductsService } from '../services/digital-products.service';
import { CreateLeadDto } from '../dto/create-lead.dto';
import { GenerateContentDto } from '../dto/generate-content.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

// Public routes (no auth)
@Controller('api/v1/passive-income')
export class PassiveIncomeController {
  constructor(
    private revenueTracking: RevenueTrackingService,
    private leadCapture: LeadCaptureService,
    private emailFunnel: EmailFunnelService,
    private contentGen: ContentGenerationService,
    private affiliateService: AffiliateService,
    private digitalProducts: DigitalProductsService,
  ) {}

  // ==================
  // PUBLIC ENDPOINTS
  // ==================

  // Lead capture — called from landing pages, blog posts, popups
  @Post('leads')
  async captureLead(@Body() dto: CreateLeadDto, @Req() req: Request) {
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];
    return this.leadCapture.captureLead(dto, ipAddress, userAgent);
  }

  // Unsubscribe
  @Get('unsubscribe')
  async unsubscribe(@Query('email') email: string) {
    await this.leadCapture.unsubscribe(email);
    return { message: 'Successfully unsubscribed' };
  }

  // Blog posts (public SEO content)
  @Get('blog')
  async getBlogPosts(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.contentGen.getPublishedPosts(+page, +limit);
  }

  @Get('blog/:slug')
  async getBlogPost(@Param('slug') slug: string) {
    return this.contentGen.getPostBySlug(slug);
  }

  // Digital products (public shop)
  @Get('shop')
  async getProducts(
    @Query('type') type?: string,
    @Query('featured') featured?: string,
  ) {
    return this.digitalProducts.getProducts(type, featured === 'true');
  }

  @Get('shop/:slug')
  async getProduct(@Param('slug') slug: string) {
    return this.digitalProducts.getProductBySlug(slug);
  }

  // Checkout
  @Post('shop/:productId/checkout')
  async createCheckout(
    @Param('productId') productId: string,
    @Body() body: { email: string; successUrl: string; cancelUrl: string },
  ) {
    return this.digitalProducts.createCheckoutSession(
      productId,
      body.email,
      body.successUrl,
      body.cancelUrl,
    );
  }

  // Order fulfilment after Stripe payment
  @Get('shop/fulfil/:sessionId')
  async fulfilOrder(@Param('sessionId') sessionId: string) {
    return this.digitalProducts.fulfillOrder(sessionId);
  }

  // Affiliate redirect (tracks click then redirects to affiliate URL)
  @Get('go/:trackingCode')
  async affiliateRedirect(
    @Param('trackingCode') trackingCode: string,
    @Query('leadId') leadId: string,
    @Req() req: Request,
  ) {
    const url = await this.affiliateService.trackClick(
      trackingCode,
      leadId,
      req.headers.referer,
      req.ip,
    );
    return { redirect: url };
  }

  // Affiliate products list
  @Get('affiliates')
  async getAffiliateProducts(
    @Query('category') category?: string,
    @Query('featured') featured?: string,
  ) {
    return this.affiliateService.getProducts(category as any, featured === 'true');
  }

  // ==================
  // ADMIN ENDPOINTS
  // ==================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/dashboard')
  async getDashboard() {
    return this.revenueTracking.getDashboardStats();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/revenue-chart')
  async getRevenueChart(@Query('period') period: 'week' | 'month' | 'year' = 'month') {
    return this.revenueTracking.getRevenueChart(period);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/passive-breakdown')
  async getPassiveBreakdown() {
    return this.revenueTracking.getPassiveIncomeBreakdown();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/leads')
  async getLeads(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: string,
  ) {
    return this.leadCapture.getLeads(+page, +limit, status as any);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/lead-stats')
  async getLeadStats() {
    return this.leadCapture.getLeadStats();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/email-stats')
  async getEmailStats() {
    return this.emailFunnel.getSequenceStats();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/affiliate-stats')
  async getAffiliateStats() {
    return this.affiliateService.getAffiliateStats();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/product-stats')
  async getProductStats() {
    return this.digitalProducts.getDigitalProductStats();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('admin/generate-content')
  async generateContent(@Body() dto: GenerateContentDto) {
    return this.contentGen.generateBlogPost(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('admin/publish-post/:id')
  async publishPost(@Param('id') id: string) {
    return this.contentGen.publishPost(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('admin/setup')
  async setupPassiveIncomeSystem() {
    // One-time setup: seeds products, sequences, etc.
    const [affiliates, products, sequence] = await Promise.all([
      this.affiliateService.seedDefaultProducts(),
      this.digitalProducts.seedDefaultProducts(),
      this.emailFunnel.createWelcomeSequence(),
    ]);

    return {
      message: 'Passive income system initialised successfully',
      affiliates,
      products,
      emailSequence: sequence,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('admin/trigger-emails')
  async triggerEmailProcessing() {
    return this.emailFunnel.processDueEmails();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('admin/bulk-generate-content')
  async bulkGenerateContent(@Body() body: { topics: string[] }) {
    return this.contentGen.bulkGenerateContentPlan(body.topics);
  }
}
