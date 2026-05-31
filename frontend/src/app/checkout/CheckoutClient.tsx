'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiCheck, FiLock, FiZap } from 'react-icons/fi';
import type { Competition } from '@/types';
import { useCart } from '@/store/cartStore';
import { formatGBP, cn } from '@/lib/utils';

interface OrderSuccess {
  orderId: string;
  amount: number;
  mock: boolean;
  ticketNumbers: { competitionId: string; numbers: number[] }[];
  instantWins: { competitionId: string; label: string; value: number }[];
}

export function CheckoutClient({ competitions }: { competitions: Competition[] }) {
  const { lines, subtotal, clear, setQuantity } = useCart();
  const byId = useMemo(() => new Map(competitions.map((c) => [c.id, c])), [competitions]);

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderSuccess | null>(null);

  const allAnswered = lines.every((l) => answers[l.competitionId] !== undefined);
  const validEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

  async function handlePay() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          items: lines.map((l) => ({
            competitionId: l.competitionId,
            quantity: l.quantity,
            answerIndex: answers[l.competitionId],
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }
      setOrder({
        orderId: data.orderId,
        amount: data.amount,
        mock: data.mock,
        ticketNumbers: data.ticketNumbers ?? [],
        instantWins: data.instantWins ?? [],
      });
      clear();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (order) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success-500/15 text-3xl text-success-400">
          <FiCheck />
        </div>
        <h1 className="mt-5 font-display text-4xl uppercase">You&apos;re in!</h1>
        <p className="mt-2 text-gray-400">
          Order <span className="font-mono text-gray-300">{order.orderId}</span> confirmed — total{' '}
          {formatGBP(order.amount)}.{' '}
          {order.mock && <span className="text-gray-500">(demo checkout — no payment taken)</span>}
        </p>

        {order.instantWins.length > 0 && (
          <div className="mt-6 animate-pulse-glow rounded-2xl border border-accent-500/40 bg-accent-500/10 p-6">
            <div className="flex items-center justify-center gap-2 font-display text-2xl uppercase text-accent-400">
              <FiZap /> Instant Win!
            </div>
            {order.instantWins.map((iw, i) => (
              <p key={i} className="mt-2 text-lg">
                You won <span className="font-bold text-white">{iw.label}</span>!
              </p>
            ))}
          </div>
        )}

        <div className="mt-6 space-y-3 text-left">
          {order.ticketNumbers.map((t) => {
            const comp = byId.get(t.competitionId);
            return (
              <div key={t.competitionId} className="card p-4">
                <div className="font-semibold">{comp?.title ?? t.competitionId}</div>
                <div className="mt-1 text-sm text-gray-400">
                  Your ticket numbers:{' '}
                  <span className="font-mono text-primary-300">
                    {t.numbers.slice(0, 30).join(', ')}
                    {t.numbers.length > 30 ? '…' : ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center gap-3">
          <Link href="/competitions" className="btn-primary">Enter another</Link>
          <Link href="/account" className="btn-ghost">View my entries</Link>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-md text-center">
        <h1 className="font-display text-3xl uppercase">Your basket is empty</h1>
        <p className="mt-2 text-gray-400">Add some tickets to get started.</p>
        <Link href="/competitions" className="btn-primary mt-6">Browse competitions</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <h1 className="section-title text-3xl">Checkout</h1>

        {lines.map((l) => {
          const comp = byId.get(l.competitionId);
          if (!comp) return null;
          return (
            <div key={l.competitionId} className="card p-5">
              <div className="flex gap-4">
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                  <Image src={l.image} alt={l.title} fill sizes="80px" className="object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{l.title}</h3>
                    <span className="text-primary-400">{formatGBP(l.quantity * l.ticketPrice)}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-400">
                    <span>{l.quantity} tickets</span>
                    <span>·</span>
                    <button onClick={() => setQuantity(l.competitionId, l.quantity - 1)} className="hover:text-white">−</button>
                    <button onClick={() => setQuantity(l.competitionId, l.quantity + 1)} className="hover:text-white">+</button>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-white/10 pt-4">
                <p className="mb-2 text-sm font-medium text-gray-300">{comp.skillQuestion.question}</p>
                <div className="grid grid-cols-3 gap-2">
                  {comp.skillQuestion.options.map((opt, i) => (
                    <button
                      key={opt}
                      onClick={() => setAnswers((a) => ({ ...a, [l.competitionId]: i }))}
                      className={cn(
                        'rounded-lg border px-3 py-2 text-sm transition-colors',
                        answers[l.competitionId] === i
                          ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                          : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/30',
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="lg:sticky lg:top-20 lg:self-start">
        <div className="card p-6">
          <h2 className="font-display text-xl uppercase">Order summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            {lines.map((l) => (
              <div key={l.competitionId} className="flex justify-between text-gray-400">
                <span className="truncate pr-2">{l.title} ×{l.quantity}</span>
                <span>{formatGBP(l.quantity * l.ticketPrice)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
            <span className="text-gray-400">Total</span>
            <span className="font-display text-2xl text-primary-400">{formatGBP(subtotal())}</span>
          </div>

          <label className="mt-5 block text-sm text-gray-400">
            Email for ticket confirmation
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input mt-1.5"
            />
          </label>

          {error && (
            <p className="mt-3 rounded-lg bg-danger-500/10 px-3 py-2 text-sm text-danger-500">{error}</p>
          )}

          <button
            onClick={handlePay}
            disabled={!allAnswered || !validEmail || submitting}
            className="btn-primary mt-4 w-full"
          >
            <FiLock size={16} />
            {submitting ? 'Processing…' : `Pay ${formatGBP(subtotal())}`}
          </button>

          {!allAnswered && (
            <p className="mt-2 text-center text-xs text-gray-500">
              Answer every skill question to continue.
            </p>
          )}
          <p className="mt-3 text-center text-xs text-gray-500">
            <FiLock className="inline" /> Secure checkout. 18+ UK residents only.
          </p>
        </div>
      </div>
    </div>
  );
}
