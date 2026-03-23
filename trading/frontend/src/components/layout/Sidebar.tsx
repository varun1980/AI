'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTradingStore } from '@/store/tradingStore';
import {
  LayoutDashboard, TrendingUp, History, Calendar, Bell, Settings, Zap, Circle,
} from 'lucide-react';
import { clsx } from 'clsx';

const nav = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/strategies', icon: Zap, label: 'Strategies' },
  { href: '/scheduler', icon: Calendar, label: 'Scheduler' },
  { href: '/history', icon: History, label: 'History' },
  { href: '/alerts', icon: Bell, label: 'Alerts' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { exchangeStatus } = useTradingStore();

  return (
    <aside className="w-16 lg:w-56 bg-surface border-r border-border flex flex-col h-screen sticky top-0 z-40">
      {/* Logo */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <TrendingUp size={16} className="text-white" />
        </div>
        <span className="hidden lg:block font-bold text-white text-sm">TradePro</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {nav.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname === href || pathname.startsWith(href + '/')
                ? 'bg-blue-500/20 text-blue-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-surface-2',
            )}
          >
            <Icon size={18} className="flex-shrink-0" />
            <span className="hidden lg:block">{label}</span>
          </Link>
        ))}
      </nav>

      {/* Exchange status */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <Circle
            size={8}
            className={exchangeStatus?.connected ? 'text-green-400 fill-green-400' : 'text-red-400 fill-red-400'}
          />
          <span className="hidden lg:block text-xs text-slate-500">
            {exchangeStatus?.connected ? 'Coinbase Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
    </aside>
  );
}
