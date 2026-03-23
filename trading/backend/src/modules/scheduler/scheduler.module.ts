import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { SchedulerController } from './scheduler.controller';
import { CoinbaseModule } from '../coinbase/coinbase.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [CoinbaseModule, OrdersModule],
  providers: [SchedulerService],
  controllers: [SchedulerController],
})
export class SchedulerModule {}
