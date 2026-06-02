import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getPoolUrl(): string {
  const url = process.env.DATABASE_URL || '';
  const params = new URLSearchParams(url.split('?')[1] || '');
  if (!params.has('connection_limit')) params.set('connection_limit', '5');
  if (!params.has('pool_timeout')) params.set('pool_timeout', '30');
  const base = url.split('?')[0];
  return `${base}?${params.toString()}`;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
    datasources: { db: { url: getPoolUrl() } },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

