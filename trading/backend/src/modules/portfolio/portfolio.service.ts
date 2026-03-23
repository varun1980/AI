import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { CoinbaseService } from '../coinbase/coinbase.service';
import { MarketDataService } from '../market-data/market-data.service';
import Decimal from 'decimal.js';

@Injectable()
export class PortfolioService {
  private readonly logger = new Logger(PortfolioService.name);

  constructor(
    private prisma: PrismaService,
    private coinbase: CoinbaseService,
    private marketData: MarketDataService,
  ) {}

  async getSummary() {
    const [accounts, positions, trades] = await Promise.all([
      this.coinbase.getAccounts(),
      this.prisma.position.findMany(),
      this.prisma.trade.findMany({
        where: { status: 'CLOSED' },
        select: { pnl: true, createdAt: true },
      }),
    ]);

    const usdAccount = accounts.find((a) => a.currency === 'USD');
    const usdBalance = parseFloat(usdAccount?.availableBalance?.value || '0');

    // Compute unrealized PnL for open positions
    let totalUnrealizedPnl = 0;
    let totalPositionValue = 0;
    const enrichedPositions = await Promise.all(
      positions.map(async (pos) => {
        try {
          const ticker = await this.marketData.getTicker(pos.symbol);
          const size = parseFloat(pos.size.toString());
          const avgEntry = parseFloat(pos.avgEntryPrice.toString());
          const unrealizedPnl = (ticker.price - avgEntry) * size;
          const positionValue = ticker.price * size;
          totalUnrealizedPnl += unrealizedPnl;
          totalPositionValue += positionValue;
          return {
            ...pos,
            currentPrice: ticker.price,
            unrealizedPnl,
            positionValue,
            pnlPercent: ((ticker.price - avgEntry) / avgEntry) * 100,
          };
        } catch {
          const positionValue = parseFloat(pos.size.toString()) * parseFloat(pos.avgEntryPrice.toString());
          totalPositionValue += positionValue;
          return { ...pos, currentPrice: null, unrealizedPnl: 0, positionValue, pnlPercent: 0 };
        }
      }),
    );

    // Total realized PnL from closed trades
    const totalRealizedPnl = trades.reduce(
      (sum, t) => sum + parseFloat(t.pnl?.toString() || '0'),
      0,
    );

    // Daily PnL (today's closed trades)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailyPnl = trades
      .filter((t) => new Date(t.createdAt) >= today)
      .reduce((sum, t) => sum + parseFloat(t.pnl?.toString() || '0'), 0);

    // Total portfolio value
    const totalValue = usdBalance + totalPositionValue;

    return {
      usdBalance,
      totalPositionValue,
      totalValue,
      totalUnrealizedPnl,
      totalRealizedPnl,
      totalPnl: totalUnrealizedPnl + totalRealizedPnl,
      dailyPnl,
      positions: enrichedPositions,
      accounts,
      openPositionsCount: positions.length,
    };
  }

  async getPerformance(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const trades = await this.prisma.trade.findMany({
      where: {
        status: 'CLOSED',
        closedAt: { gte: since },
      },
      orderBy: { closedAt: 'asc' },
    });

    // Group by day
    const dailyMap = new Map<string, { pnl: number; trades: number; wins: number }>();
    for (const trade of trades) {
      const day = trade.closedAt?.toISOString().split('T')[0] || '';
      const pnl = parseFloat(trade.pnl?.toString() || '0');
      const existing = dailyMap.get(day) || { pnl: 0, trades: 0, wins: 0 };
      dailyMap.set(day, {
        pnl: existing.pnl + pnl,
        trades: existing.trades + 1,
        wins: existing.wins + (pnl > 0 ? 1 : 0),
      });
    }

    const dailyPerformance = Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      ...data,
      winRate: data.trades > 0 ? (data.wins / data.trades) * 100 : 0,
    }));

    const totalTrades = trades.length;
    const wins = trades.filter((t) => parseFloat(t.pnl?.toString() || '0') > 0).length;
    const totalPnl = trades.reduce((sum, t) => sum + parseFloat(t.pnl?.toString() || '0'), 0);

    return {
      period: days,
      totalTrades,
      wins,
      losses: totalTrades - wins,
      winRate: totalTrades > 0 ? (wins / totalTrades) * 100 : 0,
      totalPnl,
      avgPnlPerTrade: totalTrades > 0 ? totalPnl / totalTrades : 0,
      dailyPerformance,
    };
  }

  /**
   * Update position prices every 30 seconds
   */
  @Cron('*/30 * * * * *')
  async updatePositionPrices() {
    const positions = await this.prisma.position.findMany();
    for (const pos of positions) {
      try {
        const price = await this.marketData.getPrice(pos.symbol);
        const size = parseFloat(pos.size.toString());
        const avgEntry = parseFloat(pos.avgEntryPrice.toString());
        const unrealizedPnl = (price - avgEntry) * size;

        await this.prisma.position.update({
          where: { id: pos.id },
          data: {
            currentPrice: new Decimal(price),
            unrealizedPnl: new Decimal(unrealizedPnl),
          },
        });
      } catch {
        // Non-critical
      }
    }
  }
}
