import { pct } from '@/lib/utils';

export function ProgressBar({ sold, total }: { sold: number; total: number }) {
  const p = pct(sold, total);
  const nearlyGone = p >= 85;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className={nearlyGone ? 'text-danger-500 font-semibold' : 'text-gray-400'}>
          {p}% sold
        </span>
        <span className="text-gray-500">
          {(total - sold).toLocaleString()} left
        </span>
      </div>
      <div className="h-2 rounded-full bg-ink-850 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            nearlyGone
              ? 'bg-gradient-to-r from-danger-600 to-danger-500'
              : 'bg-gradient-to-r from-primary-500 to-primary-300'
          }`}
          style={{ width: `${p}%` }}
        />
      </div>
    </div>
  );
}
