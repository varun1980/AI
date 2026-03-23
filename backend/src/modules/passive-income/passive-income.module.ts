import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ContentGenerationService } from './services/content-generation.service';
import { LeadCaptureService } from './services/lead-capture.service';
import { EmailFunnelService } from './services/email-funnel.service';
import { AffiliateService } from './services/affiliate.service';
import { DigitalProductsService } from './services/digital-products.service';
import { RevenueTrackingService } from './services/revenue-tracking.service';
import { PassiveIncomeController } from './controllers/passive-income.controller';
import { AutomationScheduler } from './scheduler/automation.scheduler';

@Module({
  imports: [PrismaModule],
  controllers: [PassiveIncomeController],
  providers: [
    ContentGenerationService,
    LeadCaptureService,
    EmailFunnelService,
    AffiliateService,
    DigitalProductsService,
    RevenueTrackingService,
    AutomationScheduler,
  ],
  exports: [
    ContentGenerationService,
    LeadCaptureService,
    RevenueTrackingService,
  ],
})
export class PassiveIncomeModule {}
