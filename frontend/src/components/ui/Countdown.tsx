'use client';

import { useEffect, useState } from 'react';

function diff(target: number) {
  const ms = Math.max(0, target - Date.now());
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return { d, h, m, s, done: ms === 0 };
}

const pad = (n: number) => n.toString().padStart(2, '0');

export function Countdown({ to, compact = false }: { to: string; compact?: boolean }) {
  const target = new Date(to).getTime();
  const [t, setT] = useState(() => diff(target));

  useEffect(() => {
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (compact) {
    return (
      <span className="font-mono tabular-nums text-sm font-semibold text-primary-300">
        {t.done ? 'Drawing now' : `${t.d}d ${pad(t.h)}:${pad(t.m)}:${pad(t.s)}`}
      </span>
    );
  }

  const cells: [string, number][] = [
    ['Days', t.d],
    ['Hours', t.h],
    ['Mins', t.m],
    ['Secs', t.s],
  ];

  return (
    <div className="flex gap-2">
      {cells.map(([label, value]) => (
        <div
          key={label}
          className="flex-1 rounded-lg bg-ink-850 border border-white/10 px-2 py-2 text-center"
        >
          <div className="font-mono tabular-nums text-2xl font-bold text-white">{pad(value)}</div>
          <div className="text-[10px] uppercase tracking-widest text-gray-500">{label}</div>
        </div>
      ))}
    </div>
  );
}
