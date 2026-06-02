import React from 'react';
import { Plus, Timer, Receipt, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { getMatters } from '@/app/actions/matterActions';
import { FilterForm, SearchInput } from './FilterForm';
import ClickableClientName from '@/components/ui/ClickableClientName';

export const dynamic = 'force-dynamic';

function SortLink({ currentSort, currentDir, label, field }: { currentSort?: string; currentDir?: string; label: string; field: string }) {
  const isActive = currentSort === field;
  const nextDir = isActive && currentDir === 'asc' ? 'desc' : 'asc';
  const params = new URLSearchParams();
  if (currentSort && currentSort !== field) params.set('sortBy', currentSort);
  if (currentDir) params.set('sortDir', currentDir);
  params.set('sortBy', field);
  params.set('sortDir', nextDir);
  return (
    <Link href={`/matters?${params.toString()}`} className={`flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest hover:text-[#0A1128] transition-colors ${isActive ? 'text-[#0A1128]' : 'text-[#7c839f]'}`}>
      {label}
      <ArrowUpDown size={12} className={isActive ? 'text-[#D4AF37]' : ''} />
    </Link>
  );
}

export default async function MattersPage({ searchParams }: { searchParams: Promise<{ search?: string; practiceArea?: string; status?: string; sortBy?: string; sortDir?: string; page?: string; clientId?: string }> }) {
  const { search, practiceArea, status, sortBy, sortDir, page: pageStr, clientId } = await searchParams;
  const page = pageStr ? parseInt(pageStr) : 1;
  const { matters, totalCount, totalPages } = await getMatters({ search, practiceArea, status, sortBy, sortDir, page, clientId });

  function buildHref(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    if (search) p.set('search', search);
    if (practiceArea) p.set('practiceArea', practiceArea);
    if (status) p.set('status', status);
    const s = overrides.sortBy ?? sortBy ?? '';
    if (s) p.set('sortBy', s);
    const d = overrides.sortDir ?? sortDir ?? '';
    if (d) p.set('sortDir', d);
    const pg = overrides.page ?? String(page);
    if (pg !== '1') p.set('page', pg);
    return `/matters?${p.toString()}`;
  }

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-8 md:py-12 max-w-container-max mx-auto w-full">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h2 className="text-[32px] font-headline-md font-bold text-[#0A1128] mb-2 tracking-tight">Matter Management</h2>
          <p className="text-[16px] font-body-md text-[#46464d] max-w-2xl">
            Oversee active cases, track billable progress, and manage critical milestones across all practice areas.
          </p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <SearchInput defaultValue={search || ''} />
          <Link href="/matters/new" className="bg-[#0A1128] text-white font-label-md text-[13px] uppercase px-6 py-2.5 rounded hover:bg-[#162244] transition-colors flex items-center justify-center gap-2 whitespace-nowrap shadow-sm h-full">
            <Plus size={18} />
            New Matter
          </Link>
        </div>
      </header>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Sidebar Filters */}
        <aside className="lg:col-span-3 space-y-6">
          <FilterForm search={search} practiceArea={practiceArea} status={status} />
        </aside>

        {/* Right Column: Matter List */}
        <div className="lg:col-span-9 space-y-6">

          {/* Sort & Count Bar */}
          <div className="flex items-center justify-between bg-white border border-[#c6c6ce]/40 px-5 py-3 rounded-none">
            <div className="flex items-center gap-4">
              <span className="text-[13px] text-[#46464d]">{totalCount} matter{totalCount !== 1 ? 's' : ''}</span>
              <a href="/api/export/matters" download className="flex items-center gap-1 px-3 py-1 border border-[#c6c6ce]/50 text-[#46464d] text-[10px] font-bold uppercase tracking-widest hover:bg-[#f8f9ff] transition-colors">
                CSV
              </a>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#7c839f]">Sort by</span>
              <SortLink currentSort={sortBy} currentDir={sortDir} label="Date" field="createdAt" />
              <SortLink currentSort={sortBy} currentDir={sortDir} label="Title" field="title" />
              <SortLink currentSort={sortBy} currentDir={sortDir} label="Status" field="status" />
            </div>
          </div>

          {matters.map((m) => (
            <article key={m.id} className="bg-white border border-[#c6c6ce]/40 rounded-none hover:shadow-[0_8px_30px_0_rgba(10,17,40,0.06)] transition-all duration-300 relative group overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37] scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300"></div>

              <Link href={`/matters/${encodeURIComponent(m.id)}`} className="block p-6 md:p-8 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] rounded-none">
                <div className="flex flex-col lg:flex-row justify-between gap-8">
                  <div className="flex-1 flex flex-col justify-center space-y-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="px-2.5 py-1 bg-[#eff4ff] border border-[#c6c6ce]/30 text-[#46464d] text-[11px] font-bold uppercase tracking-widest rounded-sm">{m.practiceArea}</span>
                      <span className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest rounded-sm ${
                        m.status === 'Active' ? 'bg-green-50 border border-green-200 text-green-700' :
                        m.status === 'Pending' ? 'bg-amber-50 border border-amber-200 text-amber-700' :
                        'bg-gray-50 border border-gray-200 text-gray-600'
                      }`}>{m.status}</span>
                      <span className="text-[#7c839f] text-[12px] font-medium tracking-wide">ID: {m.matterCode}</span>
                    </div>
                    <div>
                      <h3 className="text-[24px] font-headline-sm font-bold text-[#0A1128] group-hover:text-[#D4AF37] transition-colors inline-block tracking-tight">{m.title}</h3>
                      <p className="text-[15px] font-body-md text-[#46464d] mt-1">Client: {m.clientId ? <ClickableClientName clientId={m.clientId} clientName={m.clientName} /> : <span className="text-[#0A1128] font-semibold">{m.clientName}</span>}</p>
                    </div>

                    <div className="flex items-center gap-4 text-[12px] text-[#76767e]">
                      <span>{m.activityCount} activit{m.activityCount === 1 ? 'y' : 'ies'}</span>
                      <span className="w-px h-3 bg-[#c6c6ce]" />
                      <span>{m.invoiceCount} invoice{m.invoiceCount === 1 ? '' : 's'}</span>
                      {m.totalInvoiced > 0 && (
                        <>
                          <span className="w-px h-3 bg-[#c6c6ce]" />
                          <span>${m.totalInvoiced.toLocaleString()} billed</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="lg:w-64 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-[#c6c6ce]/30 pt-6 lg:pt-0 lg:pl-8">
                    {m.billableTargetHours && (
                      <div>
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-[11px] font-bold text-[#7c839f] uppercase tracking-widest">Billable Target</span>
                          <span className="text-[14px] font-bold text-[#0A1128]">{m.billableTargetHours}h</span>
                        </div>
                        <div className="w-full bg-[#eff4ff] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-[#0A1128] h-full rounded-full" style={{ width: `${Math.min((m.billableTargetHours / 200) * 100, 100)}%` }}></div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-4">
                      <div className="w-11 h-11 bg-[#141a32] flex items-center justify-center rounded shadow-sm border border-[#c6c6ce]/30">
                        <span className="font-headline-sm text-headline-sm text-[#ffe088] font-bold text-[14px]">
                          {m.leadAttorneyName ? m.leadAttorneyName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : 'NA'}
                        </span>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#7c839f] uppercase tracking-widest mb-0.5">Lead Attorney</p>
                        <p className="text-[14px] font-bold text-[#0A1128]">{m.leadAttorneyName ?? '—'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              <div className="px-6 md:px-8 pb-6 flex gap-3 border-t border-[#c6c6ce]/30 pt-4">
                <Link href={`/time/new?matterId=${m.id}`} className="flex items-center gap-1.5 px-4 py-2 bg-[#f8f9ff] border border-[#c6c6ce]/50 text-[#0A1128] text-[11px] font-bold uppercase tracking-wider hover:bg-[#eff4ff] transition-colors">
                  <Timer size={14} /> Log Time
                </Link>
                <Link href={`/billing/new?matterId=${m.id}`} className="flex items-center gap-1.5 px-4 py-2 bg-[#f8f9ff] border border-[#c6c6ce]/50 text-[#0A1128] text-[11px] font-bold uppercase tracking-wider hover:bg-[#eff4ff] transition-colors">
                  <Receipt size={14} /> Invoice
                </Link>
              </div>
            </article>
          ))}

          {matters.length === 0 && (
            <div className="text-[#7c839f] text-[14px]">No matters found.</div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white border border-[#c6c6ce]/40 px-5 py-3 rounded-none">
              <span className="text-[13px] text-[#46464d]">Page {page} of {totalPages}</span>
              <div className="flex items-center gap-2">
                {page > 1 && (
                  <Link href={buildHref({ page: String(page - 1) })} className="flex items-center gap-1 px-3 py-1.5 border border-[#c6c6ce]/50 text-[#0A1128] text-[12px] font-bold uppercase tracking-wider hover:bg-[#f8f9ff] transition-colors">
                    <ChevronLeft size={14} /> Prev
                  </Link>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <Link key={p} href={buildHref({ page: String(p) })}
                    className={`px-3 py-1.5 text-[12px] font-bold transition-colors ${p === page ? 'bg-[#0A1128] text-white' : 'border border-[#c6c6ce]/50 text-[#0A1128] hover:bg-[#f8f9ff]'}`}>
                    {p}
                  </Link>
                ))}
                {page < totalPages && (
                  <Link href={buildHref({ page: String(page + 1) })} className="flex items-center gap-1 px-3 py-1.5 border border-[#c6c6ce]/50 text-[#0A1128] text-[12px] font-bold uppercase tracking-wider hover:bg-[#f8f9ff] transition-colors">
                    Next <ChevronRight size={14} />
                  </Link>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}