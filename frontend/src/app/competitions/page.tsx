import { Suspense } from 'react';
import type { Metadata } from 'next';
import { listCompetitions } from '@/lib/store';
import { CompetitionCard } from '@/components/competition/CompetitionCard';
import { CategoryFilter } from '@/components/competition/CategoryFilter';

export const metadata: Metadata = {
  title: 'All Competitions',
  description: 'Browse every live Prize Arena competition — cars, cash, tech, lifestyle and instant wins.',
};

export const dynamic = 'force-dynamic';

export default async function CompetitionsPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const category = searchParams.category;
  const comps = await listCompetitions(category);

  return (
    <div className="container-custom py-10">
      <h1 className="section-title">Competitions</h1>
      <p className="mt-2 text-gray-400">
        {comps.length} live {comps.length === 1 ? 'draw' : 'draws'} — pick yours and enter from 49p.
      </p>

      <div className="my-6">
        <Suspense fallback={<div className="h-10" />}>
          <CategoryFilter />
        </Suspense>
      </div>

      {comps.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          No competitions in this category right now. Check back soon!
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {comps.map((comp) => (
            <CompetitionCard key={comp.id} comp={comp} />
          ))}
        </div>
      )}
    </div>
  );
}
