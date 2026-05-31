import Link from 'next/link';
import Image from 'next/image';
import { FiArrowRight, FiZap } from 'react-icons/fi';
import type { Competition } from '@/types';
import { formatGBP } from '@/lib/utils';
import { Countdown } from '@/components/ui/Countdown';
import { ProgressBar } from '@/components/ui/ProgressBar';

export function Hero({ featured }: { featured: Competition }) {
  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-accent-500/10 blur-3xl" />

      <div className="container-custom relative grid items-center gap-10 py-14 md:grid-cols-2 md:py-20">
        <div>
          <span className="badge-live mb-5">
            <span className="live-dot" /> Draws happening live
          </span>
          <h1 className="font-display text-5xl uppercase leading-[0.95] tracking-wide md:text-7xl">
            Win your <span className="text-gradient">dream prize</span> from just 49p
          </h1>
          <p className="mt-5 max-w-md text-lg text-gray-300">
            Cars, tax-free cash and the latest tech — given away in live online draws every week. Low
            ticket numbers mean better odds than the lottery.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/competitions" className="btn-primary text-base">
              Browse Competitions <FiArrowRight />
            </Link>
            <Link href="/how-it-works" className="btn-ghost text-base">
              How it works
            </Link>
          </div>
          <div className="mt-8 flex gap-8">
            <Stat value="500k+" label="Tickets sold" />
            <Stat value="£2.4m+" label="Prizes given away" />
            <Stat value="4.9★" label="Player rating" />
          </div>
        </div>

        <Link
          href={`/competitions/${featured.slug}`}
          className="group card card-hover relative block"
        >
          <span className="absolute left-4 top-4 z-10 badge-instant">
            <FiZap size={12} /> Featured Draw
          </span>
          <div className="relative aspect-[16/10] overflow-hidden">
            <Image
              src={featured.image}
              alt={featured.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="p-5">
            <h2 className="font-display text-2xl uppercase">{featured.title}</h2>
            <p className="text-sm text-gray-400">{featured.subtitle}</p>
            <div className="my-4">
              <ProgressBar sold={featured.ticketsSold} total={featured.totalTickets} />
            </div>
            <div className="flex items-center justify-between">
              <Countdown to={featured.drawDate} compact />
              <span className="font-display text-xl text-primary-400">
                {formatGBP(featured.ticketPrice)} <span className="text-sm text-gray-500">/ entry</span>
              </span>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-2xl text-white md:text-3xl">{value}</div>
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
    </div>
  );
}
