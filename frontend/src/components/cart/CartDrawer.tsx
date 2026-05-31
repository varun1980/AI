'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FiX, FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import { useCart } from '@/store/cartStore';
import { formatGBP } from '@/lib/utils';

export function CartDrawer() {
  const { lines, isOpen, close, setQuantity, remove, subtotal, count } = useCart();

  return (
    <>
      <div
        onClick={close}
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-ink-900 shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <h2 className="font-display text-xl uppercase">Your Basket ({count()})</h2>
          <button onClick={close} aria-label="Close basket" className="grid h-9 w-9 place-items-center rounded-lg hover:bg-white/10">
            <FiX size={20} />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <p className="text-gray-400">Your basket is empty.</p>
            <Link href="/competitions" onClick={close} className="btn-primary">
              Browse competitions
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {lines.map((l) => (
                <div key={l.competitionId} className="flex gap-3 rounded-xl bg-ink-850 p-3">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                    <Image src={l.image} alt={l.title} fill sizes="64px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-semibold">{l.title}</p>
                      <button onClick={() => remove(l.competitionId)} aria-label="Remove" className="text-gray-500 hover:text-danger-500">
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">{formatGBP(l.ticketPrice)} / ticket</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setQuantity(l.competitionId, l.quantity - 1)}
                          className="grid h-7 w-7 place-items-center rounded bg-white/5 hover:bg-white/10"
                          aria-label="Decrease"
                        >
                          <FiMinus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{l.quantity}</span>
                        <button
                          onClick={() => setQuantity(l.competitionId, l.quantity + 1)}
                          className="grid h-7 w-7 place-items-center rounded bg-white/5 hover:bg-white/10"
                          aria-label="Increase"
                        >
                          <FiPlus size={14} />
                        </button>
                      </div>
                      <span className="font-semibold text-primary-400">
                        {formatGBP(l.quantity * l.ticketPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-gray-400">Subtotal</span>
                <span className="font-display text-2xl text-primary-400">{formatGBP(subtotal())}</span>
              </div>
              <Link href="/checkout" onClick={close} className="btn-primary w-full">
                Checkout
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
