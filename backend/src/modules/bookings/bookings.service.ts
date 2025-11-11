import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CalendarService } from '../calendar/calendar.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateBookingDto, UpdateBookingDto, CancelBookingDto } from './dto';
import { BookingStatus, Prisma } from '@prisma/client';
import { addMinutes, isAfter, isBefore, parseISO } from 'date-fns';

@Injectable()
export class BookingsService {
  private readonly MIN_NOTICE_HOURS = 24;
  private readonly BUFFER_MINUTES = 15;

  constructor(
    private prisma: PrismaService,
    private calendarService: CalendarService,
    private notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateBookingDto, userId: string) {
    // Get session configuration
    const sessionConfig = await this.prisma.sessionConfig.findUnique({
      where: { id: dto.sessionConfigId },
    });

    if (!sessionConfig || !sessionConfig.isActive) {
      throw new NotFoundException('Session type not found or inactive');
    }

    const startTime = parseISO(dto.startTime);
    const endTime = addMinutes(startTime, sessionConfig.duration);

    // Validate minimum notice period
    const minNoticeTime = addMinutes(new Date(), this.MIN_NOTICE_HOURS * 60);
    if (isBefore(startTime, minNoticeTime)) {
      throw new BadRequestException(
        `Bookings must be made at least ${this.MIN_NOTICE_HOURS} hours in advance`,
      );
    }

    // Check availability
    const isAvailable = await this.checkAvailability(startTime, endTime);
    if (!isAvailable) {
      throw new ConflictException('Selected time slot is not available');
    }

    // Create booking
    const booking = await this.prisma.booking.create({
      data: {
        userId,
        sessionConfigId: dto.sessionConfigId,
        startTime,
        endTime,
        status: BookingStatus.PENDING,
        notes: dto.notes,
        packageId: dto.packageId,
      },
      include: {
        sessionConfig: true,
        user: true,
      },
    });

    // Create Google Calendar event
    try {
      const calendarEvent = await this.calendarService.createEvent({
        summary: `${sessionConfig.name} - ${booking.user.firstName} ${booking.user.lastName}`,
        description: dto.notes || '',
        startTime,
        endTime,
        attendees: [booking.user.email],
      });

      // Update booking with Google Calendar event ID
      await this.prisma.booking.update({
        where: { id: booking.id },
        data: { googleEventId: calendarEvent.id },
      });
    } catch (error) {
      console.error('Failed to create calendar event:', error);
    }

    return booking;
  }

