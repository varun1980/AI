'use client';

import { useState, useEffect } from 'react';

interface DashboardStats {
  revenue: {
    today: number;
    thisMonth: number;
    lastMonth: number;
    thisYear: number;
    allTime: number;
    monthGrowth: string;
    bySource: { source: string; amount: number }[];
  };
  leads: {
    total: number;
    funnel: { new: number; nurturing: number; qualified: number; converted: number };
    conversionRate: string;
  };
  topProducts: { name: string; purchaseCount: number; totalRevenue: number; type: string }[];
  topAffiliates: { name: string; clickCount: number; conversionCount: number; totalEarnings: number }[];
  recentActivity: { source: string; amount: number; createdAt: string }[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const formatGBP = (amount: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);

const sourceLabel: Record<string, string> = {
  BOOKINGS: 'Coaching Bookings',
  DIGITAL_PRODUCTS: 'Digital Products',
  AFFILIATE: 'Affiliate Commissions',
};

const sourceColor: Record<string, string> = {
  BOOKINGS: '#b8832b',
  DIGITAL_PRODUCTS: '#10b981',
  AFFILIATE: '#6366f1',
};

export default function PassiveIncomeDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [passiveBreakdown, setPassiveBreakdown] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'leads' | 'products' | 'affiliates' | 'content'>('overview');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    Promise.all([
      fetch(`${API_BASE}/api/v1/passive-income/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()),
      fetch(`${API_BASE}/api/v1/passive-income/admin/passive-breakdown`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()),
    ])
      .then(([dashData, breakdownData]) => {
        setStats(dashData);
        setPassiveBreakdown(breakdownData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-[#b8832b] text-xl animate-pulse">Loading revenue data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="bg-[#111] border-b border-[#222] px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#b8832b]">Passive Income Engine</h1>
            <p className="text-gray-400 text-sm mt-1">Running 24/7 — generating revenue automatically</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-400/10 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              All Systems Active
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Revenue Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Today's Revenue", value: stats?.revenue.today || 0, highlight: true },
            { label: 'This Month', value: stats?.revenue.thisMonth || 0, growth: stats?.revenue.monthGrowth },
            { label: 'Last Month', value: stats?.revenue.lastMonth || 0 },
            { label: 'This Year', value: stats?.revenue.thisYear || 0 },
            { label: 'All Time', value: stats?.revenue.allTime || 0 },
          ].map((card, i) => (
            <div
              key={i}
              className={`rounded-xl p-5 border ${
                card.highlight
                  ? 'bg-[#b8832b]/10 border-[#b8832b]/40'
                  : 'bg-[#111] border-[#222]'
              }`}
            >
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">{card.label}</p>
              <p className={`text-2xl font-bold ${card.highlight ? 'text-[#b8832b]' : 'text-white'}`}>
                {formatGBP(card.value)}
              </p>
              {card.growth && (
                <p className={`text-xs mt-1 ${card.growth.startsWith('-') ? 'text-red-400' : 'text-emerald-400'}`}>
                  {card.growth.startsWith('-') ? '↓' : '↑'} {card.growth} vs last month
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Revenue by Source */}
        {stats?.revenue.bySource && stats.revenue.bySource.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {stats.revenue.bySource.map((src) => (
              <div key={src.source} className="bg-[#111] border border-[#222] rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: sourceColor[src.source] || '#666' }}
                  />
                  <span className="text-sm text-gray-400">{sourceLabel[src.source] || src.source}</span>
                </div>
                <p className="text-xl font-bold">{formatGBP(src.amount)}</p>
                <p className="text-xs text-gray-500 mt-1">This month</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-[#222]">
          {(['overview', 'leads', 'products', 'affiliates', 'content'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-[#b8832b] text-[#b8832b]'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lead Funnel */}
            <div className="bg-[#111] border border-[#222] rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Email Funnel Performance</h3>
              <div className="space-y-3">
                {stats && [
                  { label: 'New Leads', value: stats.leads.funnel.new, color: 'bg-blue-500' },
                  { label: 'In Nurture Sequence', value: stats.leads.funnel.nurturing, color: 'bg-yellow-500' },
                  { label: 'Qualified (Ready to Buy)', value: stats.leads.funnel.qualified, color: 'bg-orange-500' },
                  { label: 'Converted to Clients', value: stats.leads.funnel.converted, color: 'bg-emerald-500' },
                ].map((step) => {
                  const pct = stats.leads.total > 0 ? (step.value / stats.leads.total) * 100 : 0;
                  return (
                    <div key={step.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">{step.label}</span>
                        <span className="font-medium">{step.value}</span>
                      </div>
                      <div className="bg-[#222] rounded-full h-2">
                        <div
                          className={`${step.color} h-2 rounded-full transition-all`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-[#222] flex justify-between text-sm">
                <span className="text-gray-400">Total leads: {stats?.leads.total}</span>
                <span className="text-emerald-400">Conversion rate: {stats?.leads.conversionRate}</span>
              </div>
            </div>

            {/* Passive Income Breakdown */}
            {passiveBreakdown && (
              <div className="bg-[#111] border border-[#222] rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Passive Income Streams</h3>
                <div className="space-y-4">
                  {passiveBreakdown.streams?.map((stream: any) => (
                    <div key={stream.name} className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{stream.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{stream.description}</p>
                        {stream.completedSequences !== undefined && (
                          <p className="text-xs text-emerald-400 mt-0.5">
                            {stream.completedSequences} sequences completed • {stream.totalLeads} leads
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#b8832b]">{formatGBP(stream.revenue)}</p>
                        <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                          Auto
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-[#222]">
                  <div className="flex justify-between font-bold">
                    <span>Total Passive Revenue</span>
                    <span className="text-[#b8832b]">
                      {formatGBP(passiveBreakdown.totalPassiveRevenue || 0)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-[#111] border border-[#222] rounded-xl p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Recent Revenue Activity</h3>
              {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                <div className="space-y-2">
                  {stats.recentActivity.map((activity, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-[#1a1a1a] last:border-0">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ background: sourceColor[activity.source] || '#666' }}
                        />
                        <span className="text-sm text-gray-300">
                          {sourceLabel[activity.source] || activity.source}
                        </span>
                      </div>
                      <span className="font-medium text-emerald-400">+{formatGBP(activity.amount)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No revenue recorded yet. Run the setup to initialise the system.</p>
              )}
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Digital Products Performance</h3>
              <a href="/shop" className="text-sm text-[#b8832b] hover:underline">View Shop →</a>
            </div>
            {stats?.topProducts && stats.topProducts.length > 0 ? (
              <div className="space-y-3">
                {stats.topProducts.map((product, i) => (
                  <div key={i} className="bg-[#111] border border-[#222] rounded-xl p-5 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-gray-500 mt-1 capitalize">{product.type.replace('_', ' ')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#b8832b]">{formatGBP(product.totalRevenue)}</p>
                      <p className="text-xs text-gray-400">{product.purchaseCount} sales</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#111] border border-[#222] rounded-xl p-8 text-center">
                <p className="text-gray-400">No products yet. Run setup to create digital products.</p>
                <SetupButton />
              </div>
            )}
          </div>
        )}

        {/* Affiliates Tab */}
        {activeTab === 'affiliates' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Affiliate Marketing Performance</h3>
            {stats?.topAffiliates && stats.topAffiliates.length > 0 ? (
              <div className="space-y-3">
                {stats.topAffiliates.map((product, i) => {
                  const convRate = product.clickCount > 0
                    ? ((product.conversionCount / product.clickCount) * 100).toFixed(1)
                    : '0';
                  return (
                    <div key={i} className="bg-[#111] border border-[#222] rounded-xl p-5">
                      <div className="flex justify-between items-start">
                        <p className="font-medium">{product.name}</p>
                        <p className="font-bold text-[#b8832b]">{formatGBP(product.totalEarnings)}</p>
                      </div>
                      <div className="flex gap-6 mt-2 text-xs text-gray-400">
                        <span>{product.clickCount} clicks</span>
                        <span>{product.conversionCount} conversions</span>
                        <span className="text-emerald-400">{convRate}% conv. rate</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-[#111] border border-[#222] rounded-xl p-8 text-center">
                <p className="text-gray-400">No affiliate data yet. Run setup to add affiliate products.</p>
                <SetupButton />
              </div>
            )}
          </div>
        )}

        {/* Leads Tab */}
        {activeTab === 'leads' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Email List & Lead Nurturing</h3>
              <span className="text-xs text-gray-400">Auto-nurturing via email sequences</span>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Leads', value: stats?.leads.total || 0 },
                { label: 'New', value: stats?.leads.funnel.new || 0 },
                { label: 'Nurturing', value: stats?.leads.funnel.nurturing || 0 },
                { label: 'Converted', value: stats?.leads.funnel.converted || 0 },
              ].map((stat, i) => (
                <div key={i} className="bg-[#111] border border-[#222] rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-[#b8832b]">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="bg-[#111] border border-[#222] rounded-xl p-6">
              <p className="text-sm text-gray-300 leading-relaxed">
                Every lead that signs up is automatically enrolled in a <strong>7-email nurture sequence</strong>
                that runs over 15 days. The sequence delivers value, builds trust, promotes digital products and affiliate gear,
                and makes a direct offer for 1-on-1 coaching — all without you lifting a finger.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
                <div className="bg-[#1a1a1a] rounded-lg p-3">
                  <p className="text-[#b8832b] font-bold">Day 0</p>
                  <p className="text-gray-400 text-xs">Welcome + Lead Magnet</p>
                </div>
                <div className="bg-[#1a1a1a] rounded-lg p-3">
                  <p className="text-[#b8832b] font-bold">Days 2-9</p>
                  <p className="text-gray-400 text-xs">Value + Affiliate Promotion</p>
                </div>
                <div className="bg-[#1a1a1a] rounded-lg p-3">
                  <p className="text-[#b8832b] font-bold">Days 12-15</p>
                  <p className="text-gray-400 text-xs">Soft Sell + Discount Offer</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">SEO Content Engine</h3>
              <a href="/blog" className="text-sm text-[#b8832b] hover:underline">View Blog →</a>
            </div>
            <div className="bg-[#111] border border-[#222] rounded-xl p-6 mb-4">
              <h4 className="font-medium mb-3">Automated Content Schedule</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 py-2 border-b border-[#1a1a1a]">
                  <span className="w-24 text-[#b8832b] font-medium">Every Monday</span>
                  <span className="text-gray-300">New SEO blog post generated and published by Claude AI</span>
                  <span className="ml-auto text-emerald-400 text-xs bg-emerald-400/10 px-2 py-1 rounded-full">Auto</span>
                </div>
                <div className="flex items-center gap-3 py-2 border-b border-[#1a1a1a]">
                  <span className="w-24 text-[#b8832b] font-medium">Every Wednesday</span>
                  <span className="text-gray-300">Social media posts generated for Twitter & Instagram</span>
                  <span className="ml-auto text-emerald-400 text-xs bg-emerald-400/10 px-2 py-1 rounded-full">Auto</span>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <span className="w-24 text-[#b8832b] font-medium">Every 30min</span>
                  <span className="text-gray-300">Email sequences processed, due emails sent to leads</span>
                  <span className="ml-auto text-emerald-400 text-xs bg-emerald-400/10 px-2 py-1 rounded-full">Auto</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Setup Button */}
        <div className="mt-8 pt-6 border-t border-[#222]">
          <SetupButton />
        </div>
      </div>
    </div>
  );
}

function SetupButton() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<any>(null);

  const runSetup = async () => {
    setStatus('loading');
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/passive-income/admin/setup`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setResult(data);
      setStatus('done');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="text-center">
      {status === 'idle' && (
        <button
          onClick={runSetup}
          className="bg-[#b8832b] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#a07020] transition-colors"
        >
          Initialise Passive Income System
        </button>
      )}
      {status === 'loading' && (
        <div className="text-[#b8832b] animate-pulse">Setting up digital products, affiliate links & email sequences...</div>
      )}
      {status === 'done' && (
        <div className="text-emerald-400">
          ✓ System initialised! {result?.affiliates?.created} affiliate products, {result?.products?.created} digital products, email sequence created.
        </div>
      )}
      {status === 'error' && (
        <div className="text-red-400">Setup failed. Check console for details.</div>
      )}
    </div>
  );
}
