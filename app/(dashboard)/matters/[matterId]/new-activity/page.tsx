import React from 'react';
import { prisma } from '@/lib/prisma/client';
import { getCurrentUserId } from '@/lib/supabase/get-current-user';
import NewActivityForm from '@/components/matter/NewActivityForm';

export const dynamic = 'force-dynamic';

export default async function NewActivityPage({ params }: { params: Promise<{ matterId: string }> }) {
  const { matterId } = await params;

  let matterTitle = '';
  try {
    const userId = await getCurrentUserId();
    const matter = await prisma.matter.findFirst({ where: { id: matterId, userId }, select: { title: true } });
    matterTitle = matter?.title ?? '';
  } catch {
    matterTitle = '';
  }

  return <NewActivityForm matterId={matterId} matterTitle={matterTitle} />;
}
