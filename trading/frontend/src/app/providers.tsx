'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { getSocket } from '@/lib/websocket';
import { useTradingStore } from '@/store/tradingStore';
import toast from 'react-hot-toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 10000, retry: 1 },
  },
});

function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { setTicker, setExchangeStatus, addRecentTrade, addRecentAlert, watchlist } = useTradingStore();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const socket = getSocket();

    socket.on('connect', () => {
      // Subscribe to watchlist
      watchlist.forEach((symbol) => {
        socket.emit('subscribe_ticker', { symbol });
      });
    });

    socket.on('ticker', (ticker) => {
      setTicker(ticker);
    });

    socket.on('exchange_status', (status) => {
      setExchangeStatus(status);
    });

    socket.on('trade_executed', (trade) => {
      addRecentTrade(trade);
      const pnl = trade.pnl;
      if (pnl !== undefined) {
        const msg = `Trade closed: ${trade.symbol} | ${pnl >= 0 ? '+' : ''}$${parseFloat(pnl).toFixed(2)}`;
        pnl >= 0 ? toast.success(msg) : toast.error(msg);
      } else {
        toast.success(`Order placed: ${trade.side} ${trade.symbol}`);
      }
    });

    socket.on('alert_triggered', (alert) => {
      addRecentAlert(alert);
      toast(`Alert: ${alert.symbol} ${alert.condition} $${alert.targetPrice}`, {
        icon: '🔔',
      });
    });

    socket.on('order_update', (order) => {
      if (order.status === 'FILLED') {
        toast.success(`Order filled: ${order.productId || order.symbol}`);
      }
    });

    return () => {
      socket.off('ticker');
      socket.off('exchange_status');
      socket.off('trade_executed');
      socket.off('alert_triggered');
      socket.off('order_update');
    };
  }, []);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WebSocketProvider>{children}</WebSocketProvider>
    </QueryClientProvider>
  );
}
