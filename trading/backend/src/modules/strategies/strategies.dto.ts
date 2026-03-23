import { IsString, IsEnum, IsNumber, IsOptional, IsBoolean, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum ConditionType {
  PRICE_ABOVE = 'PRICE_ABOVE',
  PRICE_BELOW = 'PRICE_BELOW',
  PRICE_CROSSES_UP = 'PRICE_CROSSES_UP',
  PRICE_CROSSES_DOWN = 'PRICE_CROSSES_DOWN',
  RSI_ABOVE = 'RSI_ABOVE',
  RSI_BELOW = 'RSI_BELOW',
  MA_CROSSOVER_UP = 'MA_CROSSOVER_UP',
  MA_CROSSOVER_DOWN = 'MA_CROSSOVER_DOWN',
  PERCENT_CHANGE_UP = 'PERCENT_CHANGE_UP',
  PERCENT_CHANGE_DOWN = 'PERCENT_CHANGE_DOWN',
}

export enum ActionSide { BUY = 'BUY', SELL = 'SELL' }
export enum ActionOrderType { MARKET = 'MARKET', LIMIT = 'LIMIT' }
export enum LogicOperator { AND = 'AND', OR = 'OR' }

export class StrategyConditionDto {
  @IsEnum(ConditionType)
  type: ConditionType;

  @IsNumber()
  value: number;

  @IsOptional()
  @IsNumber()
  value2?: number; // For range conditions

  @IsOptional()
  @IsString()
  period?: string; // For MA/RSI period
}

export class StrategyActionDto {
  @IsEnum(ActionSide)
  side: ActionSide;

  @IsEnum(ActionOrderType)
  orderType: ActionOrderType;

  @IsNumber()
  @Min(0)
  size: number; // base asset size

  @IsOptional()
  @IsNumber()
  limitPriceOffset?: number; // offset from current price for limit orders

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(5)
  takeProfitPercent?: number;
}

export class CreateStrategyDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  symbol: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StrategyConditionDto)
  conditions: StrategyConditionDto[];

  @IsEnum(LogicOperator)
  logicOperator: LogicOperator;

  @ValidateNested()
  @Type(() => StrategyActionDto)
  action: StrategyActionDto;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(5)
  riskPercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cooldownMinutes?: number;

  @IsOptional()
  @IsNumber()
  maxPositionSize?: number;
}

export class UpdateStrategyDto extends CreateStrategyDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  symbol?: string;

  @IsOptional()
  conditions?: StrategyConditionDto[];

  @IsOptional()
  action?: StrategyActionDto;
}
