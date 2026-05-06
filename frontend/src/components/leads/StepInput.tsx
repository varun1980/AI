'use client';

import { useState } from 'react';
import { RawLead } from './LeadGenTool';

const NICHES = [
  'Roofers', 'Landscapers', 'Plumbers', 'Fence Installers', 'Chimney Repair',
  'HVAC', 'Dental Practices', 'Salons', 'Law Firms', 'Real Estate Agents',
  'Photographers', 'Event Venues', 'Cleaners', 'Electricians',
];

const EMPTY_LEAD: RawLead = {
  businessName: '',
  location: '',
  currentWebsite: '',
  phoneNumber: '',
  notes: '',
};

interface Props {
  onEnrich: (leads: RawLead[], niche: string, city: string) => void;
  loading: boolean;
}

export function StepInput({ onEnrich, loading }: Props) {
  const [niche, setNiche] = useState('');
  const [city, setCity] = useState('');
  const [leads, setLeads] = useState<RawLead[]>([{ ...EMPTY_LEAD }]);
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [parseError, setParseError] = useState('');

  function updateLead(i: number, field: keyof RawLead, value: string) {
    setLeads((prev) => prev.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)));
  }

  function addRow() {
    setLeads((prev) => [...prev, { ...EMPTY_LEAD }]);
  }

  function removeRow(i: number) {
    setLeads((prev) => prev.filter((_, idx) => idx !== i));
  }

  function parsePaste(): RawLead[] | null {
    setParseError('');
    const lines = pasteText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const parsed: RawLead[] = [];
    for (const line of lines) {
      const parts = line.split('|').map((p) => p.trim());
      if (!parts[0]) continue;
      parsed.push({
        businessName: parts[0] || '',
        location: parts[1] || city,
        currentWebsite: parts[2] === 'none' ? undefined : parts[2] || undefined,
        phoneNumber: parts[3] || undefined,
        notes: parts[4] || undefined,
      });
    }

    if (parsed.length === 0) {
      setParseError('Could not parse any leads. Use the format: Name | Location | Website | Phone | Notes');
      return null;
    }
    return parsed;
  }

  function handleSubmit() {
    if (!niche.trim() || !city.trim()) return;

    let finalLeads = leads;
    if (pasteMode) {
      const parsed = parsePaste();
      if (!parsed) return;
      finalLeads = parsed;
    }

    const valid = finalLeads.filter((l) => l.businessName.trim() && l.location.trim());
    if (valid.length === 0) return;
    onEnrich(valid, niche.trim(), city.trim());
  }

  const canSubmit =
    niche.trim() &&
    city.trim() &&
    (pasteMode
      ? pasteText.trim().length > 0
      : leads.some((l) => l.businessName.trim() && l.location.trim()));

  return (
    <div className="space-y-8">
      {/* Niche + City */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wider">Niche</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {NICHES.map((n) => (
              <button
                key={n}
                onClick={() => setNiche(n)}
                className={`px-3 py-1 rounded-full text-xs border transition-colors
                  ${niche === n
                    ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                    : 'border-dark-700 text-gray-500 hover:border-dark-600 hover:text-gray-400'
                  }`}
              >
                {n}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="Or type a niche..."
            className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-primary-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wider">City</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. West Austin, TX"
            className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-primary-500 text-sm"
          />
          <p className="mt-2 text-xs text-gray-600">
            Tip: use narrow queries — "cosmetic dentists in West Austin" beats "dentists in Austin"
          </p>
        </div>
      </div>

      {/* Input mode toggle */}
      <div>
        <div className="flex items-center gap-4 mb-5">
          <span className="text-sm text-gray-400 uppercase tracking-wider">Lead Input</span>
          <div className="flex rounded-lg border border-dark-700 overflow-hidden text-sm">
            <button
              onClick={() => setPasteMode(false)}
              className={`px-4 py-1.5 transition-colors ${!pasteMode ? 'bg-primary-500 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Form
            </button>
            <button
              onClick={() => setPasteMode(true)}
              className={`px-4 py-1.5 transition-colors ${pasteMode ? 'bg-primary-500 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Paste CSV
            </button>
          </div>
        </div>

        {pasteMode ? (
          <div>
            <p className="text-xs text-gray-500 mb-2">
              One business per line: <code className="text-primary-400">Name | Location | Website (or "none") | Phone | Notes</code>
            </p>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              rows={10}
              placeholder={`Rooftop Masters | West Austin, TX | rooftopmastersatx.com | 512-555-0101 | 4.8 stars, 23 reviews, site looks 2013
Curb Appeal Landscaping | West Austin, TX | none | 512-555-0202 | 47 reviews, no website at all
West Austin Plumbing | West Austin, TX | westaustinplumbing.com | 512-555-0303 | 5 stars, 12 reviews, site has no booking form`}
              className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white placeholder-gray-700 focus:outline-none focus:border-primary-500 text-sm font-mono"
            />
            {parseError && <p className="mt-2 text-xs text-red-400">{parseError}</p>}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Table header */}
            <div className="hidden md:grid grid-cols-[2fr_1.5fr_1.5fr_1.5fr_2fr_auto] gap-3 px-1">
              {['Business Name *', 'Location *', 'Website', 'Phone', 'Notes / Observations', ''].map((h) => (
                <span key={h} className="text-xs text-gray-600 uppercase tracking-wider">{h}</span>
              ))}
            </div>

            {leads.map((lead, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-[2fr_1.5fr_1.5fr_1.5fr_2fr_auto] gap-3 p-3 bg-dark-900 border border-dark-800 rounded-lg">
                <input
                  value={lead.businessName}
                  onChange={(e) => updateLead(i, 'businessName', e.target.value)}
                  placeholder="Business name"
                  className="bg-dark-800 border border-dark-700 rounded px-3 py-2 text-white placeholder-gray-700 text-sm focus:outline-none focus:border-primary-500"
                />
                <input
                  value={lead.location}
                  onChange={(e) => updateLead(i, 'location', e.target.value)}
                  placeholder={city || 'City, State'}
                  className="bg-dark-800 border border-dark-700 rounded px-3 py-2 text-white placeholder-gray-700 text-sm focus:outline-none focus:border-primary-500"
                />
                <input
                  value={lead.currentWebsite || ''}
                  onChange={(e) => updateLead(i, 'currentWebsite', e.target.value)}
                  placeholder="URL or 'none'"
                  className="bg-dark-800 border border-dark-700 rounded px-3 py-2 text-white placeholder-gray-700 text-sm focus:outline-none focus:border-primary-500"
                />
                <input
                  value={lead.phoneNumber || ''}
                  onChange={(e) => updateLead(i, 'phoneNumber', e.target.value)}
                  placeholder="Phone"
                  className="bg-dark-800 border border-dark-700 rounded px-3 py-2 text-white placeholder-gray-700 text-sm focus:outline-none focus:border-primary-500"
                />
                <input
                  value={lead.notes || ''}
                  onChange={(e) => updateLead(i, 'notes', e.target.value)}
                  placeholder="Reviews, observations..."
                  className="bg-dark-800 border border-dark-700 rounded px-3 py-2 text-white placeholder-gray-700 text-sm focus:outline-none focus:border-primary-500"
                />
                <button
                  onClick={() => removeRow(i)}
                  disabled={leads.length === 1}
                  className="text-gray-700 hover:text-red-400 transition-colors disabled:opacity-20 text-lg leading-none"
                >
                  ×
                </button>
              </div>
            ))}

            <button
              onClick={addRow}
              className="text-sm text-gray-500 hover:text-primary-400 transition-colors border border-dashed border-dark-700 rounded-lg px-4 py-2.5 w-full hover:border-primary-700"
            >
              + Add another business
            </button>
          </div>
        )}
      </div>

      {/* Google Maps tip */}
      <div className="p-4 bg-dark-900 border border-dark-800 rounded-lg text-xs text-gray-500 space-y-1">
        <p className="text-gray-400 font-medium">Google Maps hunting tips</p>
        <p>• Skip the top 3-4 results — they already have great sites.</p>
        <p>• Sweet spot: established business, 5+ years, under 50 reviews, weak or no website.</p>
        <p>• Copy: name, current website, phone, one standout detail from their profile.</p>
        <p>• Aim for 25-30 leads from one niche in one city, then let Claude do the work.</p>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit || loading}
        className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? 'Enriching with Claude...' : 'Enrich Leads →'}
      </button>
    </div>
  );
}
