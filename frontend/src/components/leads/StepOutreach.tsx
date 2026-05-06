'use client';

import { useState } from 'react';
import { OutreachPackage } from './LeadGenTool';

interface Props {
  packages: OutreachPackage[];
  onReset: () => void;
}

interface CopyField {
  label: string;
  key: keyof OutreachPackage;
  color?: string;
}

const FIELDS: CopyField[] = [
  { label: 'Cold Message', key: 'coldMessage', color: 'text-green-400' },
  { label: 'Follow-up 1', key: 'followUp1', color: 'text-blue-400' },
  { label: 'Follow-up 2', key: 'followUp2', color: 'text-blue-400' },
  { label: 'Diagnosis', key: 'diagnosis' },
  { label: 'Site Brief', key: 'siteBrief' },
  { label: 'Lovable Prompt', key: 'lovablePrompt', color: 'text-purple-400' },
  { label: 'Higgsfield Prompt', key: 'higgsfieldPrompt', color: 'text-yellow-400' },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={copy}
      className="text-xs px-2.5 py-1 rounded border border-dark-700 text-gray-500 hover:text-white hover:border-dark-500 transition-colors flex-shrink-0"
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

function LeadCard({ pkg }: { pkg: OutreachPackage }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-dark-800 rounded-xl overflow-hidden bg-dark-900">
      {/* Card header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-dark-800/50 transition-colors"
      >
        <div>
          <h3 className="font-medium text-white">{pkg.businessName}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{pkg.location}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-600 hidden md:block max-w-xs truncate">
            {pkg.outreachAngle}
          </span>
          <span className="text-gray-500 text-lg">{expanded ? '−' : '+'}</span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-dark-800 divide-y divide-dark-800">
          {FIELDS.map(({ label, key, color }) => {
            const value = pkg[key] as string;
            if (!value) return null;
            return (
              <div key={key} className="px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs uppercase tracking-wider font-medium ${color || 'text-gray-500'}`}>
                    {label}
                  </span>
                  <CopyButton text={value} />
                </div>
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{value}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function StepOutreach({ packages, onReset }: Props) {
  function exportJson() {
    const blob = new Blob([JSON.stringify(packages, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `outreach-packages-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportCsv() {
    const headers = [
      'businessName', 'location', 'currentWebsite', 'phoneNumber',
      'coldMessage', 'followUp1', 'followUp2', 'diagnosis',
      'siteBrief', 'lovablePrompt', 'higgsfieldPrompt',
    ];
    const rows = packages.map((p) =>
      headers.map((h) => `"${((p as any)[h] || '').replace(/"/g, '""')}"`).join(','),
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `outreach-packages-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">
            <span className="text-white font-medium">{packages.length} outreach packages</span> ready to send.
          </p>
          <p className="text-gray-600 text-xs mt-1">
            The math: 30 sequences → 10-15% reply rate → 3-4 positive replies → 30-50% close rate = 1-2 deals/weekend.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportCsv}
            className="text-sm px-4 py-2 border border-dark-700 rounded-lg text-gray-400 hover:text-white hover:border-dark-500 transition-colors"
          >
            Export CSV
          </button>
          <button
            onClick={exportJson}
            className="text-sm px-4 py-2 border border-dark-700 rounded-lg text-gray-400 hover:text-white hover:border-dark-500 transition-colors"
          >
            Export JSON
          </button>
          <button onClick={onReset} className="text-sm text-gray-600 hover:text-gray-300">
            Start over
          </button>
        </div>
      </div>

      {/* Subject line tips */}
      <div className="p-4 bg-dark-900 border border-dark-800 rounded-lg text-xs space-y-1">
        <p className="text-gray-400 font-medium">Subject lines that work</p>
        <div className="flex flex-wrap gap-3 mt-1">
          {[
            '"Built something for [Business]"',
            '"Quick mockup for [Business]"',
            '"Saw your reviews, made you something"',
          ].map((s) => (
            <span key={s} className="text-green-400">{s}</span>
          ))}
        </div>
        <p className="text-gray-600 pt-1">Avoid: "Quick question", "Improving your website", "Free consultation"</p>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {packages.map((pkg, i) => (
          <LeadCard key={i} pkg={pkg} />
        ))}
      </div>

      {/* Follow-up reminder */}
      <div className="p-4 bg-dark-900 border border-dark-800 rounded-lg text-xs text-gray-500 space-y-1">
        <p className="text-gray-400 font-medium">Follow-up cadence</p>
        <p>• No reply after 4 days → send Follow-up 1</p>
        <p>• No reply after 7 more days → send Follow-up 2 from a different angle</p>
        <p>• Then archive. Don't spam.</p>
        <p className="pt-1 text-gray-600">Channel tip: email for most niches · SMS for contractors/trades · Instagram DM for salons/restaurants · LinkedIn for law firms</p>
      </div>
    </div>
  );
}
