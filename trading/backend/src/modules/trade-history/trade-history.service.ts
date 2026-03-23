import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface TradeHistoryFilter {
  page: number;
  limit: number;
  symbol?: string;
  side?: string;
  status?: string;
}

@Injectable()
export class TradeHistoryService {
  constructor(private prisma: PrismaService) {}

  async findAll(filter: TradeHistoryFilter) {
    const where: any = {};
    if (filter.symbol) where.symbol = filter.symbol;
    if (filter.side) where.side = filter.side.toUpperCase();
    if (filter.status) where.status = filter.status.toUpperCase();

    const [trades, total] = await Promise.all([
      this.prisma.trade.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (filter.page - 1) * filter.limit,
        take: filter.limit,
        include: {
          strategy: { select: { id: true, name: true } },
          scheduledOrder: { select: { id: true, name: true } },
        },
      }),
      this.prisma.trade.count({ where }),
    ]);

    return {
      trades,
      pagination: {
        page: filter.page,
        limit: filter.limit,
        total,
        pages: Math.ceil(total / filter.limit),
      },
    };
  }

  async findOne(id: string) {
    const trade = await this.prisma.trade.findUnique({
      where: { id },
      include: {
        strategy: true,
        scheduledOrder: true,
      },
    });
    if (!trade) throw new NotFoundException('Trade not found');
    return trade;
  }

  async getStats() {
    const [allTrades, openTrades] = await Promise.all([
      this.prisma.trade.findMany({
        where: { status: 'CLOSED' },
        select: { pnl: true, fees: true, symbol: true, side: true, createdAt: true },
      }),
      this.prisma.trade.findMany({
        where: { status: { in: ['PENDING', 'OPEN', 'FILLED'] } },
        select: { id: true },
      }),
    ]);

    const totalTrades = allTrades.length;
    const wins = allTrades.filter((t) => parseFloat(t.pnl?.toString() || '0') > 0).length;
    const losses = totalTrades - wins;
    const totalPnl = allTrades.reduce((s, t) => s + parseFloat(t.pnl?.toString() || '0'), 0);
    const totalFees = allTrades.reduce((s, t) => s + parseFloat(t.fees?.toString() || '0'), 0);
    const avgPnl = totalTrades > 0 ? totalPnl / totalTrades : 0;
    const bestTrade = allTrades.reduce(
      (best, t) => Math.max(best, parseFloat(t.pnl?.toString() || '0')),
      -Infinity,
    );
    const worstTrade = allTrades.reduce(
      (worst, t) => Math.min(worst, parseFloat(t.pnl?.toString() || '0')),
      Infinity,
    );

    // Most traded symbols
    const symbolCounts = allTrades.reduce((acc, t) => {
      acc[t.symbol] = (acc[t.symbol] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalTrades,
      openTrades: openTrades.length,
      wins,
      losses,
      winRate: totalTrades > 0 ? (wins / totalTrades) * 100 : 0,
      totalPnl,
      totalFees,
      netPnl: totalPnl - totalFees,
      avgPnl,
      bestTrade: isFinite(bestTrade) ? bestTrade : 0,
      worstTrade: isFinite(worstTrade) ? worstTrade : 0,
      mostTradedSymbols: Object.entries(symbolCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([symbol, count]) => ({ symbol, count })),
    };
  }
}
