import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { MarketDataService } from '../market-data/market-data.service';
import { OrdersService } from '../orders/orders.service';
import { CoinbaseService } from '../coinbase/coinbase.service';
import { CreateStrategyDto, UpdateStrategyDto, ConditionType, LogicOperator } from './strategies.dto';

@Injectable()
export class StrategiesService {
  private readonly logger = new Logger(StrategiesService.name);
  // Track last known prices for crossing conditions
  private prevPrices = new Map<string, number>();

  constructor(
    private prisma: PrismaService,
    private marketData: MarketDataService,
    private orders: OrdersService,
    private coinbase: CoinbaseService,
  ) {
    // Subscribe to price updates for fast condition evaluation
    this.coinbase.on('ticker', (ticker) => {
      this.prevPrices.set(ticker.symbol, ticker.price);
    });
  }

  async create(dto: CreateStrategyDto) {
    return this.prisma.strategy.create({
      data: {
        name: dto.name,
        description: dto.description,
        symbol: dto.symbol,
        conditions: dto.conditions as any,
        action: { ...dto.action, logicOperator: dto.logicOperator } as any,
        riskPercent: dto.riskPercent ?? 2,
        cooldownMinutes: dto.cooldownMinutes ?? 0,
        maxPositionSize: dto.maxPositionSize ? dto.maxPositionSize : null,
      },
    });
  }

  async findAll() {
    return this.prisma.strategy.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { trades: true } } },
    });
  }

  async findOne(id: string) {
    const s = await this.prisma.strategy.findUnique({
      where: { id },
      include: { trades: { take: 10, orderBy: { createdAt: 'desc' } } },
    });
    if (!s) throw new NotFoundException('Strategy not found');
    return s;
  }

  async update(id: string, dto: UpdateStrategyDto) {
    await this.findOne(id);
    return this.prisma.strategy.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        symbol: dto.symbol,
        conditions: dto.conditions as any,
        action: dto.action ? { ...dto.action, logicOperator: (dto as any).logicOperator } as any : undefined,
        riskPercent: dto.riskPercent,
        cooldownMinutes: dto.cooldownMinutes,
        maxPositionSize: dto.maxPositionSize,
      },
    });
  }

  async activate(id: string) {
    const strategy = await this.findOne(id);
    // Subscribe to market for this symbol
    this.marketData.subscribeToSymbol(strategy.symbol);
    return this.prisma.strategy.update({
      where: { id },
      data: { status: 'ACTIVE' },
    });
  }

  async pause(id: string) {
    return this.prisma.strategy.update({
      where: { id },
      data: { status: 'PAUSED' },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.strategy.delete({ where: { id } });
  }

  /**
   * Main strategy evaluation loop - runs every 10 seconds
   */
  @Cron('*/10 * * * * *')
  async evaluateStrategies() {
    const activeStrategies = await this.prisma.strategy.findMany({
      where: { status: 'ACTIVE' },
    });

    for (const strategy of activeStrategies) {
      try {
        await this.evaluateStrategy(strategy);
      } catch (e) {
        this.logger.error(`Strategy ${strategy.id} evaluation error: ${e.message}`);
      }
    }
  }

  private async evaluateStrategy(strategy: any) {
    const conditions = strategy.conditions as any[];
    const action = strategy.action as any;
    const logicOp: LogicOperator = action.logicOperator || LogicOperator.AND;

    // Cooldown check
    if (strategy.lastTriggeredAt && strategy.cooldownMinutes > 0) {
      const elapsed = (Date.now() - new Date(strategy.lastTriggeredAt).getTime()) / 60000;
      if (elapsed < strategy.cooldownMinutes) return;
    }

    // Get market data
    const ticker = await this.marketData.getTicker(strategy.symbol);
    const candles = await this.marketData.getCandles(strategy.symbol, 'ONE_HOUR', 100);
    const indicators = this.marketData.computeIndicators(candles);

    // Evaluate conditions
    const results = conditions.map((cond) =>
      this.evaluateCondition(cond, ticker.price, indicators, strategy.symbol),
    );

    const triggered = logicOp === LogicOperator.AND
      ? results.every(Boolean)
      : results.some(Boolean);

    if (!triggered) return;

    this.logger.log(`Strategy "${strategy.name}" triggered for ${strategy.symbol}`);

    // Execute action
    const accounts = await this.coinbase.getAccounts();
    const usd = accounts.find((a) => a.currency === 'USD');
    const balance = parseFloat(usd?.availableBalance?.value || '10000');

    await this.orders.placeOrder(
      {
        symbol: strategy.symbol,
        side: action.side,
        orderType: action.orderType,
        size: action.size,
        limitPrice: action.orderType === 'LIMIT'
          ? ticker.price * (1 + (action.limitPriceOffset || 0) / 100)
          : undefined,
        riskPercent: parseFloat(strategy.riskPercent.toString()),
        notes: `Strategy: ${strategy.name}`,
        strategyId: strategy.id,
      },
      balance,
    );

    // Update strategy stats
    await this.prisma.strategy.update({
      where: { id: strategy.id },
      data: {
        lastTriggeredAt: new Date(),
        triggerCount: { increment: 1 },
      },
    });
  }

  private evaluateCondition(
    condition: any,
    currentPrice: number,
    indicators: any,
    symbol: string,
  ): boolean {
    const prevPrice = this.prevPrices.get(symbol) || currentPrice;
    const { type, value } = condition;

    switch (type as ConditionType) {
      case ConditionType.PRICE_ABOVE:
        return currentPrice > value;
      case ConditionType.PRICE_BELOW:
        return currentPrice < value;
      case ConditionType.PRICE_CROSSES_UP:
        return prevPrice <= value && currentPrice > value;
      case ConditionType.PRICE_CROSSES_DOWN:
        return prevPrice >= value && currentPrice < value;
      case ConditionType.RSI_ABOVE:
        return indicators.rsi !== undefined && indicators.rsi > value;
      case ConditionType.RSI_BELOW:
        return indicators.rsi !== undefined && indicators.rsi < value;
      case ConditionType.MA_CROSSOVER_UP:
        return indicators.ma20 !== undefined && indicators.ma50 !== undefined &&
          currentPrice > indicators.ma20 && currentPrice > indicators.ma50;
      case ConditionType.MA_CROSSOVER_DOWN:
        return indicators.ma20 !== undefined && indicators.ma50 !== undefined &&
          currentPrice < indicators.ma20 && currentPrice < indicators.ma50;
      case ConditionType.PERCENT_CHANGE_UP:
        return indicators.rsi !== undefined &&
          ((currentPrice - prevPrice) / prevPrice) * 100 >= value;
      case ConditionType.PERCENT_CHANGE_DOWN:
        return ((prevPrice - currentPrice) / prevPrice) * 100 >= value;
      default:
        return false;
    }
  }
}
