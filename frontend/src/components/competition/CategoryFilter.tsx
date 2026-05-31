'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

const tabs: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'cars', label: 'Cars' },
  { value: 'cash', label: 'Cash' },
  { value: 'tech', label: 'Tech' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'instant', label: 'Instant Wins' },
];

export function CategoryFilter() {
  const router = useRouter();
  const params = useSearchParams();
  const active = params.get('category') || 'all';

  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => router.push(t.value === 'all' ? '/competitions' : `/competitions?category=${t.value}`)}
          className={cn(
            'whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors',
            active === t.value
              ? 'bg-primary-500 text-ink-950'
              : 'bg-white/5 text-gray-300 hover:bg-white/10',
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
