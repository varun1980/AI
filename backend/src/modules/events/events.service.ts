import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.EventCreateInput) {
    return this.prisma.event.create({ data });
  }

  async findAll(params?: { published?: boolean; upcoming?: boolean }) {
    const where: Prisma.EventWhereInput = {};

    if (params?.published) {
      where.isPublished = true;
    }

    if (params?.upcoming) {
      where.startDate = { gte: new Date() };
    }

    return this.prisma.event.findMany({
      where,
      orderBy: [{ isFeatured: 'desc' }, { startDate: 'asc' }],
    });
  }

  async findById(id: string) {
    return this.prisma.event.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.EventUpdateInput) {
    return this.prisma.event.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.event.delete({ where: { id } });
  }
}
