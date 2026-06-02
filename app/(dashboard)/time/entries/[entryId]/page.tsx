import React from 'react';
import TimeEntryDetail from '@/components/time/TimeEntryDetail';
import { getTimeEntryById } from '@/app/actions/timeActions';

export default async function TimeEntryDetailPage({ params }: { params: Promise<{ entryId: string }> }) {
  const { entryId } = await params;
  const entry = await getTimeEntryById(entryId);

  if (!entry) {
    return (
      <div className="px-margin-mobile md:px-margin-desktop py-8 max-w-container-max mx-auto w-full flex-1">
        <div className="text-center py-20">
          <h2 className="font-headline-sm text-[28px] font-bold text-[#0A1128] mb-4">Time Entry Not Found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-8 max-w-container-max mx-auto w-full flex-1">
      <TimeEntryDetail entry={entry} />
    </div>
  );
}
