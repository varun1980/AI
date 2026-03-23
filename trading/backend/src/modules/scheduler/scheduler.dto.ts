import { IsString, IsEnum, IsNumber, IsOptional, IsBoolean, Min, Max } from 'class-validator';

export enum ScheduledSide { BUY = 'BUY', SELL = 'SELL' }
export enum ScheduledOrderType { MARKET = 'MARKET', LIMIT = 'LIMIT' }

export class CreateScheduledOrderDto {
  @IsString()
  name: string;

  @IsString()
  symbol: string;

  @IsEnum(ScheduledSide)
  side: ScheduledSide;

  @IsEnum(ScheduledOrderType)
  orderType: ScheduledOrderType;

  @IsNumber()
  @Min(0)
  size: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  limitPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stopLoss?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  takeProfit?: number;

  @IsString()
  cronExpr: string; // e.g. "0 9 * * 1-5" = 9am Mon-Fri

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(5)
  riskPercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxRuns?: number;
}
