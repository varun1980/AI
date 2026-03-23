'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getScheduledOrders, createScheduledOrder, activateScheduledOrder, deactivateScheduledOrder, deleteScheduledOrder } from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import { Plus, Play, Pause, Trash2, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

const SYMBOLS = ['BTC-USD', 'ETH-USD', 'SOL-USD', 'XRP-USD', 'DOGE-USD', 'ADA-USD', 'AVAX-USD'];
const CRON_PRESETS = [
  { label: 'Every minute', value: '* * * * *' },
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Daily 9am UTC', value: '0 9 * * *' },
  { label: 'Daily 9am Mon-Fri', value: '0 9 * * 1-5' },
  { label: 'Weekly Monday 9am', value: '0 9 * * 1' },
  { label: 'Bi-weekly', value: '0 9 1,15 * *' },
];

export default function SchedulerPage() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['scheduled-orders'],
    queryFn: getScheduledOrders,
    refetchInterval: 30000,
  });

  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      name: '',
      symbol: 'BTC-USD',
      side: 'BUY',
      orderType: 'MARKET',
      size: '',
      limitPrice: '',
      stopLoss: '',
      takeProfit: '',
      cronExpr: '0 9 * * 1-5',
      riskPercent: 2,
      maxRuns: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: createScheduledOrder,
    onSuccess: () => { toast.success('Scheduled order created'); queryClient.invalidateQueries({ queryKey: ['scheduled-orders'] }); reset(); setShowForm(false); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const activateMutation = useMutation({
    mutationFn: activateScheduledOrder,
    onSuccess: () => { toast.success('Activated'); queryClient.invalidateQueries({ queryKey: ['scheduled-orders'] }); },
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateScheduledOrder,
    onSuccess: () => { toast.success('Deactivated'); queryClient.invalidateQueries({ queryKey: ['scheduled-orders'] }); },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteScheduledOrder,
    onSuccess: () => { toast.success('Deleted'); queryClient.invalidateQueries({ queryKey: ['scheduled-orders'] }); },
  });

  const onSubmit = (data: any) => {
    createMutation.mutate({
      name: data.name,
      symbol: data.symbol,
      side: data.side,
      orderType: data.orderType,
      size: parseFloat(data.size),
      limitPrice: data.limitPrice ? parseFloat(data.limitPrice) : undefined,
      stopLoss: data.stopLoss ? parseFloat(data.stopLoss) : undefined,
      takeProfit: data.takeProfit ? parseFloat(data.takeProfit) : undefined,
      cronExpr: data.cronExpr,
      riskPercent: parseFloat(data.riskPercent),
      maxRuns: data.maxRuns ? parseInt(data.maxRuns) : undefined,
    });
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">Scheduled Orders</h1>
            <button onClick={() => setShowForm(!showForm)} className="btn-secondary flex items-center gap-2 text-sm">
              <Plus size={16} /> New Schedule
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
              <h2 className="font-bold text-white">Create Scheduled Order</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Name</label>
                  <input {...register('name', { required: true })} placeholder="Daily BTC Buy" className="input" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Symbol</label>
                  <select {...register('symbol')} className="input">
                    {SYMBOLS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Side</label>
                  <select {...register('side')} className="input">
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
                  <label className="text-xs text-slate-500 block mb-1">Size</label>
                  <input {...register('size', { required: true })} type="number" step="any" placeholder="0.001" className="input" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Risk % (max 5%)</label>
                  <input {...register('riskPercent')} type="number" step="0.1" min="0.1" max="5" className="input" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-500 block mb-1">Cron Expression</label>
                  <div className="flex gap-2">
                    <input {...register('cronExpr', { required: true })} placeholder="0 9 * * 1-5" className="input flex-1 font-mono" />
                    <select onChange={(e) => setValue('cronExpr', e.target.value)} className="input w-auto">
                      <option value="">Presets</option>
                      {CRON_PRESETS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">Format: minute hour day month weekday (UTC)</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Max Runs (optional)</label>
                  <input {...register('maxRuns')} type="number" min="1" placeholder="Unlimited" className="input" />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={createMutation.isPending} className="btn-buy">
                  {createMutation.isPending ? 'Scheduling...' : 'Schedule Order'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); reset(); }} className="btn-secondary">Cancel</button>
              </div>
            </form>
          )}

          {/* Scheduled orders list */}
          <div className="space-y-3">
            {isLoading ? (
              [...Array(3)].map((_, i) => <div key={i} className="card h-20 animate-pulse" />)
            ) : orders.length === 0 ? (
              <div className="card text-center py-12 text-slate-500">
                <Calendar size={40} className="mx-auto mb-3 opacity-30" />
                <p>No scheduled orders. Create one to automate your trading.</p>
              </div>
            ) : (
              orders.map((order: any) => (
                <div key={order.id} className="card flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Clock size={18} className="text-blue-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-sm">{order.name}</h3>
                        <span className={order.isActive ? 'badge-green' : 'badge-gray'}>
                          {order.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className={order.side === 'BUY' ? 'badge-green' : 'badge-red'}>{order.side}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-mono">
                        <span>{order.symbol}</span>
                        <span>·</span>
                        <span>{parseFloat(order.size)} units</span>
                        <span>·</span>
                        <span className="text-blue-400">{order.cronExpr}</span>
                        <span>·</span>
                        <span>{order.runCount} runs{order.maxRuns ? ` / ${order.maxRuns}` : ''}</span>
                      </div>
                      {order.lastRunAt && (
                        <p className="text-xs text-slate-600 mt-0.5">
                          Last: {format(new Date(order.lastRunAt), 'MM/dd HH:mm')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!order.isActive ? (
                      <button onClick={() => activateMutation.mutate(order.id)} className="btn-secondary py-1 px-2 text-xs flex items-center gap-1">
                        <Play size={12} /> Activate
                      </button>
                    ) : (
                      <button onClick={() => deactivateMutation.mutate(order.id)} className="btn-secondary py-1 px-2 text-xs flex items-center gap-1">
                        <Pause size={12} /> Pause
                      </button>
                    )}
                    <button
                      onClick={() => { if (confirm('Delete scheduled order?')) deleteMutation.mutate(order.id); }}
                      className="btn-secondary py-1 px-2 text-xs text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
