import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalBookings,
      upcomingBookings,
      activePackages,
      revenueThisMonth,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: 'CLIENT' } }),
      this.prisma.booking.count(),
      this.prisma.booking.count({
        where: {
          startTime: { gte: new Date() },
          status: { in: ['CONFIRMED', 'PENDING'] },
        },
      }),
      this.prisma.package.count({ where: { isActive: true } }),
      this.prisma.payment.aggregate({
        where: {
          status: 'SUCCEEDED',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalUsers,
      totalBookings,
      upcomingBookings,
      activePackages,
      revenueThisMonth: Number(revenueThisMonth._sum.amount || 0),
    };
  }

  async getAllBookings(params?: { page?: number; limit?: number }) {
    const page = params?.page || 1;
    const limit = params?.limit || 20;

    const bookings = await this.prisma.booking.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: true,
        sessionConfig: true,
        payment: true,
      },
      orderBy: { startTime: 'desc' },
    });

    const total = await this.prisma.booking.count();

    return {
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAllUsers(params?: { page?: number; limit?: number }) {
    const page = params?.page || 1;
    const limit = params?.limit || 20;

    const users = await this.prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: {
        bookings: { take: 5, orderBy: { startTime: 'desc' } },
        packages: { where: { isActive: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.user.count();

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async exportData(type: 'bookings' | 'users' | 'payments') {
    switch (type) {
      case 'bookings':
        return this.prisma.booking.findMany({
          include: { user: true, sessionConfig: true, payment: true },
        });
      case 'users':
        return this.prisma.user.findMany({
          include: { bookings: true, packages: true, payments: true },
        });
      case 'payments':
        return this.prisma.payment.findMany({
          include: { user: true, booking: true, package: true },
        });
    }
  }
}
