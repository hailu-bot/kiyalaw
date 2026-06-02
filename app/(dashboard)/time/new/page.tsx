import React from 'react';
import { prisma } from '@/lib/prisma/client';
import { getCurrentUserId } from '@/lib/supabase/get-current-user';
import NewTimeEntryManual from '@/components/time/NewTimeEntryManual';

export const dynamic = 'force-dynamic';

export default async function NewTimeEntryPage() {
  const userId = await getCurrentUserId();
  const matters = await prisma.matter.findMany({
    where: { userId, status: 'Active' },
    orderBy: { title: 'asc' },
    select: { id: true, title: true, clientName: true, matterCode: true },
  });

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-8 max-w-container-max mx-auto w-full flex-1">
      <NewTimeEntryManual matters={matters} />
    </div>
  );
}
