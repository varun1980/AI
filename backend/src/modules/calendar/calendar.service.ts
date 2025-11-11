import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CalendarService {
  private calendar;
  private auth;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.initializeCalendar();
  }

  private async initializeCalendar() {
    try {
      this.auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(this.configService.get('GOOGLE_SERVICE_ACCOUNT_KEY') || '{}'),
        scopes: ['https://www.googleapis.com/auth/calendar'],
      });

      this.calendar = google.calendar({ version: 'v3', auth: this.auth });
      console.log('✅ Google Calendar initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Google Calendar:', error.message);
    }
  }

  async createEvent(data: {
    summary: string;
    description: string;
    startTime: Date;
    endTime: Date;
    attendees?: string[];
  }) {
    const event = {
      summary: data.summary,
      description: data.description,
      start: {
        dateTime: data.startTime.toISOString(),
        timeZone: 'Europe/London',
      },
      end: {
        dateTime: data.endTime.toISOString(),
        timeZone: 'Europe/London',
      },
      attendees: data.attendees?.map((email) => ({ email })) || [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 60 },
        ],
      },
    };

    const response = await this.calendar.events.insert({
      calendarId: this.configService.get('GOOGLE_CALENDAR_ID'),
      requestBody: event,
      sendUpdates: 'all',
    });

    return response.data;
  }

  async updateEvent(
    eventId: string,
    data: {
      summary?: string;
      description?: string;
      startTime?: Date;
      endTime?: Date;
    },
  ) {
    const event: any = {};

    if (data.summary) event.summary = data.summary;
    if (data.description) event.description = data.description;
    if (data.startTime) {
      event.start = {
        dateTime: data.startTime.toISOString(),
        timeZone: 'Europe/London',
      };
    }
    if (data.endTime) {
      event.end = {
        dateTime: data.endTime.toISOString(),
        timeZone: 'Europe/London',
      };
    }

    const response = await this.calendar.events.patch({
      calendarId: this.configService.get('GOOGLE_CALENDAR_ID'),
      eventId,
      requestBody: event,
      sendUpdates: 'all',
    });

    return response.data;
  }

  async deleteEvent(eventId: string) {
    await this.calendar.events.delete({
      calendarId: this.configService.get('GOOGLE_CALENDAR_ID'),
      eventId,
      sendUpdates: 'all',
    });
  }

  async getEvents(startDate: Date, endDate: Date) {
    const response = await this.calendar.events.list({
      calendarId: this.configService.get('GOOGLE_CALENDAR_ID'),
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items || [];
  }

  async createAvailabilityBlock(data: {
    startTime: Date;
    endTime: Date;
    reason: string;
    isBlocked: boolean;
  }) {
    // Create in database
    const block = await this.prisma.availabilityBlock.create({
      data: {
        startTime: data.startTime,
        endTime: data.endTime,
        reason: data.reason,
        isBlocked: data.isBlocked,
      },
    });

    // Create in Google Calendar if blocked
    if (data.isBlocked) {
      const event = await this.createEvent({
        summary: `BLOCKED: ${data.reason}`,
        description: data.reason,
        startTime: data.startTime,
        endTime: data.endTime,
      });

      await this.prisma.availabilityBlock.update({
        where: { id: block.id },
        data: { googleEventId: event.id },
      });
    }

    return block;
  }

  async removeAvailabilityBlock(blockId: string) {
    const block = await this.prisma.availabilityBlock.findUnique({
      where: { id: blockId },
    });

    if (block?.googleEventId) {
      await this.deleteEvent(block.googleEventId);
    }

    return this.prisma.availabilityBlock.delete({
      where: { id: blockId },
    });
  }
}
