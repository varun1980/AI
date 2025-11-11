import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PackageType } from '@prisma/client';
import { addWeeks } from 'date-fns';

@Injectable()
export class PackagesService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    userId: string;
    type: PackageType;
    preferredDay?: string;
    preferredTime?: string;
  }) {
    const pricing = this.getPackagePricing(data.type);

    return this.prisma.package.create({
      data: {
        userId: data.userId,
        type: data.type,
        totalSessions: pricing.sessions,
        price: pricing.price,
        discount: pricing.discount,
        preferredDay: data.preferredDay,
        preferredTime: data.preferredTime,
        expiresAt: addWeeks(new Date(), pricing.sessions + 4), // Extra buffer
      },
    });
  }

  async findById(id: string) {
    return this.prisma.package.findUnique({
      where: { id },
      include: {
        user: true,
        bookings: {
          include: { sessionConfig: true },
          orderBy: { startTime: 'asc' },
        },
        payment: true,
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.package.findMany({
      where: { userId, isActive: true },
      include: {
        bookings: {
          include: { sessionConfig: true },
        },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async useSession(packageId: string, bookingId: string) {
    const pkg = await this.findById(packageId);

    if (!pkg) {
      throw new BadRequestException('Package not found');
    }

    if (pkg.usedSessions >= pkg.totalSessions) {
      throw new BadRequestException('No sessions remaining in package');
    }

    if (!pkg.isActive) {
      throw new BadRequestException('Package is inactive');
    }

    return this.prisma.package.update({
      where: { id: packageId },
      data: {
        usedSessions: { increment: 1 },
      },
    });
  }

  private getPackagePricing(type: PackageType) {
    const basePricePerSession = 50;

    switch (type) {
      case PackageType.SIX_WEEK:
        return {
          sessions: 6,
          price: basePricePerSession * 6 * 0.9, // 10% discount
          discount: basePricePerSession * 6 * 0.1,
        };
      case PackageType.TEN_WEEK:
        return {
          sessions: 10,
          price: basePricePerSession * 10 * 0.85, // 15% discount
          discount: basePricePerSession * 10 * 0.15,
        };
      default:
        throw new BadRequestException('Invalid package type');
    }
  }

  async getRemainingBalance(packageId: string) {
    const pkg = await this.findById(packageId);
    return {
      total: pkg.totalSessions,
      used: pkg.usedSessions,
      remaining: pkg.totalSessions - pkg.usedSessions,
    };
  }
}
