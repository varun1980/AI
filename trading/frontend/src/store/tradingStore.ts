import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface TickerData {
  symbol: string;
  price: number;
  bid: number;
  ask: number;
  volume24h: number;
  change24h: number;
  changePercent24h: number;
  timestamp: string;
}

export interface Position {
  id: string;
  symbol: string;
  size: number;
  avgEntryPrice: number;
  currentPrice: number | null;
  unrealizedPnl: number;
  positionValue: number;
  pnlPercent: number;
  stopLoss: number | null;
  takeProfit: number | null;
}

export interface Portfolio {
  usdBalance: number;
  totalPositionValue: number;
  totalValue: number;
  totalUnrealizedPnl: number;
  totalRealizedPnl: number;
  totalPnl: number;
  dailyPnl: number;
  positions: Position[];
  openPositionsCount: number;
}

interface TradingStore {
  // Market data
  tickers: Record<string, TickerData>;
  selectedSymbol: string;
  watchlist: string[];

  // Portfolio
  portfolio: Portfolio | null;
  isPortfolioLoading: boolean;

  // Connection
  isConnected: boolean;
  exchangeStatus: { connected: boolean; exchange: string } | null;

  // Notifications
  recentTrades: any[];
  recentAlerts: any[];

  // Actions
  setTicker: (ticker: TickerData) => void;
  setSelectedSymbol: (symbol: string) => void;
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  setPortfolio: (portfolio: Portfolio) => void;
  setConnected: (connected: boolean) => void;
  setExchangeStatus: (status: any) => void;
  addRecentTrade: (trade: any) => void;
  addRecentAlert: (alert: any) => void;
}

export const useTradingStore = create<TradingStore>()(
  subscribeWithSelector((set) => ({
    tickers: {},
    selectedSymbol: 'BTC-USD',
    watchlist: ['BTC-USD', 'ETH-USD', 'SOL-USD', 'XRP-USD', 'DOGE-USD'],
    portfolio: null,
    isPortfolioLoading: false,
    isConnected: false,
    exchangeStatus: null,
    recentTrades: [],
    recentAlerts: [],

    setTicker: (ticker) =>
      set((state) => ({
        tickers: { ...state.tickers, [ticker.symbol]: ticker },
      })),

    setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),

    addToWatchlist: (symbol) =>
      set((state) => ({
        watchlist: state.watchlist.includes(symbol)
          ? state.watchlist
          : [...state.watchlist, symbol],
      })),

    removeFromWatchlist: (symbol) =>
      set((state) => ({
        watchlist: state.watchlist.filter((s) => s !== symbol),
      })),

    setPortfolio: (portfolio) => set({ portfolio }),

    setConnected: (isConnected) => set({ isConnected }),

    setExchangeStatus: (exchangeStatus) => set({ exchangeStatus }),

    addRecentTrade: (trade) =>
      set((state) => ({
        recentTrades: [trade, ...state.recentTrades].slice(0, 20),
      })),

    addRecentAlert: (alert) =>
      set((state) => ({
        recentAlerts: [alert, ...state.recentAlerts].slice(0, 10),
      })),
  })),
);
