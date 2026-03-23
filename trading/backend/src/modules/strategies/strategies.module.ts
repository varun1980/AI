import { Module } from '@nestjs/common';
import { StrategiesService } from './strategies.service';
import { StrategiesController } from './strategies.controller';
import { CoinbaseModule } from '../coinbase/coinbase.module';
import { MarketDataModule } from '../market-data/market-data.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [CoinbaseModule, MarketDataModule, OrdersModule],
  providers: [StrategiesService],
  controllers: [StrategiesController],
})
export class StrategiesModule {}
