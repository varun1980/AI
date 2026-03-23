import { Controller, Get, Query } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';

@Controller('portfolio')
export class PortfolioController {
  constructor(private portfolio: PortfolioService) {}

  @Get('summary')
  getSummary() {
    return this.portfolio.getSummary();
  }

  @Get('performance')
  getPerformance(@Query('days') days: string) {
    return this.portfolio.getPerformance(parseInt(days || '30'));
  }
}
