import Image from 'next/image';
import Link from 'next/link';
import type { Competition } from '@/types';
import { formatGBP, pct } from '@/lib/utils';
import { Countdown } from '@/components/ui/Countdown';
import { ProgressBar } from '@/components/ui/ProgressBar';

export function CompetitionCard({ comp }: { comp: Competition }) {
  const soldOut = comp.ticketsSold >= comp.totalTickets;
  const almostGone = pct(comp.ticketsSold, comp.totalTickets) >= 85;

  return (
    <Link href={`/competitions/${comp.slug}`} className="card card-hover group flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={comp.image}
          alt={comp.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <span className="badge-live">
            <span className="live-dot" /> Live
          </span>
          {comp.instantWins?.length ? (
            <span className="badge-instant">⚡ Instant Wins</span>
          ) : almostGone ? (
            <span className="badge-hot">🔥 Almost Gone</span>
          ) : null}
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink-950 to-transparent p-3">
          <Countdown to={comp.drawDate} compact />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-xl uppercase leading-tight text-white">{comp.title}</h3>
        <p className="mt-1 text-sm text-gray-400">{comp.subtitle}</p>

        <div className="mt-4">
          <ProgressBar sold={comp.ticketsSold} total={comp.totalTickets} />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-500">Per ticket</div>
            <div className="font-display text-2xl text-primary-400">{formatGBP(comp.ticketPrice)}</div>
          </div>
          <span className="btn-primary px-5 py-2.5 text-sm">
            {soldOut ? 'Sold Out' : 'Enter Now'}
          </span>
        </div>
      </div>
    </Link>
  );
}
