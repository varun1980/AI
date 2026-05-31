import type { Metadata } from 'next';
import { listCompetitions } from '@/lib/store';
import { formatGBP, pct } from '@/lib/utils';

export const metadata: Metadata = { title: 'Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const comps = await listCompetitions();
  const revenue = comps.reduce((sum, c) => sum + c.ticketsSold * c.ticketPrice, 0);
  const sold = comps.reduce((sum, c) => sum + c.ticketsSold, 0);

  return (
    <div className="container-custom py-10">
      <h1 className="section-title">Admin Dashboard</h1>
      <p className="mt-1 text-gray-400">Live overview of every competition.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Kpi label="Gross revenue" value={formatGBP(revenue)} />
        <Kpi label="Tickets sold" value={sold.toLocaleString()} />
        <Kpi label="Active competitions" value={String(comps.length)} />
      </div>

      <div className="mt-8 card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 text-gray-400">
            <tr>
              <th className="p-4">Competition</th>
              <th className="p-4">Price</th>
              <th className="p-4">Sold</th>
              <th className="p-4">% Sold</th>
              <th className="p-4">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {comps.map((c) => (
              <tr key={c.id} className="border-b border-white/5">
                <td className="p-4 font-medium">{c.title}</td>
                <td className="p-4 text-gray-300">{formatGBP(c.ticketPrice)}</td>
                <td className="p-4 text-gray-300">
                  {c.ticketsSold.toLocaleString()} / {c.totalTickets.toLocaleString()}
                </td>
                <td className="p-4">
                  <span className="text-primary-300">{pct(c.ticketsSold, c.totalTickets)}%</span>
                </td>
                <td className="p-4 text-success-400">{formatGBP(c.ticketsSold * c.ticketPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-sm text-gray-500">
        Demo dashboard. Connect the admin module and Postgres to manage competitions, draws and
        payouts for real.
      </p>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-5">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-1 font-display text-3xl text-white">{value}</div>
    </div>
  );
}
