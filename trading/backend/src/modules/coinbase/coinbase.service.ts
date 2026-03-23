import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import * as crypto from 'crypto';
import * as WebSocket from 'ws';
import { EventEmitter } from 'events';

export interface CoinbaseTicker {
  symbol: string;
  price: number;
  bid: number;
  ask: number;
  volume24h: number;
  change24h: number;
  changePercent24h: number;
  timestamp: string;
}

export interface CoinbaseCandle {
  start: number;
  low: number;
  high: number;
  open: number;
  close: number;
  volume: number;
}

export interface CoinbaseOrderRequest {
  clientOrderId: string;
  productId: string;
  side: 'BUY' | 'SELL';
  orderType: 'MARKET' | 'LIMIT' | 'STOP_LIMIT';
  baseSize?: string;
  quoteSize?: string;
  limitPrice?: string;
  stopPrice?: string;
  stopDirection?: 'STOP_DIRECTION_STOP_UP' | 'STOP_DIRECTION_STOP_DOWN';
  postOnly?: boolean;
}

export interface CoinbaseOrder {
  orderId: string;
  productId: string;
  side: string;
  status: string;
  filledSize: string;
  avgFillPrice: string;
  totalFees: string;
  totalValueAfterFees: string;
  createdTime: string;
  filledTime?: string;
  orderConfiguration: any;
}

export interface CoinbaseAccount {
  uuid: string;
  name: string;
  currency: string;
  availableBalance: { value: string; currency: string };
  hold: { value: string; currency: string };
}

@Injectable()
export class CoinbaseService extends EventEmitter implements OnModuleInit {
  private readonly logger = new Logger(CoinbaseService.name);
  private readonly baseUrl = 'https://api.coinbase.com/api/v3/brokerage';
  private readonly wsUrl = 'wss://advanced-trade-ws.coinbase.com';
  private http: AxiosInstance;
  private ws: WebSocket | null = null;
  private subscribedProducts: Set<string> = new Set();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isConnected = false;
  private isPaper: boolean;

  // Paper trading state
  private paperBalance = 10000; // $10,000 paper money
  private paperPositions: Map<string, { size: number; avgPrice: number }> = new Map();
  private paperOrders: Map<string, any> = new Map();

  constructor(private config: ConfigService) {
    super();
  }

  async onModuleInit() {
    this.isPaper = this.config.get<string>('PAPER_TRADING', 'true') === 'true';
    await this.setupHttp();
    this.connectWebSocket();
    this.logger.log(`Coinbase service initialized (${this.isPaper ? 'PAPER' : 'LIVE'} trading)`);
  }

  private setupHttp() {
    this.http = axios.create({ baseURL: this.baseUrl });
    this.http.interceptors.request.use((config) => {
      const apiKey = this.config.get<string>('COINBASE_API_KEY', '');
      const apiSecret = this.config.get<string>('COINBASE_API_SECRET', '');
      if (apiKey && apiSecret) {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const method = config.method?.toUpperCase() || 'GET';
        const path = config.url?.replace(this.baseUrl, '') || '';
        const body = config.data ? JSON.stringify(config.data) : '';
        const message = timestamp + method + path + body;
        const signature = crypto.createHmac('sha256', apiSecret).update(message).digest('hex');
        config.headers['CB-ACCESS-KEY'] = apiKey;
        config.headers['CB-ACCESS-SIGN'] = signature;
        config.headers['CB-ACCESS-TIMESTAMP'] = timestamp;
        config.headers['Content-Type'] = 'application/json';
      }
      return config;
    });
  }

  private connectWebSocket() {
    if (this.ws) {
      this.ws.removeAllListeners();
      this.ws.close();
    }

    this.ws = new WebSocket(this.wsUrl);

    this.ws.on('open', () => {
      this.isConnected = true;
      this.logger.log('Coinbase WebSocket connected');
      if (this.subscribedProducts.size > 0) {
        this.subscribeToProducts([...this.subscribedProducts]);
      }
      this.startHeartbeat();
      this.emit('connected');
    });

    this.ws.on('message', (data: Buffer) => {
      try {
        const msg = JSON.parse(data.toString());
        this.handleWebSocketMessage(msg);
      } catch (e) {
        this.logger.error('WS parse error', e);
      }
    });

    this.ws.on('close', () => {
      this.isConnected = false;
      this.stopHeartbeat();
      this.logger.warn('Coinbase WebSocket disconnected, reconnecting in 3s...');
      this.reconnectTimeout = setTimeout(() => this.connectWebSocket(), 3000);
      this.emit('disconnected');
    });

    this.ws.on('error', (err) => {
      this.logger.error('WebSocket error:', err.message);
    });
  }

