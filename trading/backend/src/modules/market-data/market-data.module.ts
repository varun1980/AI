import { Module } from '@nestjs/common';
import { MarketDataService } from './market-data.service';
import { MarketDataGateway } from './market-data.gateway';
import { CoinbaseModule } from '../coinbase/coinbase.module';

@Module({
  imports: [CoinbaseModule],
  providers: [MarketDataService, MarketDataGateway],
  exports: [MarketDataService, MarketDataGateway],
})
export class MarketDataModule {}
