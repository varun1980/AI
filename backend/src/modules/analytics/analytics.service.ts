import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async trackEvent(eventType: string, userId?: string, data?: any, sessionId?: string) {
    return this.prisma.analyticsEvent.create({
      data: {
        eventType,
        userId,
        data,
        sessionId,
      },
    });
  }

  async getRevenue(startDate: Date, endDate: Date) {
    const payments = await this.prisma.payment.findMany({
      where: {
        status: 'SUCCEEDED',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const total = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    return { total, count: payments.length, payments };
  }

  async getUtilization(startDate: Date, endDate: Date) {
    const bookings = await this.prisma.booking.findMany({
      where: {
        startTime: {
          gte: startDate,
          lte: endDate,
        },
        status: { in: ['CONFIRMED', 'COMPLETED'] },
      },
    });

    const workingHours = await this.prisma.workingHours.findMany({
      where: { isActive: true },
    });

    // Simple calculation - can be enhanced
    const totalHours = workingHours.length * 8; // Approximate
    const bookedHours = bookings.length * 1; // Approximate

    return {
      utilizationRate: bookedHours / totalHours,
      bookedHours,
      totalHours,
    };
  }

  async getTopMetrics() {
    const totalBookings = await this.prisma.booking.count();
    const activePackages = await this.prisma.package.count({
      where: { isActive: true },
    });
    const totalRevenue = await this.prisma.payment.aggregate({
      where: { status: 'SUCCEEDED' },
      _sum: { amount: true },
    });

    return {
      totalBookings,
      activePackages,
      totalRevenue: Number(totalRevenue._sum.amount || 0),
    };
  }
}
