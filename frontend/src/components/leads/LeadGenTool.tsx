'use client';

import { useState } from 'react';
import { leadsApi } from '@/lib/api';
import { StepInput } from './StepInput';
import { StepEnriched } from './StepEnriched';
import { StepOutreach } from './StepOutreach';

export interface RawLead {
  businessName: string;
  location: string;
  currentWebsite?: string;
  phoneNumber?: string;
  notes?: string;
}

export interface EnrichedLead extends RawLead {
  presenceDiagnosis: string;
  outreachAngle: string;
  websiteGap: string;
}

export interface OutreachPackage extends EnrichedLead {
  diagnosis: string;
  siteBrief: string;
  coldMessage: string;
  followUp1: string;
  followUp2: string;
  lovablePrompt: string;
  higgsfieldPrompt: string;
}

type Step = 1 | 2 | 3;

export function LeadGenTool() {
  const [step, setStep] = useState<Step>(1);
  const [niche, setNiche] = useState('');
  const [city, setCity] = useState('');
  const [rawLeads, setRawLeads] = useState<RawLead[]>([]);
  const [enrichedLeads, setEnrichedLeads] = useState<EnrichedLead[]>([]);
  const [outreachPackages, setOutreachPackages] = useState<OutreachPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleEnrich(leads: RawLead[], nicheVal: string, cityVal: string) {
    setLoading(true);
    setError('');
    try {
      const { data } = await leadsApi.enrich({ niche: nicheVal, city: cityVal, leads });
      setNiche(nicheVal);
      setCity(cityVal);
      setRawLeads(leads);
      setEnrichedLeads(data);
      setStep(2);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to enrich leads. Check your API key.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate(selected: EnrichedLead[]) {
    setLoading(true);
    setError('');
    try {
      const { data } = await leadsApi.generate({ leads: selected });
      setOutreachPackages(data);
      setStep(3);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to generate outreach. Try a smaller batch.');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStep(1);
    setNiche('');
    setCity('');
    setRawLeads([]);
    setEnrichedLeads([]);
    setOutreachPackages([]);
    setError('');
  }

  return (
    <div className="container-custom max-w-6xl">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-4xl uppercase tracking-wider mb-2">
          Lead Gen <span className="text-primary-500">Tool</span>
        </h1>
        <p className="text-gray-400 text-sm">
          Google Maps + Claude → enriched leads → ready-to-send outreach packages
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-10">
        {(['Find Leads', 'Review & Select', 'Outreach Packages'] as const).map((label, i) => {
          const num = (i + 1) as Step;
          const active = step === num;
          const done = step > num;
          return (
            <div key={label} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                    ${done ? 'bg-primary-500 text-white' : active ? 'bg-primary-500 text-white' : 'bg-dark-800 text-gray-500'}`}
                >
                  {done ? '✓' : num}
                </div>
                <span className={`text-sm ${active ? 'text-white' : 'text-gray-500'}`}>{label}</span>
              </div>
              {i < 2 && <div className="w-12 h-px bg-dark-700" />}
            </div>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Steps */}
      {step === 1 && (
        <StepInput onEnrich={handleEnrich} loading={loading} />
      )}
      {step === 2 && (
        <StepEnriched
          enrichedLeads={enrichedLeads}
          niche={niche}
          city={city}
          onGenerate={handleGenerate}
          onBack={() => setStep(1)}
          loading={loading}
        />
      )}
      {step === 3 && (
        <StepOutreach
          packages={outreachPackages}
          onReset={reset}
        />
      )}
    </div>
  );
}
