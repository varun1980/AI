import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLeadDto } from '../dto/create-lead.dto';
import { LeadStatus, LeadSource } from '@prisma/client';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class LeadCaptureService {
  private readonly logger = new Logger(LeadCaptureService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    sgMail.setApiKey(this.config.get<string>('SENDGRID_API_KEY') || '');
  }

  async captureLead(dto: CreateLeadDto, ipAddress?: string, userAgent?: string) {
    // Check for existing lead
    const existing = await this.prisma.lead.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      // Update existing lead and re-enrol in sequences if they unsubscribed
      if (existing.status === LeadStatus.UNSUBSCRIBED) {
        throw new ConflictException('This email has unsubscribed');
      }

      // Re-trigger sequence for returning leads
      const updated = await this.prisma.lead.update({
        where: { id: existing.id },
        data: {
          firstName: dto.firstName || existing.firstName,
          tags: [...new Set([...(existing.tags || []), ...(dto.tags || [])])],
          lastActivityAt: new Date(),
        },
      });

      return { lead: updated, isNew: false };
    }

    // Create new lead
    const lead = await this.prisma.lead.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        source: dto.source || LeadSource.LANDING_PAGE,
        status: LeadStatus.NEW,
        tags: dto.tags || [],
        leadMagnetId: dto.leadMagnetId,
        ipAddress,
        userAgent,
        utmSource: dto.utmSource,
        utmMedium: dto.utmMedium,
        utmCampaign: dto.utmCampaign,
        referrer: dto.referrer,
        consentGiven: dto.consentGiven,
        consentDate: dto.consentGiven ? new Date() : null,
        score: this.calculateInitialScore(dto),
        lastActivityAt: new Date(),
      },
    });

    this.logger.log(`New lead captured: ${lead.email} (source: ${lead.source})`);

    // Trigger welcome sequence
    await this.enrolInSequence(lead.id, dto.leadMagnetId);

    // Send lead magnet delivery if applicable
    if (dto.leadMagnetId) {
      await this.deliverLeadMagnet(lead, dto.leadMagnetId);
    }

    // Track revenue analytics
    await this.trackLeadEvent(lead.id, 'LEAD_CAPTURED', { source: dto.source });

    return { lead, isNew: true };
  }

  async enrolInSequence(leadId: string, leadMagnetId?: string) {
    // Find applicable sequences
    const sequences = await this.prisma.emailSequence.findMany({
      where: {
        isActive: true,
        triggerEvent: 'LEAD_SIGNUP',
        ...(leadMagnetId ? { leadMagnetId } : {}),
      },
    });

    for (const sequence of sequences) {
      // Check not already enrolled
      const existing = await this.prisma.leadEmailStatus.findUnique({
        where: { leadId_sequenceId: { leadId, sequenceId: sequence.id } },
      });

      if (!existing) {
        // Enrol in sequence - first email scheduled immediately
        await this.prisma.leadEmailStatus.create({
          data: {
            leadId,
            sequenceId: sequence.id,
            currentStep: 0,
            status: 'ACTIVE',
            nextScheduledAt: new Date(), // Send immediately
          },
        });
        this.logger.log(`Lead ${leadId} enrolled in sequence ${sequence.id}`);
      }
    }
  }

  async deliverLeadMagnet(lead: any, leadMagnetId: string) {
    const magnet = await this.prisma.leadMagnet.findUnique({
      where: { id: leadMagnetId },
    });

    if (!magnet || !magnet.fileUrl) return;

    // Update download count
    await this.prisma.leadMagnet.update({
      where: { id: leadMagnetId },
      data: { signupCount: { increment: 1 } },
    });

    // Send delivery email via SendGrid
    const fromEmail = this.config.get<string>('SENDGRID_FROM_EMAIL') || 'gus@sanchescoaching.co.uk';
    const name = lead.firstName ? `, ${lead.firstName}` : '';

    try {
      await sgMail.send({
        to: lead.email,
        from: { email: fromEmail, name: 'Gus Sanches | Sanches Coaching' },
        subject: `Your free ${magnet.title} is here!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 40px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #b8832b; font-size: 28px;">Sanches Coaching</h1>
            </div>
            <h2 style="color: #ffffff;">Here's your free resource${name}!</h2>
            <p style="color: #cccccc; line-height: 1.6;">
              Thank you for downloading <strong style="color: #b8832b;">${magnet.title}</strong>.
              I've put together everything I know from years of professional coaching experience into this guide.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${magnet.fileUrl}" style="background: #b8832b; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
                Download Your Free Guide
              </a>
            </div>
            <p style="color: #cccccc; line-height: 1.6;">
              Over the next few days, I'll be sending you some of my best training tips and strategies.
              Keep an eye on your inbox!
            </p>
            <p style="color: #cccccc;">
              To your success on the pitch,<br>
              <strong style="color: #b8832b;">Gus Sanches</strong><br>
              <em>Head Coach, Sanches Coaching</em>
            </p>
            <hr style="border-color: #333; margin: 30px 0;">
            <p style="color: #666; font-size: 12px; text-align: center;">
              Sanches Coaching | London, UK<br>
              <a href="[UNSUBSCRIBE_URL]" style="color: #666;">Unsubscribe</a>
            </p>
          </div>
        `,
      });
      this.logger.log(`Lead magnet delivered to ${lead.email}`);
    } catch (err) {
      this.logger.error(`Failed to deliver lead magnet: ${err.message}`);
    }
  }

  async unsubscribe(email: string) {
    const lead = await this.prisma.lead.findUnique({ where: { email } });
    if (!lead) return;

    await this.prisma.lead.update({
      where: { email },
      data: { status: LeadStatus.UNSUBSCRIBED },
    });

    // Cancel all active sequences
    await this.prisma.leadEmailStatus.updateMany({
      where: { leadId: lead.id, status: 'ACTIVE' },
      data: { status: 'CANCELLED' },
    });

    this.logger.log(`Lead unsubscribed: ${email}`);
  }

  async getLeads(page = 1, limit = 20, status?: LeadStatus) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};

    const [leads, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          leadMagnet: { select: { title: true } },
          _count: {
            select: { emailStatuses: true, productPurchases: true },
          },
        },
      }),
      this.prisma.lead.count({ where }),
    ]);

    return { leads, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getLeadStats() {
    const [total, newToday, qualified, converted, unsubscribed] = await Promise.all([
      this.prisma.lead.count(),
      this.prisma.lead.count({
        where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      }),
      this.prisma.lead.count({ where: { status: LeadStatus.QUALIFIED } }),
      this.prisma.lead.count({ where: { status: LeadStatus.CONVERTED } }),
      this.prisma.lead.count({ where: { status: LeadStatus.UNSUBSCRIBED } }),
    ]);

    // Source breakdown
    const sourceBreakdown = await this.prisma.lead.groupBy({
      by: ['source'],
      _count: { _all: true },
    });

    return {
      total,
      newToday,
      qualified,
      converted,
      unsubscribed,
      conversionRate: total > 0 ? ((converted / total) * 100).toFixed(1) : '0',
      sourceBreakdown,
    };
  }

  async scoreAndQualifyLeads() {
    // Run nightly lead scoring job
    const leads = await this.prisma.lead.findMany({
      where: { status: { in: [LeadStatus.NEW, LeadStatus.NURTURING] } },
      include: {
        emailStatuses: true,
        productPurchases: true,
        affiliateClicks: true,
      },
    });

    for (const lead of leads) {
      let score = lead.score;

      // Score based on email engagement
      const totalOpens = lead.emailStatuses.reduce((s, e) => s + e.openCount, 0);
      const totalClicks = lead.emailStatuses.reduce((s, e) => s + e.clickCount, 0);
      score += totalOpens * 2 + totalClicks * 5;

      // Score based on purchases
      score += lead.productPurchases.length * 20;

      // Score based on affiliate clicks (shows buying intent)
      score += lead.affiliateClicks.length * 3;

      // Cap at 100
      score = Math.min(score, 100);

      // Determine status
      let newStatus = lead.status;
      if (score >= 50 && lead.status === LeadStatus.NEW) {
        newStatus = LeadStatus.NURTURING;
      } else if (score >= 75) {
        newStatus = LeadStatus.QUALIFIED;
      }

      if (score !== lead.score || newStatus !== lead.status) {
        await this.prisma.lead.update({
          where: { id: lead.id },
          data: { score, status: newStatus },
        });
      }
    }

    this.logger.log(`Scored ${leads.length} leads`);
  }

  private calculateInitialScore(dto: CreateLeadDto): number {
    let score = 10; // Base score for signing up
    if (dto.firstName) score += 5;
    if (dto.phone) score += 10;
    if (dto.leadMagnetId) score += 15;
    if (dto.utmSource) score += 5;
    return score;
  }

  private async trackLeadEvent(leadId: string, event: string, data: any) {
    await this.prisma.analyticsEvent.create({
      data: { eventType: event, data },
    });
  }
}
