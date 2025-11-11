import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prismaService: PrismaService;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
  };

  const mockPayment = {
    id: 'payment-1',
    userId: 'user-1',
    bookingId: 'booking-1',
    stripePaymentId: 'pi_123',
    stripeCustomerId: 'cus_123',
    amount: 50,
    currency: 'gbp',
    status: PaymentStatus.PENDING,
  };

  const mockPrismaService = {
    user: { findUnique: jest.fn() },
    payment: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    booking: { update: jest.fn() },
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-key'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPaymentIntent', () => {
    it('should create payment intent successfully', async () => {
      const paymentData = {
        amount: 50,
        currency: 'gbp',
        userId: 'user-1',
        bookingId: 'booking-1',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.payment.findFirst.mockResolvedValue(null);
      mockPrismaService.payment.create.mockResolvedValue(mockPayment);

      // Mock Stripe payment intent creation
      jest.spyOn(service as any, 'getOrCreateStripeCustomer').mockResolvedValue('cus_123');

      const result = await service.createPaymentIntent(paymentData);

      expect(result).toHaveProperty('clientSecret');
      expect(result).toHaveProperty('paymentIntentId');
      expect(mockPrismaService.payment.create).toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      const paymentData = {
        amount: 50,
        currency: 'gbp',
        userId: 'invalid-user',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.createPaymentIntent(paymentData)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('refundPayment', () => {
    it('should process refund successfully', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);
      mockPrismaService.payment.update.mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.REFUNDED,
      });

      const result = await service.refundPayment('payment-1', undefined, 'Customer request');

      expect(mockPrismaService.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'payment-1' },
          data: expect.objectContaining({
            status: PaymentStatus.REFUNDED,
          }),
        }),
      );
    });

    it('should throw error if payment not found', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(null);

      await expect(service.refundPayment('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
