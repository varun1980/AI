'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts';
import { getSocket, requestCandles } from '@/lib/websocket';
import { useTradingStore } from '@/store/tradingStore';
import { clsx } from 'clsx';

const GRANULARITIES = [
  { label: '1m', value: 'ONE_MINUTE' },
  { label: '5m', value: 'FIVE_MINUTE' },
  { label: '15m', value: 'FIFTEEN_MINUTE' },
  { label: '1h', value: 'ONE_HOUR' },
  { label: '4h', value: 'TWO_HOUR' },
  { label: '1d', value: 'ONE_DAY' },
];

interface Props {
  symbol: string;
}

export default function PriceChart({ symbol }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const [granularity, setGranularity] = useState('ONE_HOUR');
  const [indicators, setIndicators] = useState<any>(null);
  const { tickers } = useTradingStore();

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: '#111827' },
        textColor: '#64748b',
      },
      grid: {
        vertLines: { color: '#1e2d40' },
        horzLines: { color: '#1e2d40' },
      },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: '#1e2d40' },
      timeScale: {
        borderColor: '#1e2d40',
        timeVisible: true,
        secondsVisible: false,
      },
      width: containerRef.current.clientWidth,
      height: 360,
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#f87171',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#f87171',
    });

    const volumeSeries = chart.addHistogramSeries({
      color: '#1a2235',
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });

    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, []);

  useEffect(() => {
    const socket = getSocket();
    requestCandles(symbol, granularity, 200);

    const handleCandles = (data: { symbol: string; candles: any[]; indicators: any }) => {
      if (data.symbol !== symbol) return;
      if (!candleSeriesRef.current || !volumeSeriesRef.current) return;

      const candleData: CandlestickData[] = data.candles.map((c) => ({
        time: c.time as Time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));

      const volumeData = data.candles.map((c) => ({
        time: c.time as Time,
        value: c.volume,
        color: c.close >= c.open ? 'rgba(34,197,94,0.3)' : 'rgba(248,113,113,0.3)',
      }));

      if (candleData.length > 0) {
        candleSeriesRef.current.setData(candleData);
        volumeSeriesRef.current.setData(volumeData);
        chartRef.current?.timeScale().fitContent();
      }

      setIndicators(data.indicators);
    };

    socket.on('candles', handleCandles);
    return () => { socket.off('candles', handleCandles); };
  }, [symbol, granularity]);

  // Real-time candle update from ticker
  useEffect(() => {
    const ticker = tickers[symbol];
    if (!ticker || !candleSeriesRef.current) return;

    const now = Math.floor(Date.now() / 1000);
    // Update last candle close price
    candleSeriesRef.current.update({
      time: now as Time,
      open: ticker.price,
      high: ticker.price,
      low: ticker.price,
      close: ticker.price,
    });
  }, [tickers[symbol]?.price]);

  const ticker = tickers[symbol];

  return (
    <div className="card h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">{symbol}</h2>
            {ticker && (
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-2xl font-mono font-bold text-white">
                  ${ticker.price >= 1000
                    ? ticker.price.toLocaleString('en-US', { minimumFractionDigits: 2 })
                    : ticker.price.toFixed(4)}
                </span>
                <span className={clsx('text-sm font-mono', ticker.changePercent24h >= 0 ? 'positive' : 'negative')}>
                  {ticker.changePercent24h >= 0 ? '+' : ''}{ticker.changePercent24h.toFixed(2)}%
                </span>
              </div>
            )}
          </div>
          {indicators && (
            <div className="hidden lg:flex items-center gap-3 text-xs">
              {indicators.rsi !== undefined && (
                <span className={clsx('font-mono',
                  indicators.rsi > 70 ? 'text-red-400' :
                  indicators.rsi < 30 ? 'text-green-400' : 'text-slate-400'
                )}>
                  RSI {indicators.rsi}
                </span>
              )}
              {indicators.macd !== undefined && (
                <span className={clsx('font-mono', indicators.macd >= 0 ? 'positive' : 'negative')}>
                  MACD {indicators.macd.toFixed(2)}
                </span>
              )}
              {indicators.ma20 !== undefined && (
                <span className="text-blue-400 font-mono">MA20 ${indicators.ma20.toFixed(2)}</span>
              )}
            </div>
          )}
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1 bg-surface-2 rounded-lg p-1">
          {GRANULARITIES.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setGranularity(value)}
              className={clsx(
                'px-2 py-1 rounded text-xs font-medium transition-colors',
                granularity === value
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-400 hover:text-white',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart container */}
      <div ref={containerRef} className="w-full" />
    </div>
  );
}
