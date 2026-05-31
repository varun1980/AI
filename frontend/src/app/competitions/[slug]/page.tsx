import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { FiCheck, FiClock, FiTag, FiUsers, FiGift } from 'react-icons/fi';
import { getCompetition, listCompetitions } from '@/lib/store';
import { formatGBP } from '@/lib/utils';
import { Countdown } from '@/components/ui/Countdown';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EntryPanel } from '@/components/competition/EntryPanel';
import { CompetitionCard } from '@/components/competition/CompetitionCard';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const comp = await getCompetition(params.slug);
  if (!comp) return { title: 'Competition not found' };
  return { title: comp.title, description: comp.description };
}

export default async function CompetitionDetail({ params }: { params: { slug: string } }) {
  const comp = await getCompetition(params.slug);
  if (!comp) notFound();

  const others = (await listCompetitions()).filter((c) => c.id !== comp.id).slice(0, 3);

  return (
    <div className="container-custom py-8">
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/competitions" className="hover:text-primary-400">Competitions</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-300">{comp.title}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="card relative aspect-[4/3] overflow-hidden">
            <Image
              src={comp.gallery[0] ?? comp.image}
              alt={comp.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute left-4 top-4 flex gap-2">
              <span className="badge-live"><span className="live-dot" /> Live</span>
              {comp.cashAlternative && (
                <span className="badge bg-primary-500/15 text-primary-300 ring-1 ring-primary-500/40">
                  Cash alternative
                </span>
              )}
            </div>
          </div>
          {comp.gallery.length > 1 && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              {comp.gallery.map((g, i) => (
                <div key={i} className="card relative aspect-[4/3] overflow-hidden">
                  <Image src={g} alt={`${comp.title} ${i + 1}`} fill sizes="33vw" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info + entry */}
        <div className="space-y-6">
          <div>
            <h1 className="font-display text-4xl uppercase leading-tight">{comp.title}</h1>
            <p className="mt-1 text-lg text-gray-400">{comp.subtitle}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Fact icon={<FiTag />} label="Per ticket" value={formatGBP(comp.ticketPrice)} />
            <Fact icon={<FiUsers />} label="Max entries" value={String(comp.maxPerUser)} />
            <Fact icon={<FiClock />} label="Tickets left" value={(comp.totalTickets - comp.ticketsSold).toLocaleString()} />
            {comp.cashAlternative ? (
              <Fact icon={<FiGift />} label="Cash option" value={formatGBP(comp.cashAlternative)} />
            ) : (
              <Fact icon={<FiGift />} label="Total tickets" value={comp.totalTickets.toLocaleString()} />
            )}
          </div>

          <div className="card p-5">
            <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
              Draw closes in
            </div>
            <Countdown to={comp.drawDate} />
            <div className="mt-5">
              <ProgressBar sold={comp.ticketsSold} total={comp.totalTickets} />
            </div>
          </div>

          <EntryPanel comp={comp} />
        </div>
      </div>

      {/* Description */}
      <div className="mt-12 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="section-title text-2xl">About this prize</h2>
          <p className="mt-4 leading-relaxed text-gray-300">{comp.description}</p>

          {comp.instantWins?.length ? (
            <div className="mt-8">
              <h3 className="font-display text-xl uppercase">⚡ Instant Wins remaining</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {comp.instantWins.map((iw) => (
                  <div key={iw.label} className="flex items-center justify-between rounded-xl bg-ink-850 px-4 py-3">
                    <span className="font-semibold">{iw.label}</span>
                    <span className="text-sm text-accent-400">{iw.remaining} left</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div>
          <h3 className="font-display text-xl uppercase">What you win</h3>
          <ul className="mt-4 space-y-3">
            {comp.highlights.map((h) => (
              <li key={h} className="flex items-start gap-3 text-gray-300">
                <FiCheck className="mt-1 flex-shrink-0 text-success-400" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* More */}
      <div className="mt-16">
        <h2 className="section-title text-2xl">More competitions</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((c) => (
            <CompetitionCard key={c.id} comp={c} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="card p-3">
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-gray-500">
        {icon} {label}
      </div>
      <div className="mt-1 font-display text-lg text-white">{value}</div>
    </div>
  );
}
