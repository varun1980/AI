'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAlerts, createAlert, deleteAlert } from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import { Plus, Bell, BellOff, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { useTradingStore } from '@/store/tradingStore';

const SYMBOLS = ['BTC-USD', 'ETH-USD', 'SOL-USD', 'XRP-USD', 'DOGE-USD', 'ADA-USD', 'AVAX-USD', 'LINK-USD'];

export default function AlertsPage() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();
  const { recentAlerts } = useTradingStore();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: getAlerts,
    refetchInterval: 10000,
  });

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { symbol: 'BTC-USD', condition: 'ABOVE', targetPrice: '', message: '' },
  });

  const createMutation = useMutation({
    mutationFn: createAlert,
    onSuccess: () => { toast.success('Alert set'); queryClient.invalidateQueries({ queryKey: ['alerts'] }); reset(); setShowForm(false); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAlert,
    onSuccess: () => { toast.success('Alert deleted'); queryClient.invalidateQueries({ queryKey: ['alerts'] }); },
  });

  const onSubmit = (data: any) => {
    createMutation.mutate({
      symbol: data.symbol,
      condition: data.condition,
      targetPrice: parseFloat(data.targetPrice),
      message: data.message || undefined,
    });
  };

  const activeAlerts = alerts.filter((a: any) => !a.isTriggered);
  const triggeredAlerts = alerts.filter((a: any) => a.isTriggered);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">Price Alerts</h1>
            <button onClick={() => setShowForm(!showForm)} className="btn-secondary flex items-center gap-2 text-sm">
              <Plus size={16} /> New Alert
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
              <h2 className="font-bold text-white">Create Price Alert</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Symbol</label>
                  <select {...register('symbol')} className="input">
                    {SYMBOLS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Condition</label>
                  <select {...register('condition')} className="input">
                    <option value="ABOVE">Price Above</option>
                    <option value="BELOW">Price Below</option>
                    <option value="CROSSES_UP">Crosses Up</option>
                    <option value="CROSSES_DOWN">Crosses Down</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Target Price ($)</label>
                  <input {...register('targetPrice', { required: true })} type="number" step="any" placeholder="50000" className="input" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Note (optional)</label>
                  <input {...register('message')} placeholder="Alert description" className="input" />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={createMutation.isPending} className="btn-buy text-sm">
                  {createMutation.isPending ? 'Setting...' : 'Set Alert'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); reset(); }} className="btn-secondary text-sm">Cancel</button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Active alerts */}
            <div className="card">
              <h2 className="font-bold text-white mb-3 flex items-center gap-2">
                <Bell size={16} className="text-blue-400" /> Active Alerts ({activeAlerts.length})
              </h2>
              {activeAlerts.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8">No active alerts</p>
              ) : (
                <div className="space-y-2">
                  {activeAlerts.map((alert: any) => (
                    <div key={alert.id} className="flex items-center justify-between bg-surface-2 rounded-lg px-3 py-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{alert.symbol}</span>
                          <span className="badge-blue">{alert.condition.replace(/_/g, ' ')}</span>
                        </div>
                        <p className="text-xs font-mono text-slate-300 mt-0.5">${parseFloat(alert.targetPrice).toLocaleString()}</p>
                        {alert.message && <p className="text-xs text-slate-500 mt-0.5">{alert.message}</p>}
                      </div>
                      <button onClick={() => deleteMutation.mutate(alert.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Triggered alerts */}
            <div className="card">
              <h2 className="font-bold text-white mb-3 flex items-center gap-2">
                <BellOff size={16} className="text-slate-400" /> Triggered ({triggeredAlerts.length})
              </h2>
              {triggeredAlerts.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8">No triggered alerts</p>
              ) : (
                <div className="space-y-2">
                  {triggeredAlerts.slice(0, 10).map((alert: any) => (
                    <div key={alert.id} className="flex items-center justify-between bg-surface-2 rounded-lg px-3 py-2.5 opacity-60">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{alert.symbol}</span>
                          <span className="badge-gray">{alert.condition.replace(/_/g, ' ')}</span>
                        </div>
                        <p className="text-xs font-mono text-slate-400">${parseFloat(alert.targetPrice).toLocaleString()} → triggered @ ${parseFloat(alert.triggeredPrice || 0).toLocaleString()}</p>
                        {alert.triggeredAt && (
                          <p className="text-xs text-slate-600">{format(new Date(alert.triggeredAt), 'MM/dd HH:mm')}</p>
                        )}
                      </div>
                      <button onClick={() => deleteMutation.mutate(alert.id)} className="text-slate-600 hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
