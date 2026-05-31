import Link from 'next/link';
import { FiArrowRight, FiShoppingCart, FiHelpCircle, FiVideo, FiAward, FiZap, FiShield } from 'react-icons/fi';
import { listCompetitions } from '@/lib/store';
import { Hero } from '@/components/home/Hero';
import { CompetitionCard } from '@/components/competition/CompetitionCard';

export default async function HomePage() {
  const comps = await listCompetitions();
  const featured = comps.find((c) => c.featured) ?? comps[0];
  const grid = comps.filter((c) => c.id !== featured.id).slice(0, 6);

  return (
    <div>
      <Hero featured={featured} />

      {/* Trust strip */}
      <section className="border-b border-white/10 bg-ink-900">
        <div className="container-custom grid grid-cols-2 gap-6 py-6 md:grid-cols-4">
          <Trust icon={<FiZap />} title="Instant Wins" text="Win cash at checkout" />
          <Trust icon={<FiVideo />} title="Live Draws" text="Streamed & verifiable" />
          <Trust icon={<FiShield />} title="Low Odds" text="Capped ticket numbers" />
          <Trust icon={<FiAward />} title="Real Winners" text="Paid within 24 hours" />
        </div>
      </section>

      {/* Live competitions */}
      <section className="section">
        <div className="container-custom">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <span className="badge-live"><span className="live-dot" /> Live now</span>
              <h2 className="section-title mt-3">This Week&apos;s Competitions</h2>
            </div>
            <Link href="/competitions" className="hidden items-center gap-1 text-primary-400 hover:text-primary-300 sm:flex">
              View all <FiArrowRight />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {grid.map((comp) => (
              <CompetitionCard key={comp.id} comp={comp} />
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link href="/competitions" className="btn-outline">View all competitions</Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section border-t border-white/10 bg-ink-900">
        <div className="container-custom">
          <h2 className="section-title text-center">How It Works</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-gray-400">
            Three steps between you and your dream prize.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Step n={1} icon={<FiShoppingCart />} title="Pick your tickets" text="Choose a competition and how many tickets you want — from just 49p each." />
            <Step n={2} icon={<FiHelpCircle />} title="Answer the question" text="Answer a simple skill-based question correctly to secure your entry." />
            <Step n={3} icon={<FiAward />} title="Watch the live draw" text="Winners are picked live and verifiably, then paid within 24 hours." />
          </div>
          <div className="mt-10 text-center">
            <Link href="/how-it-works" className="btn-ghost">Learn more</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Trust({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg bg-primary-500/15 text-primary-400">
        {icon}
      </span>
      <div>
        <div className="text-sm font-semibold text-white">{title}</div>
        <div className="text-xs text-gray-500">{text}</div>
      </div>
    </div>
  );
}

function Step({ n, icon, title, text }: { n: number; icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="card card-hover relative p-6">
      <span className="absolute right-5 top-4 font-display text-5xl text-white/5">{n}</span>
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary-500/15 text-2xl text-primary-400">
        {icon}
      </span>
      <h3 className="mt-4 font-display text-xl uppercase">{title}</h3>
      <p className="mt-2 text-sm text-gray-400">{text}</p>
    </div>
  );
}
