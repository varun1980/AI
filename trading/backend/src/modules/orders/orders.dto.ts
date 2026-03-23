import { IsString, IsEnum, IsNumber, IsOptional, IsBoolean, Min, Max } from 'class-validator';

export enum OrderSide { BUY = 'BUY', SELL = 'SELL' }
export enum OrderType { MARKET = 'MARKET', LIMIT = 'LIMIT', STOP_LIMIT = 'STOP_LIMIT' }

export class PlaceOrderDto {
  @IsString()
  symbol: string;

  @IsEnum(OrderSide)
  side: OrderSide;

  @IsEnum(OrderType)
  orderType: OrderType;

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

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(5)
  riskPercent?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  strategyId?: string;
}

export class CancelOrderDto {
  @IsString()
  orderId: string;
}
