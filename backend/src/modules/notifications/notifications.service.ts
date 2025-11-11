import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';
import * as twilio from 'twilio';
import { PrismaService } from '../prisma/prisma.service';
import * as ics from 'ics';

@Injectable()
export class NotificationsService {
  private twilioClient;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    sgMail.setApiKey(this.configService.get('SENDGRID_API_KEY') || '');

    this.twilioClient = twilio(
      this.configService.get('TWILIO_ACCOUNT_SID'),
      this.configService.get('TWILIO_AUTH_TOKEN'),
    );
  }

  async sendBookingConfirmation(booking: any) {
    const { user, sessionConfig, startTime, endTime } = booking;

    // Generate ICS file
    const calendarEvent = this.generateICS({
      title: `${sessionConfig.name} - Sanches Coaching`,
      start: startTime,
      end: endTime,
      description: `Your ${sessionConfig.name} session with Gus Sanches`,
      location: 'TBD',
    });

    // Send email
    await this.sendEmail({
      to: user.email,
      subject: 'Booking Confirmed - Sanches Coaching',
      html: `
        <h1>Booking Confirmed</h1>
        <p>Hi ${user.firstName},</p>
        <p>Your ${sessionConfig.name} session has been confirmed!</p>
        <p><strong>Date & Time:</strong> ${new Date(startTime).toLocaleString('en-GB')}</p>
        <p>See you there!</p>
        <p>Best regards,<br>Gus Sanches</p>
      `,
      attachments: [
        {
          content: Buffer.from(calendarEvent).toString('base64'),
          filename: 'booking.ics',
          type: 'text/calendar',
          disposition: 'attachment',
        },
      ],
    });

    // Send SMS if phone is available
    if (user.phone) {
      await this.sendSMS({
        to: user.phone,
        message: `Hi ${user.firstName}, your ${sessionConfig.name} session on ${new Date(startTime).toLocaleString('en-GB')} is confirmed!`,
      });
    }

    // Log notification
    await this.logNotification(user.id, 'BOOKING_CONFIRMED', 'Booking confirmation sent');
  }

  async sendBookingCancellation(booking: any) {
    const { user, sessionConfig } = booking;

    await this.sendEmail({
      to: user.email,
      subject: 'Booking Cancelled - Sanches Coaching',
      html: `
        <h1>Booking Cancelled</h1>
        <p>Hi ${user.firstName},</p>
        <p>Your ${sessionConfig.name} session has been cancelled.</p>
        <p>If you have any questions, please contact us.</p>
        <p>Best regards,<br>Gus Sanches</p>
      `,
    });

    await this.logNotification(user.id, 'BOOKING_CANCELLED', 'Booking cancellation sent');
  }

  async sendBookingReminder(booking: any) {
    const { user, sessionConfig, startTime } = booking;

    await this.sendEmail({
      to: user.email,
      subject: 'Reminder: Upcoming Session - Sanches Coaching',
      html: `
        <h1>Session Reminder</h1>
        <p>Hi ${user.firstName},</p>
        <p>This is a reminder about your upcoming ${sessionConfig.name} session.</p>
        <p><strong>Date & Time:</strong> ${new Date(startTime).toLocaleString('en-GB')}</p>
        <p>Looking forward to seeing you!</p>
        <p>Best regards,<br>Gus Sanches</p>
      `,
    });

    if (user.phone) {
      await this.sendSMS({
        to: user.phone,
        message: `Reminder: Your ${sessionConfig.name} session is tomorrow at ${new Date(startTime).toLocaleTimeString('en-GB')}!`,
      });
    }

    await this.logNotification(user.id, 'REMINDER_24H', 'Session reminder sent');
  }

  private async sendEmail(data: {
    to: string;
    subject: string;
    html: string;
    attachments?: any[];
  }) {
    try {
      await sgMail.send({
        from: this.configService.get('SENDGRID_FROM_EMAIL') || 'noreply@sanchescoaching.co.uk',
        to: data.to,
        subject: data.subject,
        html: data.html,
        attachments: data.attachments,
      });
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }

  private async sendSMS(data: { to: string; message: string }) {
    try {
      await this.twilioClient.messages.create({
        from: this.configService.get('TWILIO_PHONE_NUMBER'),
        to: data.to,
        body: data.message,
      });
    } catch (error) {
      console.error('Failed to send SMS:', error);
    }
  }

  private generateICS(data: {
    title: string;
    start: Date;
    end: Date;
    description: string;
    location: string;
  }) {
    const event = {
      start: [
        data.start.getFullYear(),
        data.start.getMonth() + 1,
        data.start.getDate(),
        data.start.getHours(),
        data.start.getMinutes(),
      ] as [number, number, number, number, number],
      end: [
        data.end.getFullYear(),
        data.end.getMonth() + 1,
        data.end.getDate(),
        data.end.getHours(),
        data.end.getMinutes(),
      ] as [number, number, number, number, number],
      title: data.title,
      description: data.description,
      location: data.location,
      status: 'CONFIRMED' as const,
      busyStatus: 'BUSY' as const,
      organizer: { name: 'Gus Sanches', email: 'gus@sanchescoaching.co.uk' },
    };

    const { error, value } = ics.createEvent(event);
    if (error) {
      console.error('Failed to create ICS:', error);
      return '';
    }
    return value || '';
  }

  private async logNotification(userId: string, type: string, message: string) {
    await this.prisma.userNotification.create({
      data: {
        userId,
        type,
        message,
        sentAt: new Date(),
      },
    });
  }
}
