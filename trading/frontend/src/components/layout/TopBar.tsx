'use client';

import { useTradingStore } from '@/store/tradingStore';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { clsx } from 'clsx';

function formatPrice(price: number) {
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toFixed(4);
  return price.toFixed(6);
}

function formatPct(pct: number) {
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`;
}

export default function TopBar() {
  const { watchlist, tickers, portfolio } = useTradingStore();

  return (
    <div className="bg-surface border-b border-border px-4 py-2 flex items-center gap-6 overflow-x-auto">
      {/* Portfolio summary */}
      {portfolio && (
        <div className="flex items-center gap-4 border-r border-border pr-6 flex-shrink-0">
          <div>
            <p className="text-xs text-slate-500">Portfolio</p>
            <p className="text-sm font-bold text-white">${portfolio.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Today P&L</p>
            <p className={clsx('text-sm font-bold', portfolio.dailyPnl >= 0 ? 'positive' : 'negative')}>
              {portfolio.dailyPnl >= 0 ? '+' : ''}${portfolio.dailyPnl.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* Ticker strip */}
      <div className="flex items-center gap-6 overflow-x-auto">
        {watchlist.map((symbol) => {
          const t = tickers[symbol];
          if (!t) {
            return (
              <div key={symbol} className="flex-shrink-0 text-slate-600 text-xs">
                {symbol} —
              </div>
            );
          }
          const up = t.changePercent24h >= 0;
          return (
            <div key={symbol} className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs font-mono text-slate-300">{symbol.replace('-USD', '')}</span>
              <span className="text-xs font-mono font-bold text-white">${formatPrice(t.price)}</span>
              <span className={clsx('text-xs font-mono flex items-center gap-0.5', up ? 'positive' : 'negative')}>
                {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {formatPct(t.changePercent24h)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
