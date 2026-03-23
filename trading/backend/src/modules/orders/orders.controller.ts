import { Controller, Post, Delete, Get, Body, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { PlaceOrderDto } from './orders.dto';
import { RiskService } from '../risk/risk.service';
import { CoinbaseService } from '../coinbase/coinbase.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private orders: OrdersService,
    private risk: RiskService,
    private coinbase: CoinbaseService,
  ) {}

  @Post()
  async placeOrder(@Body() dto: PlaceOrderDto) {
    return this.orders.placeOrder(dto);
  }

  @Delete(':orderId')
  async cancelOrder(@Param('orderId') orderId: string) {
    const cancelled = await this.orders.cancelOrder(orderId);
    return { cancelled };
  }

  @Get('open')
  async getOpenOrders() {
    return this.orders.getOpenOrders();
  }

  @Post('risk-check')
  async riskCheck(@Body() dto: PlaceOrderDto) {
    const ticker = await this.coinbase.getTicker(dto.symbol);
    const entryPrice = dto.limitPrice || ticker.price;
    const accounts = await this.coinbase.getAccounts();
    const usd = accounts.find((a) => a.currency === 'USD');
    const balance = parseFloat(usd?.availableBalance?.value || '10000');

    const assessment = this.risk.assessRisk({
      side: dto.side,
      symbol: dto.symbol,
      size: dto.size,
      entryPrice,
      stopLoss: dto.stopLoss,
      riskPercent: dto.riskPercent ?? 2,
      accountBalance: balance,
    });

    return {
      ...assessment,
      entryPrice,
      balance,
      positionValue: dto.size * entryPrice,
    };
  }
}
