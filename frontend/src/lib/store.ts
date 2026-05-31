/**
 * Data-access layer for competitions, winners and orders.
 *
 * Strategy:
 *  - If Prisma + DATABASE_URL are available, read/write Postgres.
 *  - Otherwise use a mutable in-memory copy of the seed data so the demo is
 *    fully interactive (ticket counts go up, instant wins get revealed) within
 *    the lifetime of the server process.
 */
import { competitions as seedCompetitions, winners as seedWinners } from '@/data/competitions';
import type { Competition, Winner, InstantWinPrize } from '@/types';
import { getPrisma } from './db';

// Deep clone so mutations in dev don't pollute the imported seed module.
const memory: Competition[] = JSON.parse(JSON.stringify(seedCompetitions));

export async function listCompetitions(category?: string): Promise<Competition[]> {
  const prisma = getPrisma();
  if (prisma) {
    const rows = await prisma.competition.findMany({
      where: category && category !== 'all' ? { category } : undefined,
      orderBy: [{ featured: 'desc' }, { drawDate: 'asc' }],
    });
    return rows as unknown as Competition[];
  }
  const list = category && category !== 'all' ? memory.filter((c) => c.category === category) : memory;
  return list.slice().sort((a, b) => Number(b.featured) - Number(a.featured));
}

export async function getCompetition(slug: string): Promise<Competition | null> {
  const prisma = getPrisma();
  if (prisma) {
    const row = await prisma.competition.findUnique({ where: { slug } });
    return (row as unknown as Competition) ?? null;
  }
  return memory.find((c) => c.slug === slug) ?? null;
}

export async function getCompetitionById(id: string): Promise<Competition | null> {
  const prisma = getPrisma();
  if (prisma) {
    const row = await prisma.competition.findUnique({ where: { id } });
    return (row as unknown as Competition) ?? null;
  }
  return memory.find((c) => c.id === id) ?? null;
}

export async function listWinners(): Promise<Winner[]> {
  const prisma = getPrisma();
  if (prisma) {
    const rows = await prisma.winner.findMany({ orderBy: { drawnAt: 'desc' } });
    return rows as unknown as Winner[];
  }
  return seedWinners;
}

/**
 * Allocate `quantity` ticket numbers for a competition, incrementing the sold
 * counter. Returns the allocated numbers plus any instant-win prize hit.
 */
export async function allocateTickets(
  competitionId: string,
  quantity: number,
): Promise<{ numbers: number[]; instantWin: InstantWinPrize | null }> {
  const comp = memory.find((c) => c.id === competitionId);
  if (!comp) return { numbers: [], instantWin: null };

  const start = comp.ticketsSold + 1;
  const available = Math.max(0, comp.totalTickets - comp.ticketsSold);
  const take = Math.min(quantity, available);
  const numbers = Array.from({ length: take }, (_, i) => start + i);
  comp.ticketsSold += take;

  // Roughly 1-in-25 chance to trigger an instant win when the comp has any left.
  let instantWin: InstantWinPrize | null = null;
  if (comp.instantWins?.length) {
    const pool = comp.instantWins.filter((p) => p.remaining > 0);
    if (pool.length && Math.random() < 0.04 * take) {
      const prize = pool[Math.floor(Math.random() * pool.length)];
      prize.remaining -= 1;
      instantWin = { ...prize };
    }
  }

  const prisma = getPrisma();
  if (prisma) {
    await prisma.competition.update({
      where: { id: competitionId },
      data: { ticketsSold: { increment: take } },
    });
  }

  return { numbers, instantWin };
}

export const allCategories = ['all', 'cars', 'cash', 'tech', 'lifestyle', 'instant'] as const;
