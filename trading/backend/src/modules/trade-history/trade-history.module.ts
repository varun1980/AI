import { Module } from '@nestjs/common';
import { TradeHistoryService } from './trade-history.service';
import { TradeHistoryController } from './trade-history.controller';

@Module({
  providers: [TradeHistoryService],
  controllers: [TradeHistoryController],
})
export class TradeHistoryModule {}
