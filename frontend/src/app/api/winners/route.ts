import { NextResponse } from 'next/server';
import { listWinners } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const winners = await listWinners();
  return NextResponse.json({ winners });
}
