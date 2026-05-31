import { NextResponse } from 'next/server';
import { listCompetitions } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') ?? undefined;
  const data = await listCompetitions(category || undefined);
  return NextResponse.json({ competitions: data });
}
