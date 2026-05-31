import { NextResponse } from 'next/server';
import { getCompetition } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const comp = await getCompetition(params.slug);
  if (!comp) {
    return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
  }
  return NextResponse.json({ competition: comp });
}
