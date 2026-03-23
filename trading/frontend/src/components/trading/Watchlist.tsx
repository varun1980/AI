'use client';

import { useTradingStore } from '@/store/tradingStore';
import { clsx } from 'clsx';
import { getSocket } from '@/lib/websocket';
import { useEffect } from 'react';

const DEFAULT_SYMBOLS = [
  'BTC-USD', 'ETH-USD', 'SOL-USD', 'XRP-USD', 'DOGE-USD',
  'ADA-USD', 'AVAX-USD', 'LINK-USD', 'MATIC-USD', 'DOT-USD',
];

export default function Watchlist() {
  const { watchlist, tickers, selectedSymbol, setSelectedSymbol, addToWatchlist } = useTradingStore();

  useEffect(() => {
    const socket = getSocket();
    DEFAULT_SYMBOLS.forEach((s) => {
      socket.emit('subscribe_ticker', { symbol: s });
    });
  }, []);

  return (
    <div className="card h-full">
      <h3 className="text-sm font-bold text-white mb-3">Watchlist</h3>
      <div className="space-y-1 overflow-y-auto max-h-[500px]">
        {DEFAULT_SYMBOLS.map((symbol) => {
          const t = tickers[symbol];
          const selected = symbol === selectedSymbol;
          const up = (t?.changePercent24h || 0) >= 0;

          return (
            <button
              key={symbol}
              onClick={() => setSelectedSymbol(symbol)}
              className={clsx(
                'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors',
                selected ? 'bg-blue-500/20 border border-blue-500/30' : 'hover:bg-surface-2',
              )}
            >
              <div>
                <p className="text-sm font-bold text-white">{symbol.replace('-USD', '')}</p>
                <p className="text-xs text-slate-500 font-mono">USD</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-mono text-white">
                  {t ? `$${t.price >= 1000 ? t.price.toLocaleString('en-US', { minimumFractionDigits: 2 }) : t.price.toFixed(4)}` : '—'}
                </p>
                <p className={clsx('text-xs font-mono', t ? (up ? 'positive' : 'negative') : 'neutral')}>
                  {t ? `${up ? '+' : ''}${t.changePercent24h.toFixed(2)}%` : '—'}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
