'use client';

import { useQuery } from '@tanstack/react-query';
import { getPortfolioSummary } from '@/lib/api';
import { useTradingStore } from '@/store/tradingStore';
import { useEffect } from 'react';
import { clsx } from 'clsx';
import { TrendingUp, TrendingDown, DollarSign, BarChart2 } from 'lucide-react';

function StatCard({ label, value, sub, positive }: { label: string; value: string; sub?: string; positive?: boolean }) {
  return (
    <div className="card-dark">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={clsx('text-lg font-bold font-mono', positive === undefined ? 'text-white' : positive ? 'positive' : 'negative')}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function PortfolioSummary() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['portfolio'],
    queryFn: getPortfolioSummary,
    refetchInterval: 15000,
  });

  const setPortfolio = useTradingStore((s) => s.setPortfolio);

  useEffect(() => {
    if (data) setPortfolio(data);
  }, [data]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card-dark animate-pulse h-16" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Portfolio"
          value={`$${data.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          sub={`${data.openPositionsCount} positions`}
        />
        <StatCard
          label="Available USD"
          value={`$${data.usdBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        />
        <StatCard
          label="Today's P&L"
          value={`${data.dailyPnl >= 0 ? '+' : ''}$${data.dailyPnl.toFixed(2)}`}
          positive={data.dailyPnl >= 0}
        />
        <StatCard
          label="Total P&L"
          value={`${data.totalPnl >= 0 ? '+' : ''}$${data.totalPnl.toFixed(2)}`}
          positive={data.totalPnl >= 0}
          sub={`Unrealized: $${data.totalUnrealizedPnl.toFixed(2)}`}
        />
      </div>

      {/* Open positions */}
      {data.positions.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-bold text-white mb-3">Open Positions</h3>
          <div className="space-y-2">
            {data.positions.map((pos: any) => (
              <div key={pos.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-400">{pos.symbol.split('-')[0].slice(0, 3)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{pos.symbol}</p>
                    <p className="text-xs text-slate-500 font-mono">{parseFloat(pos.size).toFixed(8)} @ ${parseFloat(pos.avgEntryPrice).toFixed(2)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-white">${pos.positionValue?.toFixed(2) || '—'}</p>
                  <p className={clsx('text-xs font-mono', (pos.unrealizedPnl || 0) >= 0 ? 'positive' : 'negative')}>
                    {(pos.unrealizedPnl || 0) >= 0 ? '+' : ''}${(pos.unrealizedPnl || 0).toFixed(2)}
                    {' '}({(pos.pnlPercent || 0).toFixed(2)}%)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
