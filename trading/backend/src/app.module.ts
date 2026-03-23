import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { CoinbaseModule } from './modules/coinbase/coinbase.module';
import { MarketDataModule } from './modules/market-data/market-data.module';
import { OrdersModule } from './modules/orders/orders.module';
import { RiskModule } from './modules/risk/risk.module';
import { StrategiesModule } from './modules/strategies/strategies.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { PortfolioModule } from './modules/portfolio/portfolio.module';
import { TradeHistoryModule } from './modules/trade-history/trade-history.module';
import { AlertsModule } from './modules/alerts/alerts.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    CoinbaseModule,
    MarketDataModule,
    OrdersModule,
    RiskModule,
    StrategiesModule,
    SchedulerModule,
    PortfolioModule,
    TradeHistoryModule,
    AlertsModule,
  ],
})
export class AppModule {}
