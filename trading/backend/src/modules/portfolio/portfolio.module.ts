import { Module } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { PortfolioController } from './portfolio.controller';
import { CoinbaseModule } from '../coinbase/coinbase.module';
import { MarketDataModule } from '../market-data/market-data.module';

@Module({
  imports: [CoinbaseModule, MarketDataModule],
  providers: [PortfolioService],
  controllers: [PortfolioController],
  exports: [PortfolioService],
})
export class PortfolioModule {}
