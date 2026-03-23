'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTrades, getTradeStats } from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { clsx } from 'clsx';
import { TrendingUp, TrendingDown, BarChart2, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_BADGE: Record<string, string> = {
  FILLED: 'badge-green',
  CLOSED: 'badge-blue',
  PENDING: 'badge-yellow',
  OPEN: 'badge-yellow',
  CANCELLED: 'badge-gray',
  REJECTED: 'badge-red',
};

export default function HistoryPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [sideFilter, setSideFilter] = useState('');

  const { data: stats } = useQuery({ queryKey: ['trade-stats'], queryFn: getTradeStats });
  const { data, isLoading } = useQuery({
    queryKey: ['trades', page, statusFilter, sideFilter],
    queryFn: () => getTrades({ page, limit: 20, status: statusFilter || undefined, side: sideFilter || undefined }),
  });

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          <h1 className="text-xl font-bold text-white">Trade History</h1>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="card-dark text-center">
                <p className="text-xs text-slate-500">Total Trades</p>
                <p className="text-xl font-bold text-white">{stats.totalTrades}</p>
              </div>
              <div className="card-dark text-center">
                <p className="text-xs text-slate-500">Win Rate</p>
                <p className={clsx('text-xl font-bold', stats.winRate >= 50 ? 'positive' : 'negative')}>
                  {stats.winRate.toFixed(1)}%
                </p>
              </div>
              <div className="card-dark text-center">
                <p className="text-xs text-slate-500">Net P&L</p>
                <p className={clsx('text-xl font-bold font-mono', stats.netPnl >= 0 ? 'positive' : 'negative')}>
                  {stats.netPnl >= 0 ? '+' : ''}${stats.netPnl.toFixed(2)}
                </p>
              </div>
              <div className="card-dark text-center">
                <p className="text-xs text-slate-500">Best Trade</p>
                <p className="text-xl font-bold positive font-mono">+${stats.bestTrade.toFixed(2)}</p>
              </div>
              <div className="card-dark text-center">
                <p className="text-xs text-slate-500">Worst Trade</p>
                <p className="text-xl font-bold negative font-mono">${stats.worstTrade.toFixed(2)}</p>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="input w-auto text-xs"
            >
              <option value="">All Status</option>
              <option value="FILLED">Filled</option>
              <option value="CLOSED">Closed</option>
              <option value="PENDING">Pending</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <select
              value={sideFilter}
              onChange={(e) => { setSideFilter(e.target.value); setPage(1); }}
              className="input w-auto text-xs"
            >
              <option value="">All Sides</option>
              <option value="BUY">Buy</option>
              <option value="SELL">Sell</option>
            </select>
          </div>

          {/* Table */}
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {['Time', 'Symbol', 'Side', 'Type', 'Size', 'Price', 'Stop Loss', 'P&L', 'Status', 'Source'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs text-slate-500 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i}>
                        {[...Array(10)].map((_, j) => (
                          <td key={j} className="px-4 py-3"><div className="h-4 bg-surface-2 rounded animate-pulse w-16" /></td>
                        ))}
                      </tr>
                    ))
                  ) : data?.trades?.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-12 text-slate-500">No trades yet</td>
                    </tr>
                  ) : (
                    data?.trades?.map((trade: any) => {
                      const pnl = trade.pnl ? parseFloat(trade.pnl) : null;
                      return (
                        <tr key={trade.id} className="border-b border-border hover:bg-surface-2 transition-colors">
                          <td className="px-4 py-3 text-xs text-slate-500 font-mono whitespace-nowrap">
                            {format(new Date(trade.createdAt), 'MM/dd HH:mm:ss')}
                          </td>
                          <td className="px-4 py-3 font-bold text-white">{trade.symbol}</td>
                          <td className="px-4 py-3">
                            <span className={trade.side === 'BUY' ? 'badge-green' : 'badge-red'}>{trade.side}</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-400">{trade.orderType}</td>
                          <td className="px-4 py-3 font-mono text-slate-300">{parseFloat(trade.requestedSize).toFixed(6)}</td>
                          <td className="px-4 py-3 font-mono text-slate-300">
                            ${trade.avgFillPrice ? parseFloat(trade.avgFillPrice).toLocaleString() : '—'}
                          </td>
                          <td className="px-4 py-3 font-mono text-red-400">
                            {trade.stopLoss ? `$${parseFloat(trade.stopLoss).toFixed(2)}` : '—'}
                          </td>
                          <td className={clsx('px-4 py-3 font-mono font-bold', pnl === null ? 'text-slate-500' : pnl >= 0 ? 'positive' : 'negative')}>
                            {pnl === null ? '—' : `${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`}
                          </td>
                          <td className="px-4 py-3">
                            <span className={STATUS_BADGE[trade.status] || 'badge-gray'}>{trade.status}</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500">
                            {trade.strategy?.name || trade.scheduledOrder?.name || 'Manual'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data?.pagination && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <p className="text-xs text-slate-500">
                  {data.pagination.total} trades · Page {page} of {data.pagination.pages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-secondary text-xs py-1 px-3 disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= data.pagination.pages}
                    className="btn-secondary text-xs py-1 px-3 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
