'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartLine } from '@/types';

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  add: (line: Omit<CartLine, 'quantity'>, quantity: number) => void;
  setQuantity: (competitionId: string, quantity: number) => void;
  remove: (competitionId: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
  count: () => number;
  subtotal: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      isOpen: false,
      add: (line, quantity) =>
        set((state) => {
          const existing = state.lines.find((l) => l.competitionId === line.competitionId);
          if (existing) {
            return {
              isOpen: true,
              lines: state.lines.map((l) =>
                l.competitionId === line.competitionId
                  ? { ...l, quantity: l.quantity + quantity }
                  : l,
              ),
            };
          }
          return { isOpen: true, lines: [...state.lines, { ...line, quantity }] };
        }),
      setQuantity: (competitionId, quantity) =>
        set((state) => ({
          lines: state.lines
            .map((l) => (l.competitionId === competitionId ? { ...l, quantity } : l))
            .filter((l) => l.quantity > 0),
        })),
      remove: (competitionId) =>
        set((state) => ({ lines: state.lines.filter((l) => l.competitionId !== competitionId) })),
      clear: () => set({ lines: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      count: () => get().lines.reduce((n, l) => n + l.quantity, 0),
      subtotal: () => get().lines.reduce((n, l) => n + l.quantity * l.ticketPrice, 0),
    }),
    { name: 'prize-arena-cart' },
  ),
);
