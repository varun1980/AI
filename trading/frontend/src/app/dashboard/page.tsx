'use client';

import dynamic from 'next/dynamic';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import PortfolioSummary from '@/components/portfolio/PortfolioSummary';
import OrderPanel from '@/components/trading/OrderPanel';
import Watchlist from '@/components/trading/Watchlist';
import { useTradingStore } from '@/store/tradingStore';

const PriceChart = dynamic(() => import('@/components/trading/PriceChart'), { ssr: false });

export default function DashboardPage() {
  const { selectedSymbol } = useTradingStore();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Portfolio summary */}
          <PortfolioSummary />

          {/* Main trading area */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px_220px] gap-4">
            {/* Chart */}
            <PriceChart symbol={selectedSymbol} />

            {/* Order panel */}
            <OrderPanel />

            {/* Watchlist */}
            <Watchlist />
          </div>
        </main>
      </div>
    </div>
  );
}
