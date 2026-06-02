import React from 'react';
import DailyTimeLogBreakdown from '@/components/time/DailyTimeLogBreakdown';
import { getTimeEntries, getDailyMetrics } from '@/app/actions/timeActions';

export default async function DailyTimeLogPage() {
  const [result, metrics] = await Promise.all([
    getTimeEntries(),
    getDailyMetrics(),
  ]);
  const entries = result.entries;

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-8 max-w-container-max mx-auto w-full flex-1">
      <DailyTimeLogBreakdown entries={entries} metrics={metrics} />
    </div>
  );
}
