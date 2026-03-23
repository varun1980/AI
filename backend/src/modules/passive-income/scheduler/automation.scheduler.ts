import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailFunnelService } from '../services/email-funnel.service';
import { LeadCaptureService } from '../services/lead-capture.service';
import { ContentGenerationService } from '../services/content-generation.service';
import { ContentTopic } from '../dto/generate-content.dto';
import { ContentStatus } from '@prisma/client';

@Injectable()
export class AutomationScheduler {
  private readonly logger = new Logger(AutomationScheduler.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private emailFunnel: EmailFunnelService,
    private leadCapture: LeadCaptureService,
    private contentGen: ContentGenerationService,
  ) {}

  // Process email sequences every 30 minutes — the core of the passive income engine
  @Cron(CronExpression.EVERY_30_MINUTES)
  async processEmailSequences() {
    this.logger.log('Running email sequence processor...');
    try {
      const result = await this.emailFunnel.processDueEmails();
      if (result.sent > 0) {
        this.logger.log(`Email processor: sent ${result.sent}/${result.total} emails`);
      }
    } catch (err) {
      this.logger.error(`Email processor failed: ${err.message}`);
    }
  }

  // Score and qualify leads nightly at 2 AM
  @Cron('0 2 * * *')
  async runLeadScoring() {
    this.logger.log('Running lead scoring job...');
    try {
      await this.leadCapture.scoreAndQualifyLeads();
    } catch (err) {
      this.logger.error(`Lead scoring failed: ${err.message}`);
    }
  }

  // Generate new SEO blog post every Monday at 9 AM
  @Cron('0 9 * * 1')
  async generateWeeklyContent() {
    this.logger.log('Generating weekly SEO content...');
    try {
      const topics = this.getWeeklyTopics();
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];

      const post = await this.contentGen.generateBlogPost({
        title: randomTopic.title,
        topic: randomTopic.topic,
        focusKeyword: randomTopic.keyword,
        keywords: randomTopic.keywords,
        tone: 'educational and inspiring',
        wordCount: '1200',
        targetAudience: 'parents of young footballers and aspiring players in the UK',
      });

      this.logger.log(`Generated weekly blog post: "${post.title}"`);

      // Auto-publish if content quality threshold met
      if (post.content.length > 2000) {
        await this.contentGen.publishPost(post.id);
        this.logger.log(`Auto-published: "${post.title}"`);
      }
    } catch (err) {
      this.logger.error(`Weekly content generation failed: ${err.message}`);
    }
  }

  // Generate social media posts every Wednesday at 10 AM
  @Cron('0 10 * * 3')
  async generateSocialPosts() {
    this.logger.log('Generating social media posts...');
    try {
      const topics = [
        'The importance of consistent training',
        'How to prepare mentally for a big match',
        'Quick drill to improve ball control',
      ];

      for (const topic of topics) {
        for (const platform of ['TWITTER', 'INSTAGRAM'] as const) {
          const { caption, hashtags } = await this.contentGen.generateSocialPost(topic, platform);
          await this.prisma.socialPost.create({
            data: {
              platform,
              caption,
              hashtags,
              status: 'SCHEDULED',
              scheduledAt: new Date(Date.now() + Math.random() * 48 * 60 * 60 * 1000), // Random within 48h
            },
          });
        }
      }
      this.logger.log('Social posts generated and scheduled');
    } catch (err) {
      this.logger.error(`Social post generation failed: ${err.message}`);
    }
  }

  // Expire old download links daily at midnight
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async expireDownloadLinks() {
    const result = await this.prisma.digitalProductPurchase.updateMany({
      where: {
        downloadExpiry: { lt: new Date() },
        downloadUrl: { not: null },
      },
      data: { downloadUrl: null },
    });

    if (result.count > 0) {
      this.logger.log(`Expired ${result.count} download links`);
    }
  }

  // Revenue snapshot — record bookings revenue daily at 11 PM
  @Cron('0 23 * * *')
  async recordDailyRevenueSnapshot() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

      // Sum up today's bookings payments
      const bookingsRevenue = await this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'SUCCEEDED',
          createdAt: { gte: today, lt: tomorrow },
        },
      });

      const amount = (bookingsRevenue._sum.amount || 0) / 100; // Convert from pence

      if (amount > 0) {
        await this.prisma.revenueRecord.create({
          data: {
            date: today,
            source: 'BOOKINGS',
            amount,
            currency: 'GBP',
          },
        });
        this.logger.log(`Recorded bookings revenue: £${amount}`);
      }
    } catch (err) {
      this.logger.error(`Revenue snapshot failed: ${err.message}`);
    }
  }

  // Re-engage cold leads monthly (first of each month at 10 AM)
  @Cron('0 10 1 * *')
  async reEngageColdLeads() {
    this.logger.log('Running cold lead re-engagement campaign...');
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const coldLeads = await this.prisma.lead.findMany({
        where: {
          status: 'NURTURING',
          lastActivityAt: { lt: thirtyDaysAgo },
        },
        take: 200,
      });

      this.logger.log(`Found ${coldLeads.length} cold leads for re-engagement`);

      // Enrol in a re-engagement sequence
      const reEngageSequence = await this.prisma.emailSequence.findFirst({
        where: { triggerEvent: 'RE_ENGAGEMENT', isActive: true },
      });

      if (reEngageSequence) {
        for (const lead of coldLeads) {
          await this.leadCapture.enrolInSequence(lead.id);
        }
      }
    } catch (err) {
      this.logger.error(`Re-engagement campaign failed: ${err.message}`);
    }
  }

  private getWeeklyTopics() {
    return [
      {
        title: '10 Football Drills You Can Do Alone to Improve Faster',
        topic: ContentTopic.SKILL_DRILLS,
        keyword: 'football drills to do alone',
        keywords: ['football training', 'solo drills', 'improve football skills', 'football coaching'],
      },
      {
        title: 'How to Help Your Child Get Scouted: A Parent\'s Complete Guide',
        topic: ContentTopic.PARENT_GUIDE,
        keyword: 'how to get football scouted',
        keywords: ['football scouts', 'academy trials', 'youth football', 'football development'],
      },
      {
        title: 'The Best Pre-Match Meal for Young Footballers',
        topic: ContentTopic.NUTRITION,
        keyword: 'pre match meal football',
        keywords: ['football nutrition', 'sports diet', 'youth footballer', 'energy for football'],
      },
      {
        title: 'How to Improve Your First Touch in Football: 7 Proven Methods',
        topic: ContentTopic.FOOTBALL_TRAINING,
        keyword: 'improve first touch football',
        keywords: ['football technique', 'ball control', 'first touch drill', 'coaching tips'],
      },
      {
        title: 'Mental Strength in Football: How the Best Players Think',
        topic: ContentTopic.MENTAL_STRENGTH,
        keyword: 'mental strength football',
        keywords: ['football mindset', 'confidence in football', 'mental game', 'sports psychology'],
      },
      {
        title: 'Youth Football Development: What Every Parent Needs to Know',
        topic: ContentTopic.YOUTH_DEVELOPMENT,
        keyword: 'youth football development',
        keywords: ['youth football', 'football coaching', 'child football development', 'academy football'],
      },
      {
        title: 'How to Prevent the Most Common Football Injuries',
        topic: ContentTopic.INJURY_PREVENTION,
        keyword: 'prevent football injuries',
        keywords: ['football injuries', 'injury prevention', 'warm up football', 'football fitness'],
      },
    ];
  }
}