  private handleWebSocketMessage(msg: any) {
    const { channel, events } = msg;

    if (channel === 'ticker' && events) {
      for (const event of events) {
        if (event.tickers) {
          for (const ticker of event.tickers) {
            const data: CoinbaseTicker = {
              symbol: ticker.product_id,
              price: parseFloat(ticker.price),
              bid: parseFloat(ticker.best_bid || ticker.price),
              ask: parseFloat(ticker.best_ask || ticker.price),
              volume24h: parseFloat(ticker.volume_24_h || 0),
              change24h: parseFloat(ticker.price_percent_chg_24_h || 0) *
                parseFloat(ticker.price) / 100,
              changePercent24h: parseFloat(ticker.price_percent_chg_24_h || 0),
              timestamp: new Date().toISOString(),
            };
            this.emit('ticker', data);
          }
        }
      }
    }

    if (channel === 'user' && events) {
      for (const event of events) {
        if (event.orders) {
          for (const order of event.orders) {
            this.emit('orderUpdate', order);
          }
        }
      }
    }
  }

  private subscribeToProducts(products: string[]) {
    if (!this.isConnected || !this.ws) return;

    const apiKey = this.config.get<string>('COINBASE_API_KEY', '');
    const apiSecret = this.config.get<string>('COINBASE_API_SECRET', '');
    const timestamp = Math.floor(Date.now() / 1000).toString();

    const channels = ['ticker'];
    if (apiKey && apiSecret) channels.push('user');

    let signature = '';
    if (apiKey && apiSecret) {
      const message = timestamp + 'ticker' + products.join('');
      signature = crypto.createHmac('sha256', apiSecret).update(message).digest('hex');
    }

    const subscribeMsg: any = {
      type: 'subscribe',
      product_ids: products,
      channel: 'ticker',
    };

    if (apiKey) {
      subscribeMsg.api_key = apiKey;
      subscribeMsg.timestamp = timestamp;
      subscribeMsg.signature = signature;
    }

    this.ws.send(JSON.stringify(subscribeMsg));
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.ping();
      }
    }, 20000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  subscribeToMarket(productId: string) {
    this.subscribedProducts.add(productId);
    if (this.isConnected) {
      this.subscribeToProducts([productId]);
    }
  }

  unsubscribeFromMarket(productId: string) {
    this.subscribedProducts.delete(productId);
  }

  async getTicker(productId: string): Promise<CoinbaseTicker> {
    if (this.isPaper) {
      // Fetch real price but simulate paper account
      return this.fetchRealTicker(productId);
    }
    return this.fetchRealTicker(productId);
  }

  private async fetchRealTicker(productId: string): Promise<CoinbaseTicker> {
    try {
      const res = await axios.get(
        `https://api.coinbase.com/api/v3/brokerage/best_bid_ask?product_ids=${productId}`,
      );
      const pricebook = res.data?.pricebooks?.[0];
      const price = pricebook
        ? (parseFloat(pricebook.bids?.[0]?.price || 0) + parseFloat(pricebook.asks?.[0]?.price || 0)) / 2
        : 0;
      return {
        symbol: productId,
        price,
        bid: parseFloat(pricebook?.bids?.[0]?.price || price.toString()),
        ask: parseFloat(pricebook?.asks?.[0]?.price || price.toString()),
        volume24h: 0,
        change24h: 0,
        changePercent24h: 0,
        timestamp: new Date().toISOString(),
      };
    } catch {
      // Fallback to product endpoint
      const res = await axios.get(`https://api.coinbase.com/api/v3/brokerage/products/${productId}`);
      const price = parseFloat(res.data?.price || '0');
      return {
        symbol: productId,
        price,
        bid: price,
        ask: price,
        volume24h: parseFloat(res.data?.volume_24h || '0'),
        change24h: parseFloat(res.data?.price_percentage_change_24h || '0') * price / 100,
        changePercent24h: parseFloat(res.data?.price_percentage_change_24h || '0'),
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getCandles(productId: string, granularity: string, start: number, end: number): Promise<CoinbaseCandle[]> {
    try {
      const res = await axios.get(
        `https://api.coinbase.com/api/v3/brokerage/products/${productId}/candles`,
        { params: { start, end, granularity } },
      );
      return (res.data?.candles || []).map((c: any) => ({
        start: parseInt(c.start),
        low: parseFloat(c.low),
        high: parseFloat(c.high),
        open: parseFloat(c.open),
        close: parseFloat(c.close),
        volume: parseFloat(c.volume),
      }));
    } catch (e) {
      this.logger.error(`Failed to fetch candles: ${e.message}`);
      return [];
    }
  }

  async getProducts(): Promise<any[]> {
    try {
      const res = await axios.get(
        'https://api.coinbase.com/api/v3/brokerage/products?product_type=SPOT&limit=100',
      );
      return res.data?.products || [];
    } catch {
      // Return popular defaults if API fails
      return [
        { product_id: 'BTC-USD', base_currency_id: 'BTC', quote_currency_id: 'USD' },
        { product_id: 'ETH-USD', base_currency_id: 'ETH', quote_currency_id: 'USD' },
        { product_id: 'SOL-USD', base_currency_id: 'SOL', quote_currency_id: 'USD' },
        { product_id: 'XRP-USD', base_currency_id: 'XRP', quote_currency_id: 'USD' },
        { product_id: 'ADA-USD', base_currency_id: 'ADA', quote_currency_id: 'USD' },
        { product_id: 'DOGE-USD', base_currency_id: 'DOGE', quote_currency_id: 'USD' },
        { product_id: 'AVAX-USD', base_currency_id: 'AVAX', quote_currency_id: 'USD' },
        { product_id: 'LINK-USD', base_currency_id: 'LINK', quote_currency_id: 'USD' },
        { product_id: 'MATIC-USD', base_currency_id: 'MATIC', quote_currency_id: 'USD' },
        { product_id: 'DOT-USD', base_currency_id: 'DOT', quote_currency_id: 'USD' },
      ];
    }
  }

  async getAccounts(): Promise<CoinbaseAccount[]> {
    if (this.isPaper) {
      return this.getPaperAccounts();
    }
    try {
      const res = await this.http.get('/accounts');
      return (res.data?.accounts || []).map((a: any) => ({
        uuid: a.uuid,
        name: a.name,
        currency: a.currency,
        availableBalance: a.available_balance,
        hold: a.hold,
      }));
    } catch (e) {
      this.logger.error(`Failed to get accounts: ${e.message}`);
      return [];
    }
  }

  private getPaperAccounts(): CoinbaseAccount[] {
    const accounts: CoinbaseAccount[] = [
      {
        uuid: 'paper-usd',
        name: 'Paper USD',
        currency: 'USD',
        availableBalance: { value: this.paperBalance.toFixed(2), currency: 'USD' },
        hold: { value: '0', currency: 'USD' },
      },
    ];
    this.paperPositions.forEach((pos, symbol) => {
      accounts.push({
        uuid: `paper-${symbol.split('-')[0].toLowerCase()}`,
        name: `Paper ${symbol.split('-')[0]}`,
        currency: symbol.split('-')[0],
        availableBalance: { value: pos.size.toFixed(8), currency: symbol.split('-')[0] },
        hold: { value: '0', currency: symbol.split('-')[0] },
      });
    });
    return accounts;
  }

  async placeOrder(req: CoinbaseOrderRequest): Promise<CoinbaseOrder> {
    if (this.isPaper) {
      return this.placePaperOrder(req);
    }

    const apiKey = this.config.get<string>('COINBASE_API_KEY', '');
    if (!apiKey) {
      throw new Error('No Coinbase API key configured. Enable paper trading or add API credentials.');
    }

    try {
      const body: any = {
        client_order_id: req.clientOrderId,
        product_id: req.productId,
        side: req.side,
        order_configuration: {},
      };

      if (req.orderType === 'MARKET') {
        if (req.side === 'BUY') {
          body.order_configuration.market_market_ioc = { quote_size: req.quoteSize || (parseFloat(req.baseSize || '0') * await this.getCurrentPrice(req.productId)).toFixed(2) };
        } else {
          body.order_configuration.market_market_ioc = { base_size: req.baseSize };
        }
      } else if (req.orderType === 'LIMIT') {
        body.order_configuration.limit_limit_gtc = {
          base_size: req.baseSize,
          limit_price: req.limitPrice,
          post_only: req.postOnly || false,
        };
      } else if (req.orderType === 'STOP_LIMIT') {
        body.order_configuration.stop_limit_stop_limit_gtc = {
          base_size: req.baseSize,
          limit_price: req.limitPrice,
          stop_price: req.stopPrice,
          stop_direction: req.stopDirection || 'STOP_DIRECTION_STOP_DOWN',
        };
      }

      const res = await this.http.post('/orders', body);
      return this.mapOrder(res.data?.order || res.data);
    } catch (e) {
      throw new Error(`Order placement failed: ${e.response?.data?.message || e.message}`);
    }
  }

  private async getCurrentPrice(productId: string): Promise<number> {
    const ticker = await this.getTicker(productId);
    return ticker.price;
  }

  private async placePaperOrder(req: CoinbaseOrderRequest): Promise<CoinbaseOrder> {
    const price = await this.getCurrentPrice(req.productId);
    const size = parseFloat(req.baseSize || '0') || parseFloat(req.quoteSize || '0') / price;
    const cost = size * price;
    const orderId = `paper-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const fees = cost * 0.005; // 0.5% paper fee

    if (req.side === 'BUY') {
      if (this.paperBalance < cost + fees) {
        throw new Error(`Insufficient paper balance. Required: $${(cost + fees).toFixed(2)}, Available: $${this.paperBalance.toFixed(2)}`);
      }
      this.paperBalance -= cost + fees;
      const existing = this.paperPositions.get(req.productId);
      if (existing) {
        const totalSize = existing.size + size;
        const avgPrice = (existing.avgPrice * existing.size + price * size) / totalSize;
        this.paperPositions.set(req.productId, { size: totalSize, avgPrice });
      } else {
        this.paperPositions.set(req.productId, { size, avgPrice: price });
      }
    } else {
      const pos = this.paperPositions.get(req.productId);
      if (!pos || pos.size < size) {
        throw new Error(`Insufficient paper position. Required: ${size}, Available: ${pos?.size || 0}`);
      }
      this.paperBalance += cost - fees;
      const remaining = pos.size - size;
      if (remaining < 0.00001) {
        this.paperPositions.delete(req.productId);
      } else {
        this.paperPositions.set(req.productId, { size: remaining, avgPrice: pos.avgPrice });
      }
    }

    const order: CoinbaseOrder = {
      orderId,
      productId: req.productId,
      side: req.side,
      status: 'FILLED',
      filledSize: size.toFixed(8),
      avgFillPrice: price.toFixed(2),
      totalFees: fees.toFixed(2),
      totalValueAfterFees: req.side === 'BUY'
        ? (cost + fees).toFixed(2)
        : (cost - fees).toFixed(2),
      createdTime: new Date().toISOString(),
      filledTime: new Date().toISOString(),
      orderConfiguration: {},
    };

    this.logger.log(
      `PAPER ${req.side} ${size.toFixed(8)} ${req.productId} @ $${price.toFixed(2)} | Balance: $${this.paperBalance.toFixed(2)}`,
    );
    setTimeout(() => this.emit('orderUpdate', { ...order, order_id: order.orderId }), 100);
    return order;
  }

  async cancelOrder(orderId: string): Promise<boolean> {
    if (this.isPaper) {
      this.paperOrders.delete(orderId);
      return true;
    }
    try {
      await this.http.post('/orders/batch_cancel', { order_ids: [orderId] });
      return true;
    } catch (e) {
      this.logger.error(`Cancel order failed: ${e.message}`);
      return false;
    }
  }

  async getOrder(orderId: string): Promise<CoinbaseOrder | null> {
    if (this.isPaper) {
      return this.paperOrders.get(orderId) || null;
    }
    try {
      const res = await this.http.get(`/orders/historical/${orderId}`);
      return this.mapOrder(res.data?.order);
    } catch {
      return null;
    }
  }

  async getOrderHistory(limit = 50): Promise<CoinbaseOrder[]> {
    if (this.isPaper) return [];
    try {
      const res = await this.http.get('/orders/historical/batch', { params: { limit } });
      return (res.data?.orders || []).map((o: any) => this.mapOrder(o));
    } catch {
      return [];
    }
  }

  private mapOrder(o: any): CoinbaseOrder {
    if (!o) return null;
    return {
      orderId: o.order_id || o.orderId,
      productId: o.product_id || o.productId,
      side: o.side,
      status: o.status,
      filledSize: o.filled_size || '0',
      avgFillPrice: o.average_filled_price || '0',
      totalFees: o.total_fees || '0',
      totalValueAfterFees: o.total_value_after_fees || '0',
      createdTime: o.created_time || new Date().toISOString(),
      filledTime: o.last_fill_time,
      orderConfiguration: o.order_configuration || {},
    };
  }

  getPaperBalance(): number {
    return this.paperBalance;
  }

  getPaperPositions(): Map<string, { size: number; avgPrice: number }> {
    return this.paperPositions;
  }

  get connected(): boolean {
    return this.isConnected;
  }
}
