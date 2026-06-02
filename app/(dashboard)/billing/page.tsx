import React from 'react';
import Link from 'next/link';
import { PlusCircle, TrendingUp, Search, ArrowUpDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import RecentInvoicesTable from '../../../components/invoice/RecentInvoicesTable';
import { getBillingMetrics, getInvoices } from '@/app/actions/billingActions';

export const dynamic = 'force-dynamic';

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ search?: string; status?: string; sortBy?: string; sortDir?: string; page?: string; clientId?: string }> }) {
  const { search, status, sortBy, sortDir, page: pageStr, clientId } = await searchParams;
  const page = pageStr ? parseInt(pageStr) : 1;
  const metrics = await getBillingMetrics();
  const { invoices, totalCount, totalPages } = await getInvoices({ search, status, sortBy, sortDir, page, clientId });

  function buildHref(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    if (search) p.set('search', search);
    if (status) p.set('status', status ?? 'Draft,PendingApproval');
    if ((overrides.sortBy ?? sortBy ?? '')) p.set('sortBy', overrides.sortBy ?? sortBy ?? '');
    if ((overrides.sortDir ?? sortDir ?? '')) p.set('sortDir', overrides.sortDir ?? sortDir ?? '');
    const pg = overrides.page ?? String(page);
    if (pg !== '1') p.set('page', pg);
    return `/billing?${p.toString()}`;
  }

  const statusOptions = [
    { value: 'Draft', label: 'Draft' },
    { value: 'PendingApproval', label: 'Pending' },
    { value: 'Finalized', label: 'Finalized' },
    { value: 'Paid', label: 'Paid' },
  ];

  const selectedStatuses = status ? status.split(',') : ['Draft', 'PendingApproval'];

  return (
    <div className="px-6 md:px-12 py-8 md:py-12 max-w-[1200px] mx-auto w-full flex-1 flex flex-col gap-12">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="font-headline-lg">Billing & Invoices</h2>
          <p className="font-body-md text-[16px] text-[#46464d] max-w-2xl leading-relaxed">
            Manage client accounts, review outstanding balances, and generate new financial documents with precision.
          </p>
        </div>
        
        <Link 
          href="/billing/new" 
          className="bg-[#0A1128] text-white font-label-md text-[13px] py-3.5 px-6 rounded-none hover:bg-[#162244] transition-colors uppercase tracking-widest font-bold flex items-center gap-2 shadow-md w-full md:w-auto justify-center"
        >
          <PlusCircle size={18} />
          Create New Invoice
        </Link>
      </div>

      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#0A1128] text-white rounded-none p-8 md:p-10 border border-[#162244] shadow-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4AF37]/5 rounded-bl-full -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-110"></div>
          <div className="flex flex-col gap-2 relative z-10 h-full justify-center">
            <span className="font-label-md text-[13px] text-[#7c839f] uppercase tracking-widest font-bold">Total Outstanding Balance</span>
            <span className="font-headline-lg text-white">
              ${metrics.outstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <div className="flex items-center gap-2 mt-6 text-[#D4AF37]">
              <TrendingUp size={18} />
              <span className="font-label-sm text-[13px] font-bold tracking-wider">+12.4% from last quarter</span>
            </div>
          </div>
        </div>
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white rounded-none p-8 border border-[#c6c6ce]/40 shadow-sm flex-1 flex flex-col justify-center">
            <span className="font-label-sm text-[12px] text-[#7c839f] uppercase tracking-widest font-bold">Total Billed (YTD)</span>
            <span className="font-headline-md">${metrics.ytdTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="bg-white rounded-none p-8 border border-[#c6c6ce]/40 shadow-sm flex-1 flex flex-col justify-center">
            <span className="font-label-sm text-[12px] text-[#7c839f] uppercase tracking-widest font-bold">Average Days to Pay</span>
            <span className="font-headline-md">{metrics.avgDaysToPay} Days</span>
          </div>
        </div>
      </div>

      {/* Invoices Section */}
      <div className="flex flex-col gap-4 bg-white border border-[#c6c6ce]/40 shadow-sm rounded-none p-6 md:p-8">

        {/* Header + Filter/Sort */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-[#c6c6ce]/40 gap-4">
          <h3 className="font-headline-md">Invoices</h3>
          <div className="flex flex-wrap items-center gap-3">
            {/* Status filter toggles */}
            <div className="flex items-center gap-1.5">
              {statusOptions.map(opt => {
                const isOn = selectedStatuses.includes(opt.value);
                const nextStatuses = isOn
                  ? selectedStatuses.filter(s => s !== opt.value)
                  : [...selectedStatuses, opt.value];
                const href = nextStatuses.length > 0 ? buildHref({ status: nextStatuses.join(','), page: '1' }) : buildHref({ status: undefined, page: '1' });
                return (
                  <Link key={opt.value} href={href}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border transition-colors ${isOn ? 'bg-[#0A1128] text-white border-[#0A1128]' : 'bg-white text-[#46464d] border-[#c6c6ce]/50 hover:bg-[#f8f9ff]'}`}>
                    {opt.label}
                  </Link>
                );
              })}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-[#c6c6ce]/40">
              {[{ field: 'createdAt', label: 'Date' }, { field: 'amount', label: 'Amount' }, { field: 'status', label: 'Status' }].map(s => {
                const isActive = sortBy === s.field || (!sortBy && s.field === 'createdAt');
                const nextDir = isActive && sortDir === 'asc' ? 'desc' : 'asc';
                return (
                  <Link key={s.field} href={buildHref({ sortBy: s.field, sortDir: nextDir, page: '1' })}
                    className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest transition-colors ${isActive ? 'text-[#0A1128]' : 'text-[#7c839f] hover:text-[#0A1128]'}`}>
                    {s.label} <ArrowUpDown size={11} className={isActive ? 'text-[#D4AF37]' : ''} />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Search */}
        <form method="GET" action="/billing" className="flex gap-3">
          <a href="/api/export/invoices" download className="flex items-center gap-1 px-3 py-2 border border-[#c6c6ce]/50 text-[#46464d] text-[10px] font-bold uppercase tracking-widest hover:bg-[#f8f9ff] transition-colors">
            CSV
          </a>
          {(search || status) && (
            <Link href="/billing" className="flex items-center gap-1 px-3 py-2 border border-[#c6c6ce]/50 text-[#46464d] text-[11px] font-bold uppercase tracking-wider hover:bg-[#f8f9ff] transition-colors">
              <X size={14} /> Clear
            </Link>
          )}
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7c839f]" />
            <input name="search" defaultValue={search ?? ''} placeholder="Search by client..."
              className="w-full pl-9 pr-3 py-2 border border-[#c6c6ce]/50 text-[13px] font-body-md outline-none focus:border-[#D4AF37] transition-colors" />
          </div>
          <button type="submit" className="px-4 py-2 bg-[#0A1128] text-white text-[11px] font-bold uppercase tracking-wider hover:bg-[#162244] transition-colors">Search</button>
        </form>

        {/* Table */}
        <RecentInvoicesTable invoices={invoices} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center pt-6 border-t border-[#c6c6ce]/40">
            <span className="font-body-md text-[14px] text-[#7c839f] font-medium">
              Page {page} of {totalPages} ({totalCount} invoice{totalCount !== 1 ? 's' : ''})
            </span>
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Link href={buildHref({ page: String(page - 1) })} className="flex items-center gap-1 px-3 py-1.5 border border-[#c6c6ce]/50 text-[#0A1128] text-[11px] font-bold uppercase tracking-wider hover:bg-[#f8f9ff] transition-colors">
                  <ChevronLeft size={14} /> Prev
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
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
  );
}
