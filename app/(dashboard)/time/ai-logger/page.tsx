import React from 'react';
import AITimeLogger from '@/components/time/AITimeLogger';
import { getTimeEntries, getDailyMetrics } from '@/app/actions/timeActions';

export default async function AITimeLoggerPage() {
  const today = new Date().toISOString().split('T')[0];
  const [result, metrics] = await Promise.all([
    getTimeEntries({ dateFrom: today, dateTo: today }),
    getDailyMetrics(),
  ]);

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-8 max-w-container-max mx-auto w-full flex-1">
      <AITimeLogger initialEntries={result.entries} metrics={metrics} />
    </div>
  );
}
