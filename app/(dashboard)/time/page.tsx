import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma/client';
import { getCurrentUserId } from '@/lib/supabase/get-current-user';
import { PlusCircle, CalendarDays, Search, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import QuickTimeEntryForm from '../../../components/time/QuickTimeEntryForm';
import { getTimeEntries } from '@/app/actions/timeActions';

export const dynamic = 'force-dynamic';

export default async function TimePage({ searchParams }: { searchParams: Promise<{ search?: string; matterId?: string; dateFrom?: string; dateTo?: string; sortBy?: string; sortDir?: string; page?: string }> }) {
  const searchParamsResolved = await searchParams;
  const { search, matterId, dateFrom, dateTo, sortBy, sortDir, page: pageStr } = searchParamsResolved;
  const page = pageStr ? parseInt(pageStr) : 1;

  const userId = await getCurrentUserId();
  const matters = await prisma.matter.findMany({
    where: { userId },
    orderBy: { title: 'asc' },
  });

  const clientGroups = Array.from(
    new Set(matters.map((m) => m.clientName))
  )
    .sort()
    .map((client) => ({
      client,
      matters: matters.filter((m) => m.clientName === client),
    }));

  const result = await getTimeEntries({ search, matterId, dateFrom, dateTo, sortBy, sortDir, page });
  const { entries: recentEntries, totalCount, totalPages } = result;

  function buildHref(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    if (search) p.set('search', search);
    if (matterId) p.set('matterId', matterId);
    if (dateFrom) p.set('dateFrom', dateFrom);
    if (dateTo) p.set('dateTo', dateTo);
    if ((overrides.sortBy ?? sortBy ?? '')) p.set('sortBy', overrides.sortBy ?? sortBy ?? '');
    if ((overrides.sortDir ?? sortDir ?? '')) p.set('sortDir', overrides.sortDir ?? sortDir ?? '');
    const pg = overrides.page ?? String(page);
    if (pg !== '1') p.set('page', pg);
    return `/time?${p.toString()}`;
  }

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-8 max-w-container-max mx-auto w-full flex-1">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-headline-sm font-headline-sm text-on-background">Time Tracking</h1>
        <div className="flex gap-4">
          <Link href="/time/daily" className="flex items-center gap-2 px-4 py-2.5 border border-[#c6c6ce] text-[#0A1128] font-label-md text-[13px] font-bold uppercase tracking-wider hover:bg-[#f8f9ff] transition-colors">
            <CalendarDays size={18} />
            Daily Log
          </Link>
          <Link href="/time/new" className="flex items-center gap-2 px-4 py-2.5 bg-[#0A1128] text-white font-label-md text-[13px] font-bold uppercase tracking-wider hover:bg-[#162244] transition-colors shadow-sm">
            <PlusCircle size={18} />
            Manual Entry
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <div className="lg:col-span-1">
          <div className="bg-surface border border-outline-variant rounded-none p-6">
            <h2 className="text-[20px] font-headline-sm text-on-background mb-4">Log Time</h2>
            <QuickTimeEntryForm clientGroups={clientGroups} />
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <div className="bg-surface border border-outline-variant rounded-none p-6">
            <h2 className="text-[20px] font-headline-sm text-on-background mb-4">Recent Entries</h2>

            {/* Filters */}
            <form method="GET" action="/time" className="flex flex-wrap gap-3 mb-6 pb-6 border-b border-[#c6c6ce]/30">
              <div className="relative flex-1 min-w-[180px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7c839f]" />
                <input name="search" defaultValue={search ?? ''} placeholder="Search entries..."
                  className="w-full pl-9 pr-3 py-2 border border-[#c6c6ce]/50 text-[13px] font-body-md outline-none focus:border-[#D4AF37] transition-colors" />
              </div>
              <select name="matterId" defaultValue={matterId ?? ''}
                className="border border-[#c6c6ce]/50 py-2 px-3 text-[13px] font-body-md outline-none focus:border-[#D4AF37]">
                <option value="">All Matters</option>
                {matters.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
              <input name="dateFrom" type="date" defaultValue={dateFrom ?? ''}
                className="border border-[#c6c6ce]/50 py-2 px-3 text-[13px] font-body-md outline-none focus:border-[#D4AF37]" />
              <input name="dateTo" type="date" defaultValue={dateTo ?? ''}
                className="border border-[#c6c6ce]/50 py-2 px-3 text-[13px] font-body-md outline-none focus:border-[#D4AF37]" />
              <a href="/api/export/time" download className="flex items-center gap-1 px-3 py-2 border border-[#c6c6ce]/50 text-[#46464d] text-[10px] font-bold uppercase tracking-widest hover:bg-[#f8f9ff] transition-colors whitespace-nowrap">
                CSV
              </a>
              <button type="submit" className="px-4 py-2 bg-[#0A1128] text-white text-[11px] font-bold uppercase tracking-wider hover:bg-[#162244] transition-colors">Filter</button>
              {(search || matterId || dateFrom || dateTo) && (
                <Link href="/time" className="flex items-center px-3 py-2 border border-[#c6c6ce]/50 text-[#46464d] text-[11px] font-bold uppercase tracking-wider hover:bg-[#f8f9ff] transition-colors">Clear</Link>
              )}
            </form>

            {/* Sort bar */}
            <div className="flex items-center gap-4 mb-4 text-[11px] font-bold uppercase tracking-widest text-[#7c839f]">
              <span>Sort:</span>
              {[{ field: 'date', label: 'Date' }, { field: 'description', label: 'Description' }, { field: 'hours', label: 'Hours' }].map(s => {
                const isActive = sortBy === s.field || (!sortBy && s.field === 'date');
                const nextDir = isActive && sortDir === 'asc' ? 'desc' : 'asc';
                return (
                  <Link key={s.field} href={buildHref({ sortBy: s.field, sortDir: nextDir, page: '1' })}
                    className={`flex items-center gap-1 hover:text-[#0A1128] transition-colors ${isActive ? 'text-[#0A1128]' : ''}`}>
                    {s.label} <ArrowUpDown size={11} className={isActive ? 'text-[#D4AF37]' : ''} />
                  </Link>
                );
              })}
            </div>

            <div className="space-y-3">
              {recentEntries.length === 0 && (
                <p className="text-surface-variant">No time entries found.</p>
              )}
              {recentEntries.map(entry => (
                <Link key={entry.id} href={`/time/entries/${entry.id}`} className="flex items-center justify-between p-3 bg-surface-bright border border-outline-variant rounded-none hover:bg-surface-container-low transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-on-background font-semibold truncate">{entry.description}</p>
                    <p className="text-surface-variant text-sm truncate">{entry.matter.clientName} - {entry.matter.title}</p>
                    <p className="text-[11px] text-[#7c839f] mt-0.5">{entry.attorneyName ? `${entry.attorneyName} · ` : ''}{entry.category || 'General'}{entry.billable ? ' · Billable' : ' · Non-billable'}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-on-background font-bold">{entry.hours}h</p>
                    <p className="text-surface-variant text-sm">
                      {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#c6c6ce]/30">
                <span className="text-[13px] text-[#46464d]">Page {page} of {totalPages} ({totalCount} entries)</span>
                <div className="flex items-center gap-2">
                  {page > 1 && (
                    <Link href={buildHref({ page: String(page - 1) })} className="flex items-center gap-1 px-3 py-1.5 border border-[#c6c6ce]/50 text-[#0A1128] text-[11px] font-bold uppercase tracking-wider hover:bg-[#f8f9ff] transition-colors">
                      <ChevronLeft size={14} /> Prev
                    </Link>
                  )}
                  {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(p => (
                    <Link key={p} href={buildHref({ page: String(p) })}
                      className={`w-8 h-8 flex items-center justify-center text-[12px] font-bold transition-colors ${p === page ? 'bg-[#0A1128] text-white' : 'border border-[#c6c6ce]/50 text-[#0A1128] hover:bg-[#f8f9ff]'}`}>
                      {p}
                    </Link>
                  ))}
                  {page < totalPages && (
                    <Link href={buildHref({ page: String(page + 1) })} className="flex items-center gap-1 px-3 py-1.5 border border-[#c6c6ce]/50 text-[#0A1128] text-[11px] font-bold uppercase tracking-wider hover:bg-[#f8f9ff] transition-colors">
                      Next <ChevronRight size={14} />
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
