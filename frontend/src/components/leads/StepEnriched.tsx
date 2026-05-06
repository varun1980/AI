'use client';

import { useState } from 'react';
import { EnrichedLead } from './LeadGenTool';

interface Props {
  enrichedLeads: EnrichedLead[];
  niche: string;
  city: string;
  onGenerate: (selected: EnrichedLead[]) => void;
  onBack: () => void;
  loading: boolean;
}

export function StepEnriched({ enrichedLeads, niche, city, onGenerate, onBack, loading }: Props) {
  const [selected, setSelected] = useState<Set<number>>(
    new Set(enrichedLeads.slice(0, 8).map((_, i) => i)),
  );

  function toggleAll() {
    if (selected.size === enrichedLeads.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(enrichedLeads.map((_, i) => i)));
    }
  }

  function toggleOne(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  const selectedLeads = enrichedLeads.filter((_, i) => selected.has(i));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">
            Claude found <span className="text-white font-medium">{enrichedLeads.length} enriched leads</span> for{' '}
            <span className="text-primary-400">{niche}</span> in <span className="text-primary-400">{city}</span>.
          </p>
          <p className="text-gray-600 text-xs mt-1">
            Select your top leads for full outreach generation (recommended: 5-8 for best quality).
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-300">
            ← Back
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-dark-800">
              <th className="pb-3 pr-4 w-10">
                <input
                  type="checkbox"
                  checked={selected.size === enrichedLeads.length}
                  onChange={toggleAll}
                  className="accent-primary-500"
                />
              </th>
              <th className="pb-3 pr-4 text-xs text-gray-500 uppercase tracking-wider font-medium">Business</th>
              <th className="pb-3 pr-4 text-xs text-gray-500 uppercase tracking-wider font-medium">Presence Diagnosis</th>
              <th className="pb-3 pr-4 text-xs text-gray-500 uppercase tracking-wider font-medium">Outreach Angle</th>
              <th className="pb-3 text-xs text-gray-500 uppercase tracking-wider font-medium">Website Gap</th>
            </tr>
          </thead>
          <tbody>
            {enrichedLeads.map((lead, i) => (
              <tr
                key={i}
                onClick={() => toggleOne(i)}
                className={`border-b border-dark-900 cursor-pointer transition-colors
                  ${selected.has(i) ? 'bg-primary-500/5' : 'hover:bg-dark-900/50'}`}
              >
                <td className="py-4 pr-4" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selected.has(i)}
                    onChange={() => toggleOne(i)}
                    className="accent-primary-500"
                  />
                </td>
                <td className="py-4 pr-4 align-top">
                  <p className="font-medium text-white">{lead.businessName}</p>
                  <p className="text-gray-600 text-xs mt-0.5">{lead.location}</p>
                  {lead.currentWebsite && (
                    <p className="text-gray-700 text-xs mt-0.5 truncate max-w-[160px]">
                      {lead.currentWebsite}
                    </p>
                  )}
                </td>
                <td className="py-4 pr-4 align-top text-gray-400 max-w-[220px]">
                  {lead.presenceDiagnosis}
                </td>
                <td className="py-4 pr-4 align-top text-primary-400 max-w-[200px]">
                  {lead.outreachAngle}
                </td>
                <td className="py-4 align-top text-gray-400 max-w-[180px]">
                  {lead.websiteGap}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between pt-2">
        <p className="text-sm text-gray-600">
          {selected.size} lead{selected.size !== 1 ? 's' : ''} selected
        </p>
        <button
          onClick={() => onGenerate(selectedLeads)}
          disabled={selected.size === 0 || loading}
          className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading
            ? 'Generating outreach packages...'
            : `Generate Outreach for ${selected.size} Lead${selected.size !== 1 ? 's' : ''} →`}
        </button>
      </div>
    </div>
  );
}
