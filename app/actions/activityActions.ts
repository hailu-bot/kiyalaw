'use server';

import { prisma } from '@/lib/prisma/client';
import { revalidatePath } from 'next/cache';
import { ActivityType } from '@prisma/client';
import { getCurrentUserId } from '@/lib/supabase/get-current-user-role';

/** Create a new activity linked to a matter */
export async function createActivity(formData: FormData) {
  const type = String(formData.get('type') ?? '').trim() as ActivityType;
  const description = String(formData.get('description') ?? '').trim();
  const matterId = String(formData.get('matterId') ?? '').trim();

  if (!type || !description || !matterId) {
    return { success: false, message: 'Missing required fields' };
  }

  const userId = await getCurrentUserId();
  await prisma.activity.create({
    data: {
      userId,
      id: `ACT-${Date.now()}`,
      type,
      description,
      matterId,
    },
  });

  revalidatePath(`/matters/${matterId}`);
  return { success: true, message: 'Activity created' };
}

/** List activities for a given matter */
export async function listActivitiesByMatter(matterId: string) {
  const userId = await getCurrentUserId();
  const rows = await prisma.activity.findMany({
    where: { matterId, userId },
    orderBy: { createdAt: 'desc' },
  });
  return rows;
}