  async confirmBooking(bookingId: string) {
    const booking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CONFIRMED },
      include: {
        user: true,
        sessionConfig: true,
      },
    });

    // Send confirmation notification
    await this.notificationsService.sendBookingConfirmation(booking);

    return booking;
  }

  async findById(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        sessionConfig: true,
        user: true,
        payment: true,
        package: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async findByUser(userId: string, params?: { upcoming?: boolean; past?: boolean }) {
    const where: Prisma.BookingWhereInput = {
      userId,
    };

    if (params?.upcoming) {
      where.startTime = { gte: new Date() };
      where.status = { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] };
    }

    if (params?.past) {
      where.startTime = { lt: new Date() };
    }

    return this.prisma.booking.findMany({
      where,
      include: {
        sessionConfig: true,
        payment: true,
      },
      orderBy: {
        startTime: params?.past ? 'desc' : 'asc',
      },
    });
  }

  async cancel(id: string, dto: CancelBookingDto, userId: string) {
    const booking = await this.findById(id);

    if (booking.userId !== userId) {
      throw new BadRequestException('Unauthorized to cancel this booking');
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking already cancelled');
    }

    // Check cancellation policy (24 hours notice)
    const minCancelTime = addMinutes(new Date(), this.MIN_NOTICE_HOURS * 60);
    if (isBefore(booking.startTime, minCancelTime)) {
      throw new BadRequestException(
        `Bookings can only be cancelled at least ${this.MIN_NOTICE_HOURS} hours in advance`,
      );
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED,
        cancelledAt: new Date(),
        cancellationReason: dto.reason,
      },
      include: {
        user: true,
        sessionConfig: true,
      },
    });

    // Delete Google Calendar event
    if (booking.googleEventId) {
      try {
        await this.calendarService.deleteEvent(booking.googleEventId);
      } catch (error) {
        console.error('Failed to delete calendar event:', error);
      }
    }

    // Send cancellation notification
    await this.notificationsService.sendBookingCancellation(updatedBooking);

    return updatedBooking;
  }

  async reschedule(id: string, newStartTime: string, userId: string) {
    const booking = await this.findById(id);

    if (booking.userId !== userId) {
      throw new BadRequestException('Unauthorized to reschedule this booking');
    }

    const parsedNewStartTime = parseISO(newStartTime);
    const newEndTime = addMinutes(parsedNewStartTime, booking.sessionConfig.duration);

    // Check availability
    const isAvailable = await this.checkAvailability(parsedNewStartTime, newEndTime, id);
    if (!isAvailable) {
      throw new ConflictException('Selected time slot is not available');
    }

    // Update booking
    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: {
        startTime: parsedNewStartTime,
        endTime: newEndTime,
      },
      include: {
        user: true,
        sessionConfig: true,
      },
    });

    // Update Google Calendar event
    if (booking.googleEventId) {
      try {
        await this.calendarService.updateEvent(booking.googleEventId, {
          startTime: parsedNewStartTime,
          endTime: newEndTime,
        });
      } catch (error) {
        console.error('Failed to update calendar event:', error);
      }
    }

    return updatedBooking;
  }

  async checkAvailability(
    startTime: Date,
    endTime: Date,
    excludeBookingId?: string,
  ): Promise<boolean> {
    // Add buffer time
    const bufferedStartTime = addMinutes(startTime, -this.BUFFER_MINUTES);
    const bufferedEndTime = addMinutes(endTime, this.BUFFER_MINUTES);

    // Check for existing bookings
    const conflictingBookings = await this.prisma.booking.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                AND: [
                  { startTime: { lte: bufferedStartTime } },
                  { endTime: { gt: bufferedStartTime } },
                ],
              },
              {
                AND: [
                  { startTime: { lt: bufferedEndTime } },
                  { endTime: { gte: bufferedEndTime } },
                ],
              },
              {
                AND: [
                  { startTime: { gte: bufferedStartTime } },
                  { endTime: { lte: bufferedEndTime } },
                ],
              },
            ],
          },
          {
            status: {
              in: [BookingStatus.CONFIRMED, BookingStatus.PENDING],
            },
          },
          ...(excludeBookingId ? [{ id: { not: excludeBookingId } }] : []),
        ],
      },
    });

    if (conflictingBookings.length > 0) {
      return false;
    }

    // Check for blocked availability
    const blockedSlots = await this.prisma.availabilityBlock.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                AND: [
                  { startTime: { lte: bufferedStartTime } },
                  { endTime: { gt: bufferedStartTime } },
                ],
              },
              {
                AND: [
                  { startTime: { lt: bufferedEndTime } },
                  { endTime: { gte: bufferedEndTime } },
                ],
              },
              {
                AND: [
                  { startTime: { gte: bufferedStartTime } },
                  { endTime: { lte: bufferedEndTime } },
                ],
              },
            ],
          },
          { isBlocked: true },
        ],
      },
    });

    if (blockedSlots.length > 0) {
      return false;
    }

    // Check working hours
    const dayOfWeek = startTime.getDay();
    const workingHours = await this.prisma.workingHours.findUnique({
      where: { dayOfWeek, isActive: true },
    });

    if (!workingHours) {
      return false;
    }

    return true;
  }

  async getAvailableSlots(date: string, sessionConfigId: string) {
    const sessionConfig = await this.prisma.sessionConfig.findUnique({
      where: { id: sessionConfigId },
    });

    if (!sessionConfig) {
      throw new NotFoundException('Session type not found');
    }

    const targetDate = parseISO(date);
    const dayOfWeek = targetDate.getDay();

    // Get working hours for the day
    const workingHours = await this.prisma.workingHours.findUnique({
      where: { dayOfWeek, isActive: true },
    });

    if (!workingHours) {
      return [];
    }

    // Generate time slots
    const slots = [];
    const [startHour, startMinute] = workingHours.startTime.split(':').map(Number);
    const [endHour, endMinute] = workingHours.endTime.split(':').map(Number);

    let currentTime = new Date(targetDate);
    currentTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date(targetDate);
    endTime.setHours(endHour, endMinute, 0, 0);

    while (isBefore(currentTime, endTime)) {
      const slotEndTime = addMinutes(currentTime, sessionConfig.duration);

      if (isBefore(slotEndTime, endTime) || slotEndTime.getTime() === endTime.getTime()) {
        const isAvailable = await this.checkAvailability(currentTime, slotEndTime);

        slots.push({
          startTime: new Date(currentTime),
          endTime: new Date(slotEndTime),
          available: isAvailable,
        });
      }

      currentTime = addMinutes(currentTime, 30); // 30-minute intervals
    }

    return slots;
  }
}
