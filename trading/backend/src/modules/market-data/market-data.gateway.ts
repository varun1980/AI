import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { CoinbaseService, CoinbaseTicker } from '../coinbase/coinbase.service';
import { MarketDataService } from './market-data.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  },
  namespace: '/trading',
})
export class MarketDataGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MarketDataGateway.name);
  private clientSubscriptions = new Map<string, Set<string>>();

  constructor(
    private coinbase: CoinbaseService,
    private marketData: MarketDataService,
  ) {}

  afterInit() {
    // Broadcast all tickers to subscribed clients
    this.coinbase.on('ticker', (ticker: CoinbaseTicker) => {
      this.server.to(`ticker:${ticker.symbol}`).emit('ticker', ticker);
    });

    // Broadcast connection status
    this.coinbase.on('connected', () => {
      this.server.emit('exchange_status', { connected: true, exchange: 'coinbase' });
    });

    this.coinbase.on('disconnected', () => {
      this.server.emit('exchange_status', { connected: false, exchange: 'coinbase' });
    });

    // Broadcast order updates
    this.coinbase.on('orderUpdate', (order) => {
      this.server.emit('order_update', order);
    });

    this.logger.log('Market data gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected: ${client.id}`);
    this.clientSubscriptions.set(client.id, new Set());
    client.emit('exchange_status', {
      connected: this.coinbase.connected,
      exchange: 'coinbase',
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}`);
    this.clientSubscriptions.delete(client.id);
  }

  @SubscribeMessage('subscribe_ticker')
  handleSubscribeTicker(
    @MessageBody() data: { symbol: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { symbol } = data;
    client.join(`ticker:${symbol}`);
    this.clientSubscriptions.get(client.id)?.add(symbol);
    this.marketData.subscribeToSymbol(symbol);

    // Send current price immediately
    const cached = this.marketData.getCachedTicker(symbol);
    if (cached) {
      client.emit('ticker', cached);
    }

    this.logger.debug(`${client.id} subscribed to ${symbol}`);
    return { subscribed: true, symbol };
  }

  @SubscribeMessage('unsubscribe_ticker')
  handleUnsubscribeTicker(
    @MessageBody() data: { symbol: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { symbol } = data;
    client.leave(`ticker:${symbol}`);
    this.clientSubscriptions.get(client.id)?.delete(symbol);
    return { unsubscribed: true, symbol };
  }

  @SubscribeMessage('get_candles')
  async handleGetCandles(
    @MessageBody() data: { symbol: string; granularity?: string; limit?: number },
    @ConnectedSocket() client: Socket,
  ) {
    const candles = await this.marketData.getCandles(
      data.symbol,
      data.granularity || 'ONE_HOUR',
      data.limit || 200,
    );
    const indicators = this.marketData.computeIndicators(candles);
    client.emit('candles', { symbol: data.symbol, candles, indicators });
    return { fetched: true };
  }

  // Broadcast trade execution to all clients
  broadcastTrade(trade: any) {
    this.server.emit('trade_executed', trade);
  }

  // Broadcast portfolio update
  broadcastPortfolio(portfolio: any) {
    this.server.emit('portfolio_update', portfolio);
  }

  // Broadcast alert triggered
  broadcastAlert(alert: any) {
    this.server.emit('alert_triggered', alert);
  }
}
