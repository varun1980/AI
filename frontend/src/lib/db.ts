/**
 * Prisma client singleton.
 *
 * Returns `null` when no DATABASE_URL is configured or when the generated
 * client isn't available, allowing the app to fall back to the in-memory
 * seed store. This keeps the project runnable with zero infrastructure
 * while still supporting a real Postgres database in production.
 */
import type { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | null | undefined;
}

export function getPrisma(): PrismaClient | null {
  if (!process.env.DATABASE_URL) return null;
  if (global.__prisma !== undefined) return global.__prisma;

  try {
    // Lazy require so a missing generated client never crashes the seed path.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaClient } = require('@prisma/client');
    global.__prisma = new PrismaClient();
  } catch (err) {
    console.warn('[db] Prisma client unavailable, using seed store.', err);
    global.__prisma = null;
  }
  return global.__prisma;
}

export const isDbEnabled = () => !!process.env.DATABASE_URL;
