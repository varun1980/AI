import { Controller, Get, Query, Param } from '@nestjs/common';
import { TradeHistoryService } from './trade-history.service';

@Controller('trades')
export class TradeHistoryController {
  constructor(private history: TradeHistoryService) {}

  @Get()
  findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('symbol') symbol: string,
    @Query('side') side: string,
    @Query('status') status: string,
  ) {
    return this.history.findAll({
      page: parseInt(page || '1'),
      limit: parseInt(limit || '20'),
      symbol,
      side,
      status,
    });
  }

  @Get('stats')
  getStats() {
    return this.history.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.history.findOne(id);
  }
}
