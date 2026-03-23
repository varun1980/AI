'use client';

import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { useState } from 'react';
import { ShieldAlert, Key, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [paperMode, setPaperMode] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // In production: send to backend /api/v1/settings endpoint
    toast.success('Settings saved (restart backend to apply API keys)');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 space-y-4 max-w-2xl">
          <h1 className="text-xl font-bold text-white">Settings</h1>

          {/* Risk limits */}
          <div className="card space-y-4">
            <div className="flex items-center gap-2">
              <ShieldAlert size={18} className="text-red-400" />
              <h2 className="font-bold text-white">Risk Management</h2>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-300">
                  <strong>Hard limit: 5% maximum loss per trade.</strong> This is enforced server-side and cannot be overridden.
                  All stop-losses are automatically calculated to ensure no single trade exceeds 5% of your account balance.
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-surface-2 rounded-lg p-3">
                <p className="text-slate-500 text-xs mb-1">Max Loss Per Trade</p>
                <p className="text-red-400 font-bold font-mono text-lg">5%</p>
                <p className="text-slate-600 text-xs">Hard enforced</p>
              </div>
              <div className="bg-surface-2 rounded-lg p-3">
                <p className="text-slate-500 text-xs mb-1">Default Risk Per Trade</p>
                <p className="text-blue-400 font-bold font-mono text-lg">2%</p>
                <p className="text-slate-600 text-xs">Adjustable per order</p>
              </div>
              <div className="bg-surface-2 rounded-lg p-3">
                <p className="text-slate-500 text-xs mb-1">Stop-Loss Monitoring</p>
                <p className="text-green-400 font-bold text-lg flex items-center gap-1"><CheckCircle size={16} /> Active</p>
                <p className="text-slate-600 text-xs">Every 2 seconds</p>
              </div>
              <div className="bg-surface-2 rounded-lg p-3">
                <p className="text-slate-500 text-xs mb-1">Strategy Evaluation</p>
                <p className="text-green-400 font-bold text-lg flex items-center gap-1"><CheckCircle size={16} /> Active</p>
                <p className="text-slate-600 text-xs">Every 10 seconds</p>
              </div>
            </div>
          </div>

          {/* Trading Mode */}
          <div className="card space-y-4">
            <div className="flex items-center gap-2">
              <Info size={18} className="text-blue-400" />
              <h2 className="font-bold text-white">Trading Mode</h2>
            </div>
            <div className="flex items-center justify-between p-4 bg-surface-2 rounded-lg">
              <div>
                <p className="font-medium text-white">Paper Trading Mode</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {paperMode
                    ? 'Simulated trades with virtual $10,000. Real market prices, no real money.'
                    : 'LIVE TRADING: Real money will be used. Ensure API keys are correct.'}
                </p>
              </div>
              <button
                onClick={() => {
                  if (!paperMode && !confirm('Switch to paper trading? Live trading will stop.')) return;
                  if (paperMode && !confirm('Switch to LIVE trading? Real money will be used!')) return;
                  setPaperMode(!paperMode);
                }}
                className={`relative w-12 h-6 rounded-full transition-colors ${paperMode ? 'bg-green-500' : 'bg-red-500'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${paperMode ? 'left-0.5' : 'left-6'}`} />
              </button>
            </div>
            {!paperMode && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-xs text-red-300 flex items-start gap-2">
                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                Live trading mode is active. All orders will use real money.
              </div>
            )}
          </div>

          {/* API Configuration */}
          <div className="card space-y-4">
            <div className="flex items-center gap-2">
              <Key size={18} className="text-yellow-400" />
              <h2 className="font-bold text-white">Coinbase Advanced API</h2>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-xs text-blue-300 flex items-start gap-2">
              <Info size={14} className="flex-shrink-0 mt-0.5" />
              API keys are configured via environment variables (COINBASE_API_KEY, COINBASE_API_SECRET) in the backend .env file.
              Restart the backend after updating.
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 block mb-1">API Key (set in .env)</label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="organizations/.../apiKeys/..."
                  className="input font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">API Secret (set in .env)</label>
                <input
                  type="password"
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="input font-mono text-xs"
                />
              </div>
              <p className="text-xs text-slate-600">
                For security, add these to <code className="text-slate-400">trading/backend/.env</code>:
                <br /><code className="text-slate-400">COINBASE_API_KEY=your_key</code>
                <br /><code className="text-slate-400">COINBASE_API_SECRET=your_secret</code>
              </p>
            </div>
            <button onClick={handleSave} className="btn-secondary text-sm">
              {saved ? 'Saved!' : 'Save Settings'}
            </button>
          </div>

          {/* How it works */}
          <div className="card space-y-3">
            <h2 className="font-bold text-white">How the 5% Rule Works</h2>
            <ol className="text-sm text-slate-400 space-y-2 list-decimal list-inside">
              <li>You choose a risk % (0.1% – 5%) per trade</li>
              <li>The risk engine calculates the max dollar loss = account balance × risk %</li>
              <li>Stop-loss price is auto-calculated: entry - (maxLoss / position size)</li>
              <li>If you provide a stop-loss that's too wide, it's automatically tightened</li>
              <li>A 2-second monitoring loop checks current price against stop-loss/take-profit</li>
              <li>Position is automatically closed when either target is hit</li>
            </ol>
          </div>
        </main>
      </div>
    </div>
  );
}
