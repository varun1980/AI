'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStrategies, createStrategy, activateStrategy, pauseStrategy, deleteStrategy } from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { useForm } from 'react-hook-form';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import { Plus, Play, Pause, Trash2, Zap, ChevronDown, ChevronUp } from 'lucide-react';

const CONDITION_TYPES = [
  { value: 'PRICE_ABOVE', label: 'Price Above' },
  { value: 'PRICE_BELOW', label: 'Price Below' },
  { value: 'PRICE_CROSSES_UP', label: 'Price Crosses Up' },
  { value: 'PRICE_CROSSES_DOWN', label: 'Price Crosses Down' },
  { value: 'RSI_ABOVE', label: 'RSI Above' },
  { value: 'RSI_BELOW', label: 'RSI Below' },
  { value: 'MA_CROSSOVER_UP', label: 'MA Crossover Up' },
  { value: 'MA_CROSSOVER_DOWN', label: 'MA Crossover Down' },
  { value: 'PERCENT_CHANGE_UP', label: '% Change Up' },
  { value: 'PERCENT_CHANGE_DOWN', label: '% Change Down' },
];

const SYMBOLS = ['BTC-USD', 'ETH-USD', 'SOL-USD', 'XRP-USD', 'DOGE-USD', 'ADA-USD', 'AVAX-USD'];

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'badge-green',
  PAUSED: 'badge-yellow',
  ARCHIVED: 'badge-gray',
};

