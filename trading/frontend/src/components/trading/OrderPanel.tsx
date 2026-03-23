'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { placeOrder, riskCheck } from '@/lib/api';
import { useTradingStore } from '@/store/tradingStore';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import { ShieldAlert, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

const MAX_RISK = 5;

interface FormData {
  size: number;
  limitPrice: number;
  stopLoss: number;
  takeProfit: number;
  riskPercent: number;
  orderType: 'MARKET' | 'LIMIT';
  notes: string;
}

export default function OrderPanel() {
  const { selectedSymbol, tickers, portfolio } = useTradingStore();
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [riskAssessment, setRiskAssessment] = useState<any>(null);
  const queryClient = useQueryClient();

  const ticker = tickers[selectedSymbol];
  const currentPrice = ticker?.price || 0;

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      orderType: 'MARKET',
      riskPercent: 2,
      size: 0,
    },
  });

  const orderType = watch('orderType');
  const size = watch('size');
  const riskPercent = watch('riskPercent');

  const placeMutation = useMutation({
    mutationFn: (data: any) => placeOrder(data),
    onSuccess: (result) => {
      toast.success(`${side} order placed successfully`);
      reset();
      setRiskAssessment(null);
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['trades'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Order failed');
    },
  });

  const riskCheckMutation = useMutation({
    mutationFn: (data: any) => riskCheck(data),
    onSuccess: (result) => setRiskAssessment(result),
  });

  const onSubmit = (data: FormData) => {
    placeMutation.mutate({
      symbol: selectedSymbol,
      side,
      orderType: data.orderType,
      size: parseFloat(data.size as any),
      limitPrice: data.orderType === 'LIMIT' ? parseFloat(data.limitPrice as any) : undefined,
      stopLoss: data.stopLoss ? parseFloat(data.stopLoss as any) : undefined,
      takeProfit: data.takeProfit ? parseFloat(data.takeProfit as any) : undefined,
      riskPercent: parseFloat(data.riskPercent as any),
      notes: data.notes,
    });
  };

  const onRiskCheck = () => {
    riskCheckMutation.mutate({
      symbol: selectedSymbol,
      side,
      orderType: watch('orderType'),
      size: parseFloat(watch('size') as any || '0'),
      limitPrice: watch('orderType') === 'LIMIT' ? parseFloat(watch('limitPrice') as any) : undefined,
      stopLoss: watch('stopLoss') ? parseFloat(watch('stopLoss') as any) : undefined,
      riskPercent: parseFloat(watch('riskPercent') as any),
    });
  };

  const positionValue = (parseFloat(size as any) || 0) * currentPrice;

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-white">Place Order</h3>
        <span className="text-xs text-slate-500 font-mono">{selectedSymbol}</span>
      </div>

      {/* Buy / Sell toggle */}
      <div className="flex rounded-lg overflow-hidden border border-border">
        <button
          onClick={() => setSide('BUY')}
          className={clsx(
            'flex-1 py-2.5 text-sm font-bold transition-colors',
            side === 'BUY' ? 'bg-green-500 text-white' : 'bg-surface-2 text-slate-400 hover:text-green-400',
          )}
        >
          BUY
        </button>
        <button
          onClick={() => setSide('SELL')}
          className={clsx(
            'flex-1 py-2.5 text-sm font-bold transition-colors',
            side === 'SELL' ? 'bg-red-500 text-white' : 'bg-surface-2 text-slate-400 hover:text-red-400',
          )}
        >
          SELL
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Order type */}
        <div className="flex gap-2">
          {(['MARKET', 'LIMIT'] as const).map((t) => (
            <label key={t} className="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" value={t} {...register('orderType')} className="accent-blue-500" />
              <span className="text-xs text-slate-400">{t}</span>
            </label>
          ))}
        </div>

        {/* Size */}
        <div>
          <label className="text-xs text-slate-500 block mb-1">Size (base currency)</label>
          <input
            {...register('size', { required: true, min: 0.000001 })}
            type="number"
            step="any"
            placeholder="0.001"
            className="input"
          />
          {positionValue > 0 && (
            <p className="text-xs text-slate-500 mt-1">≈ ${positionValue.toFixed(2)} at ${currentPrice.toLocaleString()}</p>
          )}
        </div>

        {/* Limit price */}
        {orderType === 'LIMIT' && (
          <div>
            <label className="text-xs text-slate-500 block mb-1">Limit Price</label>
            <input
              {...register('limitPrice', { required: orderType === 'LIMIT' })}
              type="number"
              step="any"
              placeholder={currentPrice.toString()}
              className="input"
            />
          </div>
        )}

        {/* Stop Loss */}
        <div>
          <label className="text-xs text-slate-500 block mb-1">
            Stop Loss <span className="text-red-400">(max {MAX_RISK}% loss enforced)</span>
          </label>
          <input
            {...register('stopLoss')}
            type="number"
            step="any"
            placeholder="Auto-calculated from risk %"
            className="input"
          />
        </div>

        {/* Take Profit */}
        <div>
          <label className="text-xs text-slate-500 block mb-1">Take Profit</label>
          <input
            {...register('takeProfit')}
            type="number"
            step="any"
            placeholder="Optional"
            className="input"
          />
        </div>

        {/* Risk % */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-slate-500">Risk per trade</label>
            <span className={clsx('text-xs font-bold', parseFloat(riskPercent as any) > 3 ? 'text-yellow-400' : 'text-blue-400')}>
              {riskPercent}%
            </span>
          </div>
          <input
            {...register('riskPercent')}
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-slate-600 mt-0.5">
            <span>0.1%</span>
            <span className="text-red-400">MAX 5%</span>
          </div>
        </div>

        {/* Risk assessment result */}
        {riskAssessment && (
          <div className={clsx(
            'rounded-lg p-3 text-xs space-y-1 border',
            riskAssessment.approved ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30',
          )}>
            {riskAssessment.approved ? (
              <>
                <div className="flex items-center gap-1.5 text-green-400 font-bold mb-1">
                  <CheckCircle size={12} /> Risk Check Passed
                </div>
                <div className="grid grid-cols-2 gap-1 text-slate-400">
                  <span>Stop Loss:</span><span className="text-white font-mono">${riskAssessment.stopLossPrice?.toFixed(4)}</span>
                  <span>Max Loss:</span><span className="text-red-400 font-mono">${riskAssessment.maxLossAmount?.toFixed(2)}</span>
                  <span>Position:</span><span className="text-white font-mono">${riskAssessment.positionValue?.toFixed(2)}</span>
                </div>
                {riskAssessment.warnings?.length > 0 && (
                  <div className="mt-1 text-yellow-400 flex items-start gap-1">
                    <AlertTriangle size={10} className="mt-0.5 flex-shrink-0" />
                    <span>{riskAssessment.warnings[0]}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-red-400 flex items-start gap-1.5">
                <ShieldAlert size={12} className="mt-0.5" />
                <span>{riskAssessment.rejectionReason}</span>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="text-xs text-slate-500 block mb-1">Notes (optional)</label>
          <input {...register('notes')} type="text" placeholder="Trade rationale..." className="input" />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onRiskCheck}
            disabled={riskCheckMutation.isPending}
            className="btn-secondary flex-1 text-xs"
          >
            {riskCheckMutation.isPending ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'Risk Check'}
          </button>
          <button
            type="submit"
            disabled={placeMutation.isPending}
            className={clsx('flex-1 py-2 rounded-lg font-bold text-sm text-white transition-colors disabled:opacity-50', side === 'BUY' ? 'btn-buy' : 'btn-sell')}
          >
            {placeMutation.isPending
              ? <Loader2 size={14} className="animate-spin mx-auto" />
              : `${side} ${selectedSymbol.split('-')[0]}`}
          </button>
        </div>
      </form>

      {/* Current price reference */}
      <div className="text-center text-xs text-slate-600 font-mono border-t border-border pt-3">
        Last: ${currentPrice >= 1000 ? currentPrice.toLocaleString() : currentPrice.toFixed(4)} · Bid: ${ticker?.bid?.toFixed(2) || '—'} · Ask: ${ticker?.ask?.toFixed(2) || '—'}
      </div>
    </div>
  );
}
