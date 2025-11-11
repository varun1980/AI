import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Post('track')
  async track(@Body() dto: any) {
    return this.analyticsService.trackEvent(dto.eventType, dto.userId, dto.data, dto.sessionId);
  }

  @Get('revenue')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getRevenue(@Query('start') start: string, @Query('end') end: string) {
    return this.analyticsService.getRevenue(new Date(start), new Date(end));
  }

  @Get('utilization')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getUtilization(@Query('start') start: string, @Query('end') end: string) {
    return this.analyticsService.getUtilization(new Date(start), new Date(end));
  }

  @Get('metrics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getMetrics() {
    return this.analyticsService.getTopMetrics();
  }
}
