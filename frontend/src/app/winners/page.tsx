import Image from 'next/image';
import type { Metadata } from 'next';
import { formatDistanceToNow } from 'date-fns';
import { FiAward } from 'react-icons/fi';
import { listWinners } from '@/lib/store';

export const metadata: Metadata = {
  title: 'Winners',
  description: 'Meet the real Prize Arena winners who have driven away dream cars and banked tax-free cash.',
};

export const dynamic = 'force-dynamic';

export default async function WinnersPage() {
  const winners = await listWinners();
  return (
    <div className="container-custom py-10">
      <div className="text-center">
        <span className="badge bg-primary-500/15 text-primary-300 ring-1 ring-primary-500/40">
          <FiAward /> Hall of Fame
        </span>
        <h1 className="section-title mt-4">Our Winners</h1>
        <p className="mx-auto mt-3 max-w-xl text-gray-400">
          Every draw is picked live and every prize is paid in full. Here are some of the people whose
          lives changed for the price of a ticket.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {winners.map((w) => (
          <div key={w.id} className="card overflow-hidden">
            <div className="relative aspect-[4/3]">
              <Image src={w.image} alt={w.name} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" />
              <span className="absolute left-3 top-3 badge bg-success-500/20 text-success-400 ring-1 ring-success-500/40">
                Winner
              </span>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl uppercase">{w.name}</h3>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(w.drawnAt), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm text-gray-500">{w.location}</p>
              <p className="mt-2 font-semibold text-primary-400">Won: {w.prize}</p>
              <p className="text-xs text-gray-500">{w.competitionTitle} · Ticket #{w.ticketNumber}</p>
              {w.quote && <p className="mt-3 text-sm italic text-gray-300">“{w.quote}”</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