function StrategyCard({ strategy, onActivate, onPause, onDelete }: any) {
  const [expanded, setExpanded] = useState(false);
  const conditions = strategy.conditions as any[];
  const action = strategy.action as any;

  return (
    <div className="card space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <Zap size={18} className="text-purple-400" />
          </div>
          <div>
            <h3 className="font-bold text-white">{strategy.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-500">{strategy.symbol}</span>
              <span className={STATUS_COLOR[strategy.status]}>{strategy.status}</span>
              <span className="badge-gray">{strategy._count?.trades || 0} trades</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {strategy.status !== 'ACTIVE' ? (
            <button onClick={() => onActivate(strategy.id)} className="btn-secondary py-1 px-2 text-xs flex items-center gap-1">
              <Play size={12} /> Activate
            </button>
          ) : (
            <button onClick={() => onPause(strategy.id)} className="btn-secondary py-1 px-2 text-xs flex items-center gap-1">
              <Pause size={12} /> Pause
            </button>
          )}
          <button onClick={() => onDelete(strategy.id)} className="btn-secondary py-1 px-2 text-xs text-red-400 hover:text-red-300">
            <Trash2 size={12} />
          </button>
          <button onClick={() => setExpanded(!expanded)} className="btn-secondary py-1 px-2 text-xs">
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border pt-3 space-y-2">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <p className="text-slate-500">Risk/Trade</p>
              <p className="text-white font-mono">{strategy.riskPercent}%</p>
            </div>
            <div>
              <p className="text-slate-500">Cooldown</p>
              <p className="text-white font-mono">{strategy.cooldownMinutes}m</p>
            </div>
            <div>
              <p className="text-slate-500">Triggered</p>
              <p className="text-white font-mono">{strategy.triggerCount}x</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Conditions ({action?.logicOperator || 'AND'})</p>
            {conditions.map((c: any, i: number) => (
              <div key={i} className="text-xs text-slate-300 font-mono bg-surface-2 rounded px-2 py-1 mb-1">
                {c.type.replace(/_/g, ' ')} {c.value}
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Action</p>
            <div className="text-xs text-slate-300 font-mono bg-surface-2 rounded px-2 py-1">
              {action?.side} {action?.size} ({action?.orderType})
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StrategiesPage() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: strategies = [], isLoading } = useQuery({
    queryKey: ['strategies'],
    queryFn: getStrategies,
  });

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: '',
      symbol: 'BTC-USD',
      conditionType: 'PRICE_ABOVE',
      conditionValue: '',
      actionSide: 'BUY',
      actionSize: '',
      orderType: 'MARKET',
      riskPercent: 2,
      cooldownMinutes: 5,
      logicOperator: 'AND',
    },
  });

  const createMutation = useMutation({
    mutationFn: createStrategy,
    onSuccess: () => {
      toast.success('Strategy created');
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
      reset();
      setShowForm(false);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to create strategy'),
  });

  const activateMutation = useMutation({
    mutationFn: activateStrategy,
    onSuccess: () => { toast.success('Strategy activated'); queryClient.invalidateQueries({ queryKey: ['strategies'] }); },
  });

  const pauseMutation = useMutation({
    mutationFn: pauseStrategy,
    onSuccess: () => { toast.success('Strategy paused'); queryClient.invalidateQueries({ queryKey: ['strategies'] }); },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStrategy,
    onSuccess: () => { toast.success('Strategy deleted'); queryClient.invalidateQueries({ queryKey: ['strategies'] }); },
  });

  const onSubmit = (data: any) => {
    createMutation.mutate({
      name: data.name,
      symbol: data.symbol,
      conditions: [{ type: data.conditionType, value: parseFloat(data.conditionValue) }],
      logicOperator: data.logicOperator,
      action: {
        side: data.actionSide,
        orderType: data.orderType,
        size: parseFloat(data.actionSize),
      },
      riskPercent: parseFloat(data.riskPercent),
      cooldownMinutes: parseInt(data.cooldownMinutes),
    });
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">Auto-Trading Strategies</h1>
            <button onClick={() => setShowForm(!showForm)} className="btn-secondary flex items-center gap-2 text-sm">
              <Plus size={16} /> New Strategy
            </button>
          </div>

          {/* Create form */}
          {showForm && (
            <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
              <h2 className="font-bold text-white">Create Strategy</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Strategy Name</label>
                  <input {...register('name', { required: true })} placeholder="My BTC Strategy" className="input" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Symbol</label>
                  <select {...register('symbol')} className="input">
                    {SYMBOLS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Condition Type</label>
                  <select {...register('conditionType')} className="input">
                    {CONDITION_TYPES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Condition Value</label>
                  <input {...register('conditionValue', { required: true })} type="number" step="any" placeholder="e.g. 50000 for price, 30 for RSI" className="input" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Action Side</label>
                  <select {...register('actionSide')} className="input">
                    <option value="BUY">BUY</option>
                    <option value="SELL">SELL</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Order Type</label>
                  <select {...register('orderType')} className="input">
                    <option value="MARKET">MARKET</option>
                    <option value="LIMIT">LIMIT</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Size (base currency)</label>
                  <input {...register('actionSize', { required: true })} type="number" step="any" placeholder="0.001" className="input" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Risk % (max 5%)</label>
                  <input {...register('riskPercent')} type="number" step="0.1" min="0.1" max="5" className="input" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Cooldown (minutes)</label>
                  <input {...register('cooldownMinutes')} type="number" min="0" className="input" />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={createMutation.isPending} className="btn-buy">
                  {createMutation.isPending ? 'Creating...' : 'Create Strategy'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); reset(); }} className="btn-secondary">Cancel</button>
              </div>
            </form>
          )}

          {/* Strategy list */}
          <div className="space-y-3">
            {isLoading ? (
              [...Array(3)].map((_, i) => <div key={i} className="card h-24 animate-pulse" />)
            ) : strategies.length === 0 ? (
              <div className="card text-center py-12 text-slate-500">
                <Zap size={40} className="mx-auto mb-3 opacity-30" />
                <p>No strategies yet. Create one to start auto-trading.</p>
              </div>
            ) : (
              strategies.map((s: any) => (
                <StrategyCard
                  key={s.id}
                  strategy={s}
                  onActivate={(id: string) => activateMutation.mutate(id)}
                  onPause={(id: string) => pauseMutation.mutate(id)}
                  onDelete={(id: string) => { if (confirm('Delete strategy?')) deleteMutation.mutate(id); }}
                />
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
