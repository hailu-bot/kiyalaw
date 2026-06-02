'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma/client';
import { Prisma } from '@prisma/client';
import { getCurrentUserId, requireRole } from '@/lib/supabase/get-current-user-role';

export async function getRateCards() {
  const userId = await getCurrentUserId();
  const rows = await prisma.rateCard.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      client: { select: { name: true } },
      matter: { select: { title: true } },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    clientId: r.clientId,
    matterId: r.matterId,
    clientName: r.client?.name ?? null,
    matterTitle: r.matter?.title ?? null,
    rate: Number(r.rate),
    label: r.label,
    effectiveFrom: r.effectiveFrom instanceof Date ? r.effectiveFrom.toISOString() : null,
    effectiveTo: r.effectiveTo instanceof Date ? r.effectiveTo.toISOString() : null,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
  }));
}

export async function createRateCard(data: {
  clientId?: string;
  matterId?: string;
  rate: number;
  label?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
}) {
  if (!await requireRole('PARTNER')) return { success: false as const, message: 'Forbidden' };
  const userId = await getCurrentUserId();

  if (!data.rate || data.rate <= 0) {
    return { success: false as const, message: 'Rate must be a positive number.' };
  }

  try {
    await prisma.rateCard.create({
      data: {
        userId,
        clientId: data.clientId || null,
        matterId: data.matterId || null,
        rate: new Prisma.Decimal(data.rate),
        label: data.label || null,
        effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom) : null,
        effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : null,
      },
    });

    revalidatePath('/settings');
    return { success: true as const, message: 'Rate card created.' };
  } catch (error) {
    console.error('Failed to create rate card:', error);
    return { success: false as const, message: 'Failed to create rate card.' };
  }
}

export async function deleteRateCard(id: string) {
  if (!await requireRole('PARTNER')) return { success: false as const, message: 'Forbidden' };
  try {
    const userId = await getCurrentUserId();
    const card = await prisma.rateCard.findFirst({ where: { id, userId } });
    if (!card) return { success: false as const, message: 'Rate card not found.' };

    await prisma.rateCard.delete({ where: { id } });
    revalidatePath('/settings');
    return { success: true as const, message: 'Rate card deleted.' };
  } catch {
    return { success: false as const, message: 'Failed to delete rate card.' };
  }
}

export async function getEffectiveRate(matterId?: string, clientId?: string): Promise<number> {
  const userId = await getCurrentUserId();

  if (matterId) {
    const matterRate = await prisma.rateCard.findFirst({
      where: { userId, matterId },
      orderBy: { createdAt: 'desc' },
    });
    if (matterRate) return Number(matterRate.rate);
  }

  const resolvedClientId = clientId || (matterId
    ? (await prisma.matter.findUnique({ where: { id: matterId }, select: { clientId: true } }))?.clientId
    : null);

  if (resolvedClientId) {
    const clientRate = await prisma.rateCard.findFirst({
      where: { userId, clientId: resolvedClientId },
      orderBy: { createdAt: 'desc' },
    });
    if (clientRate) return Number(clientRate.rate);
  }

  const firmProfile = await prisma.firmProfile.findFirst({ orderBy: { createdAt: 'asc' } });
  return firmProfile?.defaultRate ?? 350;
}
