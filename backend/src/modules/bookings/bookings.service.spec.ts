import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../prisma/prisma.service';
import { CalendarService } from '../calendar/calendar.service';
import { NotificationsService } from '../notifications/notifications.service';
import { BookingStatus } from '@prisma/client';
import { addMinutes, addHours } from 'date-fns';

describe('BookingsService', () => {
  let service: BookingsService;
  let prismaService: PrismaService;
  let calendarService: CalendarService;

  const mockSessionConfig = {
    id: 'session-1',
    type: 'ONE_TO_ONE',
    name: '1-to-1 Session',
    duration: 60,
    price: 50,
    isActive: true,
  };

  const mockBooking = {
    id: 'booking-1',
    userId: 'user-1',
    sessionConfigId: 'session-1',
    startTime: addHours(new Date(), 48),
    endTime: addHours(new Date(), 49),
    status: BookingStatus.CONFIRMED,
    sessionConfig: mockSessionConfig,
    user: {
      id: 'user-1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
    },
  };

  const mockPrismaService = {
    sessionConfig: { findUnique: jest.fn() },
    booking: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
    availabilityBlock: { findMany: jest.fn() },
    workingHours: { findUnique: jest.fn() },
  };

  const mockCalendarService = {
    createEvent: jest.fn(),
    updateEvent: jest.fn(),
    deleteEvent: jest.fn(),
  };

  const mockNotificationsService = {
    sendBookingConfirmation: jest.fn(),
    sendBookingCancellation: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CalendarService, useValue: mockCalendarService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    prismaService = module.get<PrismaService>(PrismaService);
    calendarService = module.get<CalendarService>(CalendarService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a booking successfully', async () => {
      const createDto = {
        sessionConfigId: 'session-1',
        startTime: addHours(new Date(), 48).toISOString(),
      };

      mockPrismaService.sessionConfig.findUnique.mockResolvedValue(mockSessionConfig);
      mockPrismaService.booking.findMany.mockResolvedValue([]);
      mockPrismaService.availabilityBlock.findMany.mockResolvedValue([]);
      mockPrismaService.workingHours.findUnique.mockResolvedValue({
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '18:00',
        isActive: true,
      });
      mockPrismaService.booking.create.mockResolvedValue(mockBooking);
      mockCalendarService.createEvent.mockResolvedValue({ id: 'calendar-event-1' });

      const result = await service.create(createDto, 'user-1');

      expect(result).toBeDefined();
      expect(mockPrismaService.booking.create).toHaveBeenCalled();
      expect(mockCalendarService.createEvent).toHaveBeenCalled();
    });

    it('should throw error if booking time is too soon', async () => {
      const createDto = {
        sessionConfigId: 'session-1',
        startTime: addHours(new Date(), 12).toISOString(), // Less than 24 hours
      };

      mockPrismaService.sessionConfig.findUnique.mockResolvedValue(mockSessionConfig);

      await expect(service.create(createDto, 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error if time slot is not available', async () => {
      const createDto = {
        sessionConfigId: 'session-1',
        startTime: addHours(new Date(), 48).toISOString(),
      };

      mockPrismaService.sessionConfig.findUnique.mockResolvedValue(mockSessionConfig);
      mockPrismaService.booking.findMany.mockResolvedValue([mockBooking]); // Conflicting booking

      await expect(service.create(createDto, 'user-1')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('checkAvailability', () => {
    it('should return true if slot is available', async () => {
      const startTime = addHours(new Date(), 48);
      const endTime = addHours(startTime, 1);

      mockPrismaService.booking.findMany.mockResolvedValue([]);
      mockPrismaService.availabilityBlock.findMany.mockResolvedValue([]);
      mockPrismaService.workingHours.findUnique.mockResolvedValue({
        dayOfWeek: startTime.getDay(),
        startTime: '09:00',
        endTime: '18:00',
        isActive: true,
      });

      const result = await service.checkAvailability(startTime, endTime);

      expect(result).toBe(true);
    });

    it('should return false if slot has conflicting booking', async () => {
      const startTime = addHours(new Date(), 48);
      const endTime = addHours(startTime, 1);

      mockPrismaService.booking.findMany.mockResolvedValue([mockBooking]);

      const result = await service.checkAvailability(startTime, endTime);

      expect(result).toBe(false);
    });

    it('should return false if slot is blocked', async () => {
      const startTime = addHours(new Date(), 48);
      const endTime = addHours(startTime, 1);

      mockPrismaService.booking.findMany.mockResolvedValue([]);
      mockPrismaService.availabilityBlock.findMany.mockResolvedValue([
        {
          id: 'block-1',
          startTime,
          endTime,
          isBlocked: true,
        },
      ]);

      const result = await service.checkAvailability(startTime, endTime);

      expect(result).toBe(false);
    });

    it('should return false if outside working hours', async () => {
      const startTime = addHours(new Date(), 48);
      const endTime = addHours(startTime, 1);

      mockPrismaService.booking.findMany.mockResolvedValue([]);
      mockPrismaService.availabilityBlock.findMany.mockResolvedValue([]);
      mockPrismaService.workingHours.findUnique.mockResolvedValue(null);

      const result = await service.checkAvailability(startTime, endTime);

      expect(result).toBe(false);
    });
  });

  describe('cancel', () => {
    it('should cancel booking successfully', async () => {
      const cancelDto = { reason: 'Schedule conflict' };

      mockPrismaService.booking.findUnique.mockResolvedValue(mockBooking);
      mockPrismaService.booking.update.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.CANCELLED,
      });
      mockCalendarService.deleteEvent.mockResolvedValue(undefined);

      const result = await service.cancel('booking-1', cancelDto, 'user-1');

      expect(result.status).toBe(BookingStatus.CANCELLED);
      expect(mockCalendarService.deleteEvent).toHaveBeenCalled();
      expect(mockNotificationsService.sendBookingCancellation).toHaveBeenCalled();
    });

    it('should throw error if cancellation is too late', async () => {
      const soonBooking = {
        ...mockBooking,
        startTime: addHours(new Date(), 12), // Less than 24 hours
      };

      mockPrismaService.booking.findUnique.mockResolvedValue(soonBooking);

      await expect(
        service.cancel('booking-1', { reason: 'test' }, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error if user is not authorized', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue(mockBooking);

      await expect(
        service.cancel('booking-1', { reason: 'test' }, 'different-user'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
