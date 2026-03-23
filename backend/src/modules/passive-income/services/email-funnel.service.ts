import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { ContentGenerationService } from './content-generation.service';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class EmailFunnelService {
  private readonly logger = new Logger(EmailFunnelService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private contentGen: ContentGenerationService,
  ) {
    sgMail.setApiKey(this.config.get<string>('SENDGRID_API_KEY') || '');
  }

  // Process all due emails — called by scheduler
  async processDueEmails() {
    const now = new Date();

    const dueStatuses = await this.prisma.leadEmailStatus.findMany({
      where: {
        status: 'ACTIVE',
        nextScheduledAt: { lte: now },
      },
      include: {
        lead: true,
        sequence: {
          include: {
            emails: { orderBy: { stepNumber: 'asc' } },
          },
        },
      },
      take: 100, // Process in batches
    });

    this.logger.log(`Processing ${dueStatuses.length} due emails`);
    let sent = 0;

    for (const status of dueStatuses) {
      try {
        const nextEmail = status.sequence.emails.find(
          e => e.stepNumber === status.currentStep,
        );

        if (!nextEmail) {
          // Sequence complete
          await this.prisma.leadEmailStatus.update({
            where: { id: status.id },
            data: { status: 'COMPLETED', completedAt: new Date() },
          });
          continue;
        }

        await this.sendSequenceEmail(status.lead, nextEmail);

        // Calculate next email time
        const nextEmailInSeq = status.sequence.emails.find(
          e => e.stepNumber === status.currentStep + 1,
        );

        const nextScheduledAt = nextEmailInSeq
          ? new Date(Date.now() + nextEmailInSeq.delayDays * 24 * 60 * 60 * 1000)
          : null;

        await this.prisma.leadEmailStatus.update({
          where: { id: status.id },
          data: {
            currentStep: status.currentStep + 1,
            sentCount: { increment: 1 },
            lastSentAt: new Date(),
            nextScheduledAt,
            status: nextScheduledAt ? 'ACTIVE' : 'COMPLETED',
            completedAt: nextScheduledAt ? null : new Date(),
          },
        });

        // Update sequence stats
        await this.prisma.sequenceEmail.update({
          where: { id: nextEmail.id },
          data: { sentCount: { increment: 1 } },
        });

        sent++;
      } catch (err) {
        this.logger.error(`Failed to send email to ${status.lead.email}: ${err.message}`);
      }
    }

    this.logger.log(`Sent ${sent} emails`);
    return { sent, total: dueStatuses.length };
  }

  async sendSequenceEmail(lead: any, email: any) {
    const fromEmail = this.config.get<string>('SENDGRID_FROM_EMAIL') || 'gus@sanchescoaching.co.uk';
    const siteUrl = this.config.get<string>('SITE_URL') || 'https://sanchescoaching.co.uk';

    // Replace personalisation tokens
    const personalise = (str: string) =>
      str
        .replace(/\[FIRST_NAME\]/g, lead.firstName || 'there')
        .replace(/\[BOOKING_URL\]/g, `${siteUrl}/book`)
        .replace(/\[SHOP_URL\]/g, `${siteUrl}/shop`)
        .replace(/\[BLOG_URL\]/g, `${siteUrl}/blog`)
        .replace(/\[UNSUBSCRIBE_URL\]/g, `${siteUrl}/unsubscribe?email=${encodeURIComponent(lead.email)}`)
        .replace(/\[CTA_URL\]/g, email.ctaUrl || `${siteUrl}/book`);

    const html = personalise(email.htmlContent);
    const text = email.textContent ? personalise(email.textContent) : undefined;

    await sgMail.send({
      to: lead.email,
      from: { email: fromEmail, name: 'Gus Sanches | Sanches Coaching' },
      subject: personalise(email.subject),
      html,
      text,
    });

    this.logger.log(`Email sent to ${lead.email}: "${email.subject}"`);
  }

  async createWelcomeSequence(leadMagnetId?: string) {
    const sequence = await this.prisma.emailSequence.create({
      data: {
        name: 'Welcome & Nurture Sequence',
        description: 'Automated 7-email sequence to convert leads into booking clients',
        triggerEvent: 'LEAD_SIGNUP',
        isActive: true,
        ...(leadMagnetId ? { leadMagnetId } : {}),
      },
    });

    // Create the 7-email sequence
    const emails = [
      {
        stepNumber: 0,
        delayDays: 0,
        subject: 'Welcome to Sanches Coaching, [FIRST_NAME]! 🏆',
        previewText: 'Here\'s what to expect from me over the next week...',
        htmlContent: await this.buildWelcomeEmailHtml(),
        ctaText: 'Explore Our Programmes',
        ctaUrl: '[BOOKING_URL]',
      },
      {
        stepNumber: 1,
        delayDays: 2,
        subject: 'The #1 mistake young footballers make (and how to fix it)',
        previewText: 'After 10+ years coaching I\'ve seen this over and over...',
        htmlContent: await this.buildValueEmail1Html(),
        ctaText: 'Read More on the Blog',
        ctaUrl: '[BLOG_URL]',
      },
      {
        stepNumber: 2,
        delayDays: 4,
        subject: '[FIRST_NAME], a quick win for this weekend\'s training',
        previewText: 'One drill that will instantly improve first touch...',
        htmlContent: await this.buildValueEmail2Html(),
        ctaText: 'Download Free Training Plan',
        ctaUrl: '[SHOP_URL]',
      },
      {
        stepNumber: 3,
        delayDays: 6,
        subject: 'What separates good from great (a story)',
        previewText: 'I want to share something personal with you...',
        htmlContent: await this.buildStoryEmailHtml(),
        ctaText: 'Book a Free Assessment',
        ctaUrl: '[BOOKING_URL]',
      },
      {
        stepNumber: 4,
        delayDays: 9,
        subject: 'The gear I recommend to every player I coach',
        previewText: 'These 5 items made a huge difference for my players...',
        htmlContent: await this.buildAffiliateEmailHtml(),
        ctaText: 'See My Recommendations',
        ctaUrl: '[SHOP_URL]',
      },
      {
        stepNumber: 5,
        delayDays: 12,
        subject: 'Is 1-on-1 coaching right for [FIRST_NAME]?',
        previewText: 'Here\'s how to know if private coaching is worth it...',
        htmlContent: await this.buildSoftSellEmailHtml(),
        ctaText: 'View Coaching Packages',
        ctaUrl: '[BOOKING_URL]',
      },
      {
        stepNumber: 6,
        delayDays: 15,
        subject: '🔥 Special offer for subscribers only',
        previewText: 'I don\'t do this often, but...',
        htmlContent: await this.buildOfferEmailHtml(),
        ctaText: 'Claim Your Discount',
        ctaUrl: '[BOOKING_URL]',
      },
    ];

    for (const emailData of emails) {
      await this.prisma.sequenceEmail.create({
        data: {
          sequenceId: sequence.id,
          ...emailData,
        },
      });
    }

    this.logger.log(`Created welcome sequence with ${emails.length} emails`);
    return sequence;
  }

  async getSequenceStats() {
    const sequences = await this.prisma.emailSequence.findMany({
      include: {
        _count: { select: { emails: true, statuses: true } },
      },
    });

    const totalLeadsInSequences = await this.prisma.leadEmailStatus.count({
      where: { status: 'ACTIVE' },
    });

    const completedSequences = await this.prisma.leadEmailStatus.count({
      where: { status: 'COMPLETED' },
    });

    return { sequences, totalLeadsInSequences, completedSequences };
  }

  // Email template helpers
  private async buildWelcomeEmailHtml(): Promise<string> {
    return this.wrapEmail(`
      <h2 style="color: #b8832b;">Welcome to the Sanches Coaching family!</h2>
      <p>Hey [FIRST_NAME],</p>
      <p>I'm Gus Sanches, and I'm genuinely thrilled you're here.</p>
      <p>Whether you're a parent looking to help your child reach the next level, or a player who wants to develop their game — you've come to the right place.</p>
      <p>Over the next two weeks, I'll be sharing:</p>
      <ul>
        <li>✅ My most effective training drills (used with professional academy players)</li>
        <li>✅ The gear I actually recommend (and what to avoid)</li>
        <li>✅ Mental strategies that separate good players from great ones</li>
        <li>✅ A special subscriber-only offer</li>
      </ul>
      <p>Keep an eye on your inbox — the next email arrives in 2 days.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="[CTA_URL]" style="background: #b8832b; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold;">Explore Our Programmes</a>
      </div>
      <p>Gus 🏆</p>
    `);
  }

  private async buildValueEmail1Html(): Promise<string> {
    return this.wrapEmail(`
      <h2 style="color: #b8832b;">The #1 mistake I see in young footballers</h2>
      <p>Hey [FIRST_NAME],</p>
      <p>After coaching hundreds of young players, I keep seeing the same mistake over and over.</p>
      <p><strong style="color: #b8832b;">They train to look good, not to get better.</strong></p>
      <p>They want to do the fancy skills. They want to score goals in training. But they avoid the hard, boring fundamentals.</p>
      <p>The players who make it? They obsess over:</p>
      <ul>
        <li>First touch — receiving every ball cleanly under pressure</li>
        <li>Positioning — being in the right place before the ball arrives</li>
        <li>Decision speed — seeing the pass 2 moves ahead</li>
      </ul>
      <p>These aren't glamorous. But they're what scouts, coaches, and academies look for.</p>
      <p>This week, try this: In every training session, focus <em>only</em> on your first touch. Count how many times you control the ball perfectly vs. how many times it runs away from you. Just that awareness will start to change your game.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="[CTA_URL]" style="background: #b8832b; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold;">More Tips on the Blog</a>
      </div>
      <p>More soon,<br>Gus</p>
    `);
  }

  private async buildValueEmail2Html(): Promise<string> {
    return this.wrapEmail(`
      <h2 style="color: #b8832b;">One drill for instant improvement</h2>
      <p>Hey [FIRST_NAME],</p>
      <p>Here's my favourite quick-win drill: <strong>The Wall Bounce.</strong></p>
      <p><strong>What you need:</strong> A ball, a wall, 15 minutes.</p>
      <p><strong>The drill:</strong></p>
      <ol>
        <li>Stand 5 metres from a wall</li>
        <li>Pass the ball against the wall with your weaker foot</li>
        <li>Receive with your stronger foot — one touch to control</li>
        <li>Pass again with your weaker foot</li>
        <li>20 reps, then switch feet</li>
      </ol>
      <p>Do this for 15 minutes every day for 30 days. I guarantee you'll notice a difference.</p>
      <p>Want more structured training like this? I've put together a complete 4-week training plan you can download for free.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="[CTA_URL]" style="background: #b8832b; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold;">Download Free Training Plan</a>
      </div>
      <p>Gus</p>
    `);
  }

  private async buildStoryEmailHtml(): Promise<string> {
    return this.wrapEmail(`
      <h2 style="color: #b8832b;">What separates good from great</h2>
      <p>Hey [FIRST_NAME],</p>
      <p>I want to share a story about one of my players — let's call him Marcus.</p>
      <p>When Marcus first came to me, he was technically solid. Good technique, fit, worked hard. But he wasn't getting called up for the school team.</p>
      <p>We discovered the issue wasn't technical — it was <strong>confidence under pressure</strong>. When coaches watched him, his performance dropped.</p>
      <p>We spent 6 weeks working on his mental game alongside his technical skills. Specific pressure drills. Pre-match routines. Self-talk techniques.</p>
      <p>Three months later, he made the regional squad.</p>
      <p>The physical and technical skills got him close. The mental work got him there.</p>
      <p>If you want to find out what's holding you or your child back, a 1-hour assessment session can give you complete clarity on what to work on next.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="[CTA_URL]" style="background: #b8832b; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold;">Book a Free Assessment</a>
      </div>
      <p>Gus</p>
    `);
  }

  private async buildAffiliateEmailHtml(): Promise<string> {
    return this.wrapEmail(`
      <h2 style="color: #b8832b;">The gear I actually recommend</h2>
      <p>Hey [FIRST_NAME],</p>
      <p>I get asked all the time: "What gear should I buy?"</p>
      <p>So here's my honest list — no sponsored posts, just what I recommend to every player I work with:</p>
      <ul>
        <li>⚽ <strong>Training ball:</strong> Nike Flight or Adidas Tango — both are excellent for feel and durability</li>
        <li>👟 <strong>Training boots:</strong> Don't overspend. A mid-range Nike Mercurial or Adidas Copa beats expensive ones for training</li>
        <li>🎽 <strong>Training bibs:</strong> Buy 4. Seriously, they make solo training 10x more useful</li>
        <li>📱 <strong>Filming:</strong> A cheap tripod + your phone is all you need to analyse your own game</li>
        <li>📔 <strong>Training journal:</strong> Write down 1 thing you did well and 1 thing to improve after every session</li>
      </ul>
      <p>I've put together links to exactly what I recommend in my shop — and some of them have affiliate deals that help support this coaching community.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="[CTA_URL]" style="background: #b8832b; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold;">See My Recommendations</a>
      </div>
      <p>Gus</p>
    `);
  }

  private async buildSoftSellEmailHtml(): Promise<string> {
    return this.wrapEmail(`
      <h2 style="color: #b8832b;">Is 1-on-1 coaching right for you?</h2>
      <p>Hey [FIRST_NAME],</p>
      <p>I'll be honest with you — private coaching isn't for everyone.</p>
      <p>It's right for you if:</p>
      <ul>
        <li>✅ You want to fast-track development (group sessions can't give individual attention)</li>
        <li>✅ You have specific weaknesses you want to target</li>
        <li>✅ You're serious about making a team, playing at a higher level, or being scouted</li>
        <li>✅ You're committed to consistent practice outside sessions</li>
      </ul>
      <p>It might <em>not</em> be right for you if you just want casual, fun football. And that's completely fine!</p>
      <p>But if you're serious — I have limited slots available and they fill up fast, especially before tryout season.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="[CTA_URL]" style="background: #b8832b; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Coaching Packages & Availability</a>
      </div>
      <p>Gus</p>
    `);
  }

  private async buildOfferEmailHtml(): Promise<string> {
    return this.wrapEmail(`
      <h2 style="color: #b8832b;">A special offer — just for you</h2>
      <p>Hey [FIRST_NAME],</p>
      <p>I rarely do this.</p>
      <p>But because you've been following along and engaging with my content, I want to offer you something exclusive.</p>
      <p><strong style="color: #b8832b;">Book your first 1-to-1 session this week and get 20% off.</strong></p>
      <p>Use code <strong>SUBSCRIBER20</strong> at checkout.</p>
      <p>This offer expires in 48 hours and isn't available anywhere else.</p>
      <p>Whether it's a full programme or just a single assessment, use this to get started at a lower price.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="[CTA_URL]" style="background: #b8832b; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold;">Claim 20% Off →</a>
      </div>
      <p>See you on the pitch,<br>Gus</p>
    `);
  }

  private wrapEmail(content: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 40px;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #b8832b; padding-bottom: 20px;">
          <h1 style="color: #b8832b; font-size: 24px; margin: 0;">SANCHES COACHING</h1>
          <p style="color: #666; margin: 5px 0 0; font-size: 12px;">PREMIUM FOOTBALL COACHING | LONDON</p>
        </div>
        <div style="line-height: 1.7; color: #cccccc;">
          ${content}
        </div>
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #333; text-align: center;">
          <p style="color: #555; font-size: 12px;">
            Sanches Coaching | London, UK<br>
            <a href="[UNSUBSCRIBE_URL]" style="color: #555;">Unsubscribe</a> |
            <a href="https://sanchescoaching.co.uk" style="color: #555;">Website</a>
          </p>
        </div>
      </div>
    `;
  }
}
