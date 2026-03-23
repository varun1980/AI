import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CoinbaseService, CoinbaseTicker } from '../coinbase/coinbase.service';

export interface OHLCV {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IndicatorResult {
  rsi?: number;
  ma20?: number;
  ma50?: number;
  ema12?: number;
  ema26?: number;
  macd?: number;
  macdSignal?: number;
  macdHist?: number;
  bb_upper?: number;
  bb_middle?: number;
  bb_lower?: number;
}

@Injectable()
export class MarketDataService implements OnModuleInit {
  private readonly logger = new Logger(MarketDataService.name);
  private priceCache = new Map<string, CoinbaseTicker>();
  private candleCache = new Map<string, OHLCV[]>();

  constructor(private coinbase: CoinbaseService) {}

  onModuleInit() {
    this.coinbase.on('ticker', (ticker: CoinbaseTicker) => {
      this.priceCache.set(ticker.symbol, ticker);
    });
  }

  async getPrice(symbol: string): Promise<number> {
    const cached = this.priceCache.get(symbol);
    if (cached && Date.now() - new Date(cached.timestamp).getTime() < 5000) {
      return cached.price;
    }
    const ticker = await this.coinbase.getTicker(symbol);
    this.priceCache.set(symbol, ticker);
    return ticker.price;
  }

  async getTicker(symbol: string): Promise<CoinbaseTicker> {
    const cached = this.priceCache.get(symbol);
    if (cached && Date.now() - new Date(cached.timestamp).getTime() < 5000) {
      return cached;
    }
    const ticker = await this.coinbase.getTicker(symbol);
    this.priceCache.set(symbol, ticker);
    return ticker;
  }

  async getCandles(symbol: string, granularity = 'ONE_HOUR', limit = 200): Promise<OHLCV[]> {
    const granularitySeconds: Record<string, number> = {
      ONE_MINUTE: 60,
      FIVE_MINUTE: 300,
      FIFTEEN_MINUTE: 900,
      THIRTY_MINUTE: 1800,
      ONE_HOUR: 3600,
      TWO_HOUR: 7200,
      SIX_HOUR: 21600,
      ONE_DAY: 86400,
    };

    const secs = granularitySeconds[granularity] || 3600;
    const end = Math.floor(Date.now() / 1000);
    const start = end - secs * limit;

    const candles = await this.coinbase.getCandles(symbol, granularity, start, end);
    const ohlcv = candles
      .map((c) => ({
        time: c.start,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        volume: c.volume,
      }))
      .sort((a, b) => a.time - b.time);

    this.candleCache.set(`${symbol}-${granularity}`, ohlcv);
    return ohlcv;
  }

  computeIndicators(candles: OHLCV[]): IndicatorResult {
    if (candles.length < 2) return {};

    const closes = candles.map((c) => c.close);
    const result: IndicatorResult = {};

    // RSI (14 periods)
    result.rsi = this.computeRSI(closes, 14);

    // Simple Moving Averages
    result.ma20 = this.sma(closes, 20);
    result.ma50 = this.sma(closes, 50);

    // EMA for MACD
    result.ema12 = this.ema(closes, 12);
    result.ema26 = this.ema(closes, 26);

    if (result.ema12 !== undefined && result.ema26 !== undefined) {
      result.macd = result.ema12 - result.ema26;

      // MACD Signal (9-period EMA of MACD)
      const macdValues = closes.slice(-30).map((_, i) => {
        const slice = closes.slice(0, closes.length - 30 + i + 1);
        const e12 = this.ema(slice, 12);
        const e26 = this.ema(slice, 26);
        return e12 !== undefined && e26 !== undefined ? e12 - e26 : 0;
      });
      result.macdSignal = this.ema(macdValues, 9);
      if (result.macdSignal !== undefined) {
        result.macdHist = result.macd - result.macdSignal;
      }
    }

    // Bollinger Bands (20, 2)
    const bb = this.bollingerBands(closes, 20, 2);
    if (bb) {
      result.bb_upper = bb.upper;
      result.bb_middle = bb.middle;
      result.bb_lower = bb.lower;
    }

    return result;
  }

  private computeRSI(closes: number[], period = 14): number | undefined {
    if (closes.length < period + 1) return undefined;

    let gains = 0, losses = 0;
    for (let i = closes.length - period; i < closes.length; i++) {
      const diff = closes[i] - closes[i - 1];
      if (diff > 0) gains += diff;
      else losses -= diff;
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return parseFloat((100 - 100 / (1 + rs)).toFixed(2));
  }

  private sma(values: number[], period: number): number | undefined {
    if (values.length < period) return undefined;
    const slice = values.slice(-period);
    return slice.reduce((a, b) => a + b, 0) / period;
  }

  private ema(values: number[], period: number): number | undefined {
    if (values.length < period) return undefined;
    const k = 2 / (period + 1);
    let ema = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
    for (let i = period; i < values.length; i++) {
      ema = values[i] * k + ema * (1 - k);
    }
    return ema;
  }

  private bollingerBands(values: number[], period: number, stdDev: number) {
    if (values.length < period) return null;
    const slice = values.slice(-period);
    const middle = slice.reduce((a, b) => a + b, 0) / period;
    const variance = slice.reduce((sum, v) => sum + Math.pow(v - middle, 2), 0) / period;
    const std = Math.sqrt(variance);
    return {
      upper: middle + stdDev * std,
      middle,
      lower: middle - stdDev * std,
    };
  }

  subscribeToSymbol(symbol: string) {
    this.coinbase.subscribeToMarket(symbol);
  }

  getCachedTicker(symbol: string): CoinbaseTicker | undefined {
    return this.priceCache.get(symbol);
  }
}
