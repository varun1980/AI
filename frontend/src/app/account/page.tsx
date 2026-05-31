import Link from 'next/link';
import type { Metadata } from 'next';
import { FiTag, FiAward, FiCreditCard, FiSettings } from 'react-icons/fi';
import { listCompetitions } from '@/lib/store';
import { Countdown } from '@/components/ui/Countdown';

export const metadata: Metadata = { title: 'My Account' };
export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  // Demo: pretend the signed-in user holds a few active entries.
  const comps = await listCompetitions();
  const entries = comps.slice(0, 2).map((c, i) => ({ comp: c, tickets: i === 0 ? 10 : 5 }));

  return (
    <div className="container-custom py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="section-title">My Account</h1>
          <p className="mt-1 text-gray-400">Welcome back — here are your active entries.</p>
        </div>
        <Link href="/competitions" className="btn-primary">Enter a competition</Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard icon={<FiTag />} label="Active tickets" value="15" />
        <StatCard icon={<FiAward />} label="Prizes won" value="1" />
        <StatCard icon={<FiCreditCard />} label="Site credit" value="£25.00" />
      </div>

      <h2 className="mt-10 font-display text-2xl uppercase">Active entries</h2>
      <div className="mt-4 space-y-4">
        {entries.map(({ comp, tickets }) => (
          <Link
            key={comp.id}
            href={`/competitions/${comp.slug}`}
            className="card card-hover flex items-center justify-between gap-4 p-4"
          >
            <div>
              <div className="font-semibold">{comp.title}</div>
              <div className="text-sm text-gray-400">{tickets} tickets held</div>
            </div>
            <div className="text-right">
              <Countdown to={comp.drawDate} compact />
              <div className="text-xs text-gray-500">until draw</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 card flex items-center gap-3 p-5 text-sm text-gray-400">
        <FiSettings className="text-primary-400" />
        This is a demonstration account. Wire up the auth module in the backend to enable real
        sign-in, saved cards and entry history.
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className="text-primary-400">{icon}</span> {label}
      </div>
      <div className="mt-2 font-display text-3xl text-white">{value}</div>
    </div>
  );
}
