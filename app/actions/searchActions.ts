'use server';

import { prisma } from '@/lib/prisma/client';
import { getCurrentUserId } from '@/lib/supabase/get-current-user-role';

export type SearchResult = {
  type: 'matter' | 'client' | 'invoice' | 'document';
  id: string;
  label: string;
  subtitle: string;
  href: string;
};

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return [];
  const userId = await getCurrentUserId();
  const q = query.trim();

  const [matters, clients, invoices, documents] = await Promise.all([
    prisma.matter.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { clientName: { contains: q, mode: 'insensitive' } },
          { matterCode: { contains: q, mode: 'insensitive' } },
          { practiceArea: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.client.findMany({
      where: {
        userId,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { contactName: { contains: q, mode: 'insensitive' } },
          { industry: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 5,
      orderBy: { name: 'asc' },
    }),
    prisma.invoice.findMany({
      where: {
        userId,
        OR: [
          { invoiceNumber: { contains: q, mode: 'insensitive' } },
          { clientName: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.document.findMany({
      where: {
        authorId: userId,
        title: { contains: q, mode: 'insensitive' },
      },
      take: 5,
      orderBy: { updatedAt: 'desc' },
    }),
  ]);

  const results: SearchResult[] = [];

  for (const m of matters) {
    results.push({
      type: 'matter',
      id: m.id,
      label: m.title,
      subtitle: `${m.clientName} · ${m.practiceArea} · ${m.matterCode}`,
      href: `/matters/${m.id}`,
    });
  }

  for (const c of clients) {
    results.push({
      type: 'client',
      id: c.id,
      label: c.name,
      subtitle: c.email ?? c.industry ?? '',
      href: `/clients/${c.id}`,
    });
  }

  for (const inv of invoices) {
    results.push({
      type: 'invoice',
      id: inv.id,
      label: `#${inv.invoiceNumber}`,
      subtitle: `${inv.clientName} · $${Number(inv.amount).toFixed(2)}`,
      href: `/billing/${inv.id}`,
    });
  }

  for (const d of documents) {
    results.push({
      type: 'document',
      id: d.id,
      label: d.title,
      subtitle: d.status,
      href: `/documents/${d.id}`,
    });
  }

  return results;
}
