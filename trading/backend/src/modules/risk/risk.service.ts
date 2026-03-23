import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import Decimal from 'decimal.js';

export const MAX_LOSS_PERCENT = 5; // Hard limit: never lose more than 5% per trade

export interface RiskAssessment {
  approved: boolean;
  stopLossPrice: number;
  maxLossAmount: number;
  maxLossPercent: number;
  positionValue: number;
  riskPercent: number;
  rejectionReason?: string;
  warnings: string[];
}

export interface RiskParams {
  side: 'BUY' | 'SELL';
  symbol: string;
  size: number;
  entryPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  riskPercent?: number;       // desired risk %, capped at MAX_LOSS_PERCENT
  accountBalance: number;
  maxPositionPercent?: number; // max % of account in single position (default 25%)
}

@Injectable()
export class RiskService {
  private readonly logger = new Logger(RiskService.name);

  /**
   * Core risk check — enforces the 5% maximum loss rule per trade.
   * Returns a stop-loss price that guarantees no more than riskPercent loss.
   */
  assessRisk(params: RiskParams): RiskAssessment {
    const {
      side,
      size,
      entryPrice,
      stopLoss,
      riskPercent = 2,
      accountBalance,
      maxPositionPercent = 25,
    } = params;

    const warnings: string[] = [];

    // Cap risk percent at hard limit
    const effectiveRiskPercent = Math.min(riskPercent, MAX_LOSS_PERCENT);
    if (riskPercent > MAX_LOSS_PERCENT) {
      warnings.push(
        `Requested risk ${riskPercent}% exceeds maximum allowed ${MAX_LOSS_PERCENT}%. Capped at ${MAX_LOSS_PERCENT}%.`,
      );
    }

    const positionValue = new Decimal(size).mul(entryPrice).toNumber();
    const maxLossAmount = new Decimal(accountBalance).mul(effectiveRiskPercent).div(100).toNumber();

    // Calculate required stop-loss to not exceed max loss
    let requiredStopLoss: number;
    if (side === 'BUY') {
      // For long: stop = entry - (maxLoss / size)
      requiredStopLoss = new Decimal(entryPrice)
        .minus(new Decimal(maxLossAmount).div(size))
        .toDecimalPlaces(8)
        .toNumber();
    } else {
      // For short: stop = entry + (maxLoss / size)
      requiredStopLoss = new Decimal(entryPrice)
        .plus(new Decimal(maxLossAmount).div(size))
        .toDecimalPlaces(8)
        .toNumber();
    }

    // Validate provided stop-loss doesn't exceed max loss
    let finalStopLoss = requiredStopLoss;
    if (stopLoss !== undefined) {
      const providedLoss = side === 'BUY'
        ? (entryPrice - stopLoss) * size
        : (stopLoss - entryPrice) * size;

      if (providedLoss > maxLossAmount * 1.01) { // 1% tolerance
        warnings.push(
          `Provided stop-loss ($${stopLoss}) would cause a loss of $${providedLoss.toFixed(2)} ` +
          `(${((providedLoss / accountBalance) * 100).toFixed(2)}%), which exceeds the ${effectiveRiskPercent}% limit. ` +
          `Stop-loss tightened to $${requiredStopLoss.toFixed(8)}.`,
        );
        finalStopLoss = requiredStopLoss;
      } else {
        finalStopLoss = stopLoss;
      }
    }

    // Position size check
    const positionPercent = (positionValue / accountBalance) * 100;
    if (positionPercent > maxPositionPercent) {
      warnings.push(
        `Position value ($${positionValue.toFixed(2)}) is ${positionPercent.toFixed(1)}% of account balance. ` +
        `Consider reducing position size.`,
      );
    }

    // Insufficient balance check
    if (positionValue > accountBalance) {
      return {
        approved: false,
        stopLossPrice: finalStopLoss,
        maxLossAmount,
        maxLossPercent: effectiveRiskPercent,
        positionValue,
        riskPercent: effectiveRiskPercent,
        rejectionReason: `Position value ($${positionValue.toFixed(2)}) exceeds account balance ($${accountBalance.toFixed(2)}).`,
        warnings,
      };
    }

    // Zero size check
    if (size <= 0 || entryPrice <= 0) {
      return {
        approved: false,
        stopLossPrice: 0,
        maxLossAmount: 0,
        maxLossPercent: 0,
        positionValue: 0,
        riskPercent: effectiveRiskPercent,
        rejectionReason: 'Invalid size or price.',
        warnings,
      };
    }

    this.logger.log(
      `Risk assessment for ${params.symbol}: SL=$${finalStopLoss.toFixed(4)}, ` +
      `Max loss=$${maxLossAmount.toFixed(2)} (${effectiveRiskPercent}% of $${accountBalance.toFixed(2)})`,
    );

    return {
      approved: true,
      stopLossPrice: finalStopLoss,
      maxLossAmount,
      maxLossPercent: effectiveRiskPercent,
      positionValue,
      riskPercent: effectiveRiskPercent,
      warnings,
    };
  }

  /**
   * Calculate position size based on risk amount
   */
  calculatePositionSize(
    accountBalance: number,
    riskPercent: number,
    entryPrice: number,
    stopLossPrice: number,
  ): number {
    const effectiveRisk = Math.min(riskPercent, MAX_LOSS_PERCENT);
    const riskAmount = (accountBalance * effectiveRisk) / 100;
    const riskPerUnit = Math.abs(entryPrice - stopLossPrice);
    if (riskPerUnit === 0) return 0;
    return new Decimal(riskAmount).div(riskPerUnit).toDecimalPlaces(8).toNumber();
  }

  /**
   * Check if a trailing stop update would exceed max loss from entry
   */
  validateTrailingStop(
    side: 'BUY' | 'SELL',
    entryPrice: number,
    currentStopLoss: number,
    proposedStopLoss: number,
    size: number,
    accountBalance: number,
  ): { valid: boolean; adjustedStop: number; loss: number } {
    const effectiveStop = side === 'BUY'
      ? Math.max(currentStopLoss, proposedStopLoss) // can only move up for longs
      : Math.min(currentStopLoss, proposedStopLoss); // can only move down for shorts

    const loss = side === 'BUY'
      ? (entryPrice - effectiveStop) * size
      : (effectiveStop - entryPrice) * size;

    const maxLoss = (accountBalance * MAX_LOSS_PERCENT) / 100;
    const valid = loss <= maxLoss;

    return { valid, adjustedStop: effectiveStop, loss };
  }
}
