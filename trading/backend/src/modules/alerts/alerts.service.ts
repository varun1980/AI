import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { MarketDataService } from '../market-data/market-data.service';
import { EventEmitter } from 'events';
import Decimal from 'decimal.js';

@Injectable()
export class AlertsService extends EventEmitter {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    private prisma: PrismaService,
    private marketData: MarketDataService,
  ) {
    super();
  }

  async create(dto: { symbol: string; condition: string; targetPrice: number; message?: string }) {
    return this.prisma.priceAlert.create({
      data: {
        symbol: dto.symbol,
        condition: dto.condition as any,
        targetPrice: new Decimal(dto.targetPrice),
        message: dto.message,
      },
    });
  }

  async findAll() {
    return this.prisma.priceAlert.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string) {
    return this.prisma.priceAlert.delete({ where: { id } });
  }

  @Cron('*/5 * * * * *') // Every 5 seconds
  async checkAlerts() {
    const activeAlerts = await this.prisma.priceAlert.findMany({
      where: { isActive: true, isTriggered: false },
    });

    for (const alert of activeAlerts) {
      try {
        const price = await this.marketData.getPrice(alert.symbol);
        const target = parseFloat(alert.targetPrice.toString());
        let triggered = false;

        switch (alert.condition) {
          case 'ABOVE': triggered = price >= target; break;
          case 'BELOW': triggered = price <= target; break;
          case 'CROSSES_UP': triggered = price >= target; break;
          case 'CROSSES_DOWN': triggered = price <= target; break;
        }

        if (triggered) {
          await this.prisma.priceAlert.update({
            where: { id: alert.id },
            data: {
              isTriggered: true,
              triggeredAt: new Date(),
              triggeredPrice: new Decimal(price),
              isActive: false,
            },
          });

          this.emit('alert_triggered', {
            ...alert,
            triggeredPrice: price,
            triggeredAt: new Date().toISOString(),
          });

          this.logger.log(
            `Alert triggered: ${alert.symbol} ${alert.condition} $${target} @ $${price}`,
          );
        }
      } catch (e) {
        this.logger.error(`Alert check error: ${e.message}`);
      }
    }
  }
}
