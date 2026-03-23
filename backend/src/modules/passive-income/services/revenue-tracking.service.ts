import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RevenueTrackingService {
  private readonly logger = new Logger(RevenueTrackingService.name);

  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const today = new Date(now.setHours(0, 0, 0, 0));

    const [
      totalRevenue,
      monthRevenue,
      lastMonthRevenue,
      yearRevenue,
      todayRevenue,
      revenueBySource,
      leadStats,
      topProducts,
      topAffiliates,
      recentActivity,
    ] = await Promise.all([
      // All-time total
      this.prisma.revenueRecord.aggregate({ _sum: { amount: true } }),

      // This month
      this.prisma.revenueRecord.aggregate({
        _sum: { amount: true },
        where: { date: { gte: startOfMonth } },
      }),

      // Last month
      this.prisma.revenueRecord.aggregate({
        _sum: { amount: true },
        where: { date: { gte: startOfLastMonth, lte: endOfLastMonth } },
      }),

      // This year
      this.prisma.revenueRecord.aggregate({
        _sum: { amount: true },
        where: { date: { gte: startOfYear } },
      }),

      // Today
      this.prisma.revenueRecord.aggregate({
        _sum: { amount: true },
        where: { date: { gte: today } },
      }),

      // Revenue by source
      this.prisma.revenueRecord.groupBy({
        by: ['source'],
        _sum: { amount: true },
        where: { date: { gte: startOfMonth } },
      }),

      // Lead stats
      this.getLeadFunnelStats(),

      // Top digital products
      this.prisma.digitalProduct.findMany({
        where: { isActive: true },
        orderBy: { totalRevenue: 'desc' },
        take: 5,
        select: { name: true, purchaseCount: true, totalRevenue: true, type: true },
      }),

      // Top affiliates
      this.prisma.affiliateProduct.findMany({
        where: { isActive: true },
        orderBy: { totalEarnings: 'desc' },
        take: 5,
        select: { name: true, clickCount: true, conversionCount: true, totalEarnings: true },
      }),

      // Recent revenue activity
      this.prisma.revenueRecord.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const monthTotal = monthRevenue._sum.amount || 0;
    const lastMonthTotal = lastMonthRevenue._sum.amount || 0;
    const monthGrowth = lastMonthTotal > 0
      ? (((monthTotal - lastMonthTotal) / lastMonthTotal) * 100).toFixed(1)
      : '0';

    return {
      revenue: {
        today: todayRevenue._sum.amount || 0,
        thisMonth: monthTotal,
        lastMonth: lastMonthTotal,
        thisYear: yearRevenue._sum.amount || 0,
        allTime: totalRevenue._sum.amount || 0,
        monthGrowth: `${monthGrowth}%`,
        bySource: revenueBySource.map(r => ({
          source: r.source,
          amount: r._sum.amount || 0,
        })),
      },
      leads: leadStats,
      topProducts,
      topAffiliates,
      recentActivity,
    };
  }

  async getRevenueChart(period: 'week' | 'month' | 'year' = 'month') {
    const now = new Date();
    let startDate: Date;
    let groupByFormat: string;

    if (period === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      groupByFormat = 'day';
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      groupByFormat = 'day';
    } else {
      startDate = new Date(now.getFullYear(), 0, 1);
      groupByFormat = 'month';
    }

    const records = await this.prisma.revenueRecord.findMany({
      where: { date: { gte: startDate } },
      orderBy: { date: 'asc' },
    });

    // Group by day/month
    const grouped: Record<string, { bookings: number; digitalProducts: number; affiliate: number; total: number }> = {};

    for (const record of records) {
      const key = groupByFormat === 'month'
        ? `${record.date.getFullYear()}-${String(record.date.getMonth() + 1).padStart(2, '0')}`
        : `${record.date.getFullYear()}-${String(record.date.getMonth() + 1).padStart(2, '0')}-${String(record.date.getDate()).padStart(2, '0')}`;

      if (!grouped[key]) {
        grouped[key] = { bookings: 0, digitalProducts: 0, affiliate: 0, total: 0 };
      }

      const amount = record.amount;
      grouped[key].total += amount;

      if (record.source === 'BOOKINGS') grouped[key].bookings += amount;
      else if (record.source === 'DIGITAL_PRODUCTS') grouped[key].digitalProducts += amount;
      else if (record.source === 'AFFILIATE') grouped[key].affiliate += amount;
    }

    return Object.entries(grouped).map(([date, values]) => ({ date, ...values }));
  }

  async getPassiveIncomeBreakdown() {
    // Shows which streams are running on autopilot vs requiring active work
    const [digitalRevenue, affiliateRevenue, emailConversions, leadCount] = await Promise.all([
      this.prisma.revenueRecord.aggregate({
        _sum: { amount: true },
        where: { source: 'DIGITAL_PRODUCTS' },
      }),
      this.prisma.revenueRecord.aggregate({
        _sum: { amount: true },
        where: { source: 'AFFILIATE' },
      }),
      this.prisma.leadEmailStatus.count({ where: { status: 'COMPLETED' } }),
      this.prisma.lead.count(),
    ]);

    const totalPassive = (digitalRevenue._sum.amount || 0) + (affiliateRevenue._sum.amount || 0);

    return {
      streams: [
        {
          name: 'Digital Products',
          description: 'Training guides, video courses, meal plans — sold automatically 24/7',
          revenue: digitalRevenue._sum.amount || 0,
          isPassive: true,
          automationLevel: 'FULLY_AUTOMATED',
        },
        {
          name: 'Affiliate Commissions',
          description: 'Earn commissions on football gear, nutrition, and online courses',
          revenue: affiliateRevenue._sum.amount || 0,
          isPassive: true,
          automationLevel: 'FULLY_AUTOMATED',
        },
        {
          name: 'Email Funnel',
          description: 'Automated email sequences converting leads to paying clients',
          revenue: 0, // Revenue attributed to bookings converted from leads
          completedSequences: emailConversions,
          totalLeads: leadCount,
          isPassive: true,
          automationLevel: 'FULLY_AUTOMATED',
        },
      ],
      totalPassiveRevenue: totalPassive,
      automationStatus: 'RUNNING_24_7',
    };
  }

  private async getLeadFunnelStats() {
    const [total, newLeads, nurturing, qualified, converted] = await Promise.all([
      this.prisma.lead.count(),
      this.prisma.lead.count({ where: { status: 'NEW' } }),
      this.prisma.lead.count({ where: { status: 'NURTURING' } }),
      this.prisma.lead.count({ where: { status: 'QUALIFIED' } }),
      this.prisma.lead.count({ where: { status: 'CONVERTED' } }),
    ]);

    return {
      total,
      funnel: { new: newLeads, nurturing, qualified, converted },
      conversionRate: total > 0 ? ((converted / total) * 100).toFixed(1) + '%' : '0%',
    };
  }
}
