'use client';

import { useState } from 'react';
import { FiMinus, FiPlus, FiCheck } from 'react-icons/fi';
import type { Competition } from '@/types';
import { formatGBP } from '@/lib/utils';
import { useCart } from '@/store/cartStore';
import { cn } from '@/lib/utils';

export function EntryPanel({ comp }: { comp: Competition }) {
  const remaining = comp.totalTickets - comp.ticketsSold;
  const max = Math.min(comp.maxPerUser, remaining);
  const soldOut = remaining <= 0;

  const [qty, setQty] = useState(1);
  const [answer, setAnswer] = useState<number | null>(null);
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);

  const quickPicks = [1, 5, 10, 25].filter((n) => n <= max);
  const clamp = (n: number) => Math.max(1, Math.min(max, n));

  const handleAdd = () => {
    if (answer === null) return;
    add(
      {
        competitionId: comp.id,
        slug: comp.slug,
        title: comp.title,
        image: comp.image,
        ticketPrice: comp.ticketPrice,
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (soldOut) {
    return (
      <div className="card p-6 text-center">
        <div className="badge-hot mx-auto">Sold Out</div>
        <p className="mt-3 text-gray-400">
          This competition has sold out. The winner will be announced in the next live draw.
        </p>
      </div>
    );
  }

  return (
    <div className="card p-6 space-y-6">
      {/* Step 1 — tickets */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            1. Choose your tickets
          </span>
          <span className="text-sm text-gray-500">Max {max}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setQty((q) => clamp(q - 1))}
            className="grid h-11 w-11 place-items-center rounded-lg bg-white/5 hover:bg-white/10"
            aria-label="Fewer tickets"
          >
            <FiMinus />
          </button>
          <input
            type="number"
            min={1}
            max={max}
            value={qty}
            onChange={(e) => setQty(clamp(parseInt(e.target.value) || 1))}
            className="input text-center font-display text-2xl"
          />
          <button
            onClick={() => setQty((q) => clamp(q + 1))}
            className="grid h-11 w-11 place-items-center rounded-lg bg-white/5 hover:bg-white/10"
            aria-label="More tickets"
          >
            <FiPlus />
          </button>
        </div>

        <input
          type="range"
          min={1}
          max={max}
          value={qty}
          onChange={(e) => setQty(clamp(parseInt(e.target.value)))}
          className="mt-4 w-full accent-primary-500"
        />

        <div className="mt-3 flex gap-2">
          {quickPicks.map((n) => (
            <button
              key={n}
              onClick={() => setQty(n)}
              className={cn(
                'flex-1 rounded-lg py-2 text-sm font-semibold',
                qty === n ? 'bg-primary-500 text-ink-950' : 'bg-white/5 text-gray-300 hover:bg-white/10',
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2 — skill question */}
      <div>
        <span className="mb-3 block text-sm font-semibold uppercase tracking-wide text-gray-400">
          2. Answer to enter
        </span>
        <p className="mb-3 font-medium text-white">{comp.skillQuestion.question}</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {comp.skillQuestion.options.map((opt, i) => (
            <button
              key={opt}
              onClick={() => setAnswer(i)}
              className={cn(
                'rounded-lg border px-4 py-3 text-sm font-medium transition-colors',
                answer === i
                  ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                  : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/30',
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Step 3 — add */}
      <div className="border-t border-white/10 pt-5">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-gray-400">Total</span>
          <span className="font-display text-3xl text-primary-400">
            {formatGBP(qty * comp.ticketPrice)}
          </span>
        </div>
        <button
          onClick={handleAdd}
          disabled={answer === null}
          className="btn-primary w-full text-base"
        >
          {added ? (
            <>
              <FiCheck /> Added to basket
            </>
          ) : answer === null ? (
            'Answer the question to continue'
          ) : (
            `Add ${qty} ticket${qty > 1 ? 's' : ''} to basket`
          )}
        </button>
        <p className="mt-3 text-center text-xs text-gray-500">
          18+ UK residents only. Free postal entry route available — see T&amp;Cs.
        </p>
      </div>
    </div>
  );
}
