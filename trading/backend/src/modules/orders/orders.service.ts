import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CoinbaseService } from '../coinbase/coinbase.service';
import { RiskService } from '../risk/risk.service';
import { MarketDataService } from '../market-data/market-data.service';
import { PlaceOrderDto } from './orders.dto';
import { v4 as uuidv4 } from 'uuid';
import Decimal from 'decimal.js';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  // Track open stop-loss monitors: orderId -> intervalId
  private stopMonitors = new Map<string, NodeJS.Timeout>();

  constructor(
    private prisma: PrismaService,
    private coinbase: CoinbaseService,
    private risk: RiskService,
    private marketData: MarketDataService,
  ) {
    // Listen for fills to update positions & trigger trailing stops
    this.coinbase.on('orderUpdate', (order) => this.handleOrderUpdate(order));
  }

  async placeOrder(dto: PlaceOrderDto, accountBalance?: number): Promise<any> {
    // Get current price
    const ticker = await this.coinbase.getTicker(dto.symbol);
    const entryPrice = dto.limitPrice || ticker.price;

    // Determine account balance
    const balance = accountBalance ?? await this.getUsdBalance();

    // Risk assessment (enforces 5% max loss)
    const assessment = this.risk.assessRisk({
      side: dto.side,
      symbol: dto.symbol,
      size: dto.size,
      entryPrice,
      stopLoss: dto.stopLoss,
      riskPercent: dto.riskPercent ?? 2,
      accountBalance: balance,
    });

    if (!assessment.approved) {
      throw new BadRequestException(`Risk check failed: ${assessment.rejectionReason}`);
    }

    if (assessment.warnings.length > 0) {
      this.logger.warn(`Risk warnings for ${dto.symbol}: ${assessment.warnings.join('; ')}`);
    }

    const clientOrderId = uuidv4();

    // Place order on exchange
    const order = await this.coinbase.placeOrder({
      clientOrderId,
      productId: dto.symbol,
      side: dto.side,
      orderType: dto.orderType,
      baseSize: dto.size.toString(),
      limitPrice: dto.limitPrice?.toString(),
    });

    // Record trade in DB
    const trade = await this.prisma.trade.create({
      data: {
        orderId: order.orderId,
        clientOrderId,
        symbol: dto.symbol,
        side: dto.side as any,
        orderType: dto.orderType as any,
        requestedSize: new Decimal(dto.size),
        filledSize: order.filledSize ? new Decimal(order.filledSize) : null,
        requestedPrice: dto.limitPrice ? new Decimal(dto.limitPrice) : null,
        avgFillPrice: order.avgFillPrice ? new Decimal(order.avgFillPrice) : null,
        stopLoss: new Decimal(assessment.stopLossPrice),
        takeProfit: dto.takeProfit ? new Decimal(dto.takeProfit) : null,
        status: this.mapStatus(order.status),
        fees: order.totalFees ? new Decimal(order.totalFees) : null,
        notes: dto.notes,
        strategyId: dto.strategyId,
        filledAt: order.filledTime ? new Date(order.filledTime) : null,
      },
    });

    // Start stop-loss monitor for filled orders
    if (trade.status === 'FILLED' && dto.side === 'BUY') {
      await this.updatePosition(dto.symbol, parseFloat(order.filledSize || dto.size.toString()), parseFloat(order.avgFillPrice || entryPrice.toString()), 'OPEN');
      this.startStopLossMonitor(trade.id, dto.symbol, assessment.stopLossPrice, dto.takeProfit, dto.side);
    }

    return {
      trade,
      riskAssessment: assessment,
      order,
    };
  }

  async cancelOrder(orderId: string): Promise<boolean> {
    const cancelled = await this.coinbase.cancelOrder(orderId);
    if (cancelled) {
      await this.prisma.trade.updateMany({
        where: { orderId },
        data: { status: 'CANCELLED', updatedAt: new Date() },
      });
      this.stopStopLossMonitor(orderId);
    }
    return cancelled;
  }

  async getOpenOrders() {
    return this.prisma.trade.findMany({
      where: { status: { in: ['PENDING', 'OPEN'] } },
      orderBy: { createdAt: 'desc' },
    });
  }

  private startStopLossMonitor(tradeId: string, symbol: string, stopLoss: number, takeProfit: number | undefined, side: string) {
    const interval = setInterval(async () => {
      try {
        const ticker = await this.coinbase.getTicker(symbol);
        const price = ticker.price;

        const hitStop = side === 'BUY' ? price <= stopLoss : price >= stopLoss;
        const hitTake = takeProfit ? (side === 'BUY' ? price >= takeProfit : price <= takeProfit) : false;

        if (hitStop || hitTake) {
          const reason = hitStop ? 'STOP_LOSS' : 'TAKE_PROFIT';
          this.logger.log(`${reason} triggered for trade ${tradeId} at $${price}`);

          const trade = await this.prisma.trade.findUnique({ where: { id: tradeId } });
          if (trade && trade.status === 'FILLED') {
            await this.placeClosingOrder(trade, price, reason);
          }

          clearInterval(interval);
          this.stopMonitors.delete(tradeId);
        }
      } catch (e) {
        this.logger.error(`Stop monitor error: ${e.message}`);
      }
    }, 2000); // Check every 2 seconds for low latency

    this.stopMonitors.set(tradeId, interval);
  }

  private stopStopLossMonitor(id: string) {
    const interval = this.stopMonitors.get(id);
    if (interval) {
      clearInterval(interval);
      this.stopMonitors.delete(id);
    }
  }

  private async placeClosingOrder(trade: any, currentPrice: number, reason: string) {
    const closingSide = trade.side === 'BUY' ? 'SELL' : 'BUY';
    const size = parseFloat(trade.filledSize?.toString() || trade.requestedSize.toString());

    try {
      const order = await this.coinbase.placeOrder({
        clientOrderId: uuidv4(),
        productId: trade.symbol,
        side: closingSide,
        orderType: 'MARKET',
        baseSize: size.toString(),
      });

      const entryPrice = parseFloat(trade.avgFillPrice?.toString() || trade.requestedPrice?.toString() || '0');
      const exitPrice = parseFloat(order.avgFillPrice || currentPrice.toString());
      const pnl = trade.side === 'BUY'
        ? (exitPrice - entryPrice) * size
        : (entryPrice - exitPrice) * size;

      await this.prisma.trade.update({
        where: { id: trade.id },
        data: {
          status: 'CLOSED',
          closedAt: new Date(),
          pnl: new Decimal(pnl),
          notes: `${trade.notes ? trade.notes + ' | ' : ''}Closed by ${reason} at $${exitPrice.toFixed(2)}`,
        },
      });

      await this.updatePosition(trade.symbol, size, exitPrice, 'CLOSE', pnl);

      this.logger.log(
        `Position closed (${reason}): ${trade.symbol} | PnL: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`,
      );
    } catch (e) {
      this.logger.error(`Failed to close position: ${e.message}`);
    }
  }

  private async updatePosition(symbol: string, size: number, price: number, action: 'OPEN' | 'CLOSE', pnl?: number) {
    const existing = await this.prisma.position.findUnique({ where: { symbol } });

    if (action === 'OPEN') {
      if (existing) {
        const totalSize = parseFloat(existing.size.toString()) + size;
        const avgPrice = (parseFloat(existing.avgEntryPrice.toString()) * parseFloat(existing.size.toString()) + price * size) / totalSize;
        await this.prisma.position.update({
          where: { symbol },
          data: { size: new Decimal(totalSize), avgEntryPrice: new Decimal(avgPrice) },
        });
      } else {
        await this.prisma.position.create({
          data: {
            symbol,
            size: new Decimal(size),
            avgEntryPrice: new Decimal(price),
            currentPrice: new Decimal(price),
          },
        });
      }
    } else if (action === 'CLOSE') {
      if (existing) {
        const remaining = parseFloat(existing.size.toString()) - size;
        const totalPnl = parseFloat(existing.realizedPnl.toString()) + (pnl || 0);
        if (remaining <= 0.00001) {
          await this.prisma.position.delete({ where: { symbol } });
        } else {
          await this.prisma.position.update({
            where: { symbol },
            data: { size: new Decimal(remaining), realizedPnl: new Decimal(totalPnl) },
          });
        }
      }
    }
  }

  private async handleOrderUpdate(order: any) {
    const orderId = order.order_id || order.orderId;
    if (!orderId) return;

    const trade = await this.prisma.trade.findFirst({ where: { orderId } }).catch(() => null);
    if (!trade) return;

    const newStatus = this.mapStatus(order.status || order.status);
    if (newStatus && trade.status !== newStatus) {
      await this.prisma.trade.update({
        where: { id: trade.id },
        data: {
          status: newStatus as any,
          filledSize: order.filled_size ? new Decimal(order.filled_size) : undefined,
          avgFillPrice: order.average_filled_price ? new Decimal(order.average_filled_price) : undefined,
          fees: order.total_fees ? new Decimal(order.total_fees) : undefined,
          filledAt: order.last_fill_time ? new Date(order.last_fill_time) : undefined,
        },
      });
    }
  }

  private mapStatus(exchangeStatus: string): string {
    const map: Record<string, string> = {
      PENDING: 'PENDING',
      OPEN: 'OPEN',
      FILLED: 'FILLED',
      CANCELLED: 'CANCELLED',
      EXPIRED: 'CANCELLED',
      FAILED: 'REJECTED',
      REJECTED: 'REJECTED',
    };
    return map[exchangeStatus?.toUpperCase()] || exchangeStatus;
  }

  private async getUsdBalance(): Promise<number> {
    const accounts = await this.coinbase.getAccounts();
    const usd = accounts.find((a) => a.currency === 'USD');
    return parseFloat(usd?.availableBalance?.value || '10000');
  }
}
