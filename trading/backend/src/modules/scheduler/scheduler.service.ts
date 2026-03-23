import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { CoinbaseService } from '../coinbase/coinbase.service';
import { CreateScheduledOrderDto } from './scheduler.dto';
import * as cron from 'node-cron';
import Decimal from 'decimal.js';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);
  private cronJobs = new Map<string, cron.ScheduledTask>();

  constructor(
    private prisma: PrismaService,
    private orders: OrdersService,
    private coinbase: CoinbaseService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  async onModuleInit() {
    // Restore active scheduled orders on startup
    const active = await this.prisma.scheduledOrder.findMany({
      where: { isActive: true },
    });
    for (const order of active) {
      this.scheduleJob(order);
    }
    this.logger.log(`Restored ${active.length} scheduled orders`);
  }

  async create(dto: CreateScheduledOrderDto) {
    if (!cron.validate(dto.cronExpr)) {
      throw new Error(`Invalid cron expression: ${dto.cronExpr}`);
    }

    const scheduled = await this.prisma.scheduledOrder.create({
      data: {
        name: dto.name,
        symbol: dto.symbol,
        side: dto.side as any,
        orderType: dto.orderType as any,
        size: new Decimal(dto.size),
        limitPrice: dto.limitPrice ? new Decimal(dto.limitPrice) : null,
        stopLoss: dto.stopLoss ? new Decimal(dto.stopLoss) : null,
        takeProfit: dto.takeProfit ? new Decimal(dto.takeProfit) : null,
        cronExpr: dto.cronExpr,
        timezone: dto.timezone || 'UTC',
        riskPercent: dto.riskPercent ?? 2,
        maxRuns: dto.maxRuns || null,
        nextRunAt: this.getNextRunTime(dto.cronExpr),
      },
    });

    this.scheduleJob(scheduled);
    return scheduled;
  }

  async findAll() {
    return this.prisma.scheduledOrder.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { trades: true } } },
    });
  }

  async activate(id: string) {
    const order = await this.prisma.scheduledOrder.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Scheduled order not found');
    this.scheduleJob(order);
    return this.prisma.scheduledOrder.update({
      where: { id },
      data: { isActive: true, nextRunAt: this.getNextRunTime(order.cronExpr) },
    });
  }

  async deactivate(id: string) {
    this.stopJob(id);
    return this.prisma.scheduledOrder.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async remove(id: string) {
    this.stopJob(id);
    return this.prisma.scheduledOrder.delete({ where: { id } });
  }

  private scheduleJob(scheduledOrder: any) {
    this.stopJob(scheduledOrder.id); // remove existing if any

    const task = cron.schedule(
      scheduledOrder.cronExpr,
      () => this.executeScheduledOrder(scheduledOrder.id),
      {
        timezone: scheduledOrder.timezone || 'UTC',
      },
    );

    this.cronJobs.set(scheduledOrder.id, task);
    this.logger.log(
      `Scheduled order "${scheduledOrder.name}" registered: ${scheduledOrder.cronExpr}`,
    );
  }

  private stopJob(id: string) {
    const task = this.cronJobs.get(id);
    if (task) {
      task.stop();
      this.cronJobs.delete(id);
    }
  }

  private async executeScheduledOrder(id: string) {
    const scheduled = await this.prisma.scheduledOrder.findUnique({ where: { id } });
    if (!scheduled || !scheduled.isActive) return;

    // Check max runs
    if (scheduled.maxRuns !== null && scheduled.runCount >= scheduled.maxRuns) {
      this.logger.log(`Scheduled order ${id} reached max runs (${scheduled.maxRuns}). Deactivating.`);
      await this.deactivate(id);
      return;
    }

    this.logger.log(
      `Executing scheduled order "${scheduled.name}": ${scheduled.side} ${scheduled.size} ${scheduled.symbol}`,
    );

    try {
      const accounts = await this.coinbase.getAccounts();
      const usd = accounts.find((a) => a.currency === 'USD');
      const balance = parseFloat(usd?.availableBalance?.value || '10000');

      await this.orders.placeOrder(
        {
          symbol: scheduled.symbol,
          side: scheduled.side as any,
          orderType: scheduled.orderType as any,
          size: parseFloat(scheduled.size.toString()),
          limitPrice: scheduled.limitPrice ? parseFloat(scheduled.limitPrice.toString()) : undefined,
          stopLoss: scheduled.stopLoss ? parseFloat(scheduled.stopLoss.toString()) : undefined,
          takeProfit: scheduled.takeProfit ? parseFloat(scheduled.takeProfit.toString()) : undefined,
          riskPercent: parseFloat(scheduled.riskPercent.toString()),
          notes: `Scheduled: ${scheduled.name}`,
        },
        balance,
      );

      await this.prisma.scheduledOrder.update({
        where: { id },
        data: {
          runCount: { increment: 1 },
          lastRunAt: new Date(),
          nextRunAt: this.getNextRunTime(scheduled.cronExpr),
        },
      });
    } catch (e) {
      this.logger.error(`Scheduled order ${id} execution failed: ${e.message}`);
    }
  }

  private getNextRunTime(cronExpr: string): Date {
    // Simple next run estimation — add 1 minute as baseline
    return new Date(Date.now() + 60000);
  }
}
