import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { CoinbaseModule } from '../coinbase/coinbase.module';
import { RiskModule } from '../risk/risk.module';
import { MarketDataModule } from '../market-data/market-data.module';

@Module({
  imports: [CoinbaseModule, RiskModule, MarketDataModule],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
