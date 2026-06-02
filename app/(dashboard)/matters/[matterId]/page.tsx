import React from 'react';
import { getMatterById } from '@/app/actions/matterActions';
import { User, Building2, Receipt, FileSpreadsheet, Clock, FileText } from 'lucide-react';
import Link from 'next/link';
import MatterTimeline from '@/components/matter/MatterTimeline';
import MatterStatusSelect from '@/components/matter/MatterStatusSelect';

export const dynamic = 'force-dynamic';

export default async function MatterDetailsPage({ params }: { params: Promise<{ matterId: string }> }) {
  const { matterId } = await params;

  const matter = await getMatterById(matterId);

  if (!matter) {
    return <div className="p-8 text-[#46464d]">Matter not found.</div>;
  }

  const totalBillableHours = matter.totalHours;
  const progressPct = matter.billableTargetHours && matter.billableTargetHours > 0
    ? Math.min(Math.round((totalBillableHours / matter.billableTargetHours) * 100), 100)
    : 0;

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-8 md:py-12 max-w-container-max mx-auto w-full">

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-[13px] font-body-md text-[#7c839f] mb-6">
        <Link href="/matters" className="hover:text-[#0A1128] transition-colors">Matters</Link>
        <span>/</span>
        <span className="text-[#0A1128] font-semibold truncate max-w-[300px]">{matter.title}</span>
      </nav>

      {/* 1. Matter Header */}
      <div className="bg-white border border-[#c6c6ce]/40 shadow-[0_2px_10px_0_rgba(10,17,40,0.02)] p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden mb-8 rounded-none">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#D4AF37]"></div>
        
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[12px] font-label-md uppercase tracking-widest text-[#46464d] font-bold">{matter.matterCode}</span>
            <MatterStatusSelect matterId={matterId} currentStatus={matter.status} />
          </div>
          <h1 className="text-[32px] md:text-[40px] font-headline-md font-bold text-[#0A1128] mb-3 tracking-tight leading-none">
            {matter.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[15px] font-body-md text-[#46464d]">
            <p className="flex items-center gap-2">
              <User size={18} className="text-[#7c839f]" />
              Lead Attorney: <span className="font-semibold text-[#0A1128]">{matter.leadAttorneyName ?? '—'}</span>
            </p>
            {matter.client && (
              <p className="flex items-center gap-2">
                <Building2 size={18} className="text-[#7c839f]" />
                Client: <Link href={`/clients/${matter.client.id}`} className="font-semibold text-[#0A1128] hover:text-[#D4AF37] transition-colors underline underline-offset-2">{matter.client.name}</Link>
              </p>
            )}
          </div>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <Link href="/matters/new" className="flex-1 md:flex-none px-6 py-3 border border-[#c6c6ce] text-[#0A1128] font-label-md text-[13px] font-bold uppercase tracking-wider hover:bg-[#f8f9ff] transition-colors rounded">
            New Matter
          </Link>
          <Link href={`/matters/${matterId}/new-activity`} className="flex-1 md:flex-none bg-[#0A1128] text-white text-[13px] font-label-md font-bold uppercase tracking-wider px-6 py-3 hover:bg-[#162244] transition-colors shadow-md rounded">
            New Activity
          </Link>
        </div>
      </div>

      {/* 2. Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link href={`/billing?matterId=${matterId}`} className="bg-white border border-[#c6c6ce]/40 p-5 rounded-none shadow-sm block hover:border-[#D4AF37]/50 transition-colors">
          <div className="flex items-center gap-2 text-[#7c839f] mb-1">
            <FileSpreadsheet size={16} />
            <span className="text-[11px] font-bold uppercase tracking-widest">Invoices</span>
          </div>
          <p className="text-[28px] font-headline-sm font-bold text-[#0A1128]">{matter.invoiceCount}</p>
          <p className="text-[13px] text-[#46464d]">${matter.totalInvoiced.toLocaleString()}</p>
        </Link>
        <Link href={`/time/entries?matterId=${matterId}`} className="bg-white border border-[#c6c6ce]/40 p-5 rounded-none shadow-sm block hover:border-[#D4AF37]/50 transition-colors">
          <div className="flex items-center gap-2 text-[#7c839f] mb-1">
            <Clock size={16} />
            <span className="text-[11px] font-bold uppercase tracking-widest">Time Entries</span>
          </div>
          <p className="text-[28px] font-headline-sm font-bold text-[#0A1128]">{matter.timeEntryCount}</p>
          <p className="text-[13px] text-[#46464d]">{totalBillableHours}h logged</p>
        </Link>
        <div className="bg-white border border-[#c6c6ce]/40 p-5 rounded-none shadow-sm">
          <div className="flex items-center gap-2 text-[#7c839f] mb-1">
            <FileText size={16} />
            <span className="text-[11px] font-bold uppercase tracking-widest">Documents</span>
          </div>
          <p className="text-[28px] font-headline-sm font-bold text-[#0A1128]">{matter.documentCount}</p>
          <Link href={`/documents?matterId=${matterId}`} className="text-[13px] text-[#D4AF37] font-semibold hover:underline">View all</Link>
        </div>
        <div className="bg-white border border-[#c6c6ce]/40 p-5 rounded-none shadow-sm">
          <div className="flex items-center gap-2 text-[#7c839f] mb-1">
            <Receipt size={16} />
            <span className="text-[11px] font-bold uppercase tracking-widest">Activities</span>
          </div>
          <p className="text-[28px] font-headline-sm font-bold text-[#0A1128]">{matter.activityCount}</p>
          <p className="text-[13px] text-[#46464d]">{matter.activities.filter((a) => a.type === 'time').length} time</p>
        </div>
      </div>

      {/* 3. Main Layout Grid */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Filter & Timeline */}
        <div className="flex-1 space-y-8">
          
          <MatterTimeline activities={matter.activities} />
        </div>

        {/* Right Column: Summary Widget */}
        <div className="w-full lg:w-80 space-y-6">
          <div className="bg-[#0A1128] p-8 rounded-none shadow-lg text-white border border-[#162244]">
            <h3 className="text-[12px] font-label-md uppercase tracking-widest text-[#D4AF37] mb-6 font-bold">Matter Summary</h3>
            
            <div className="mb-8">
              <div className="text-[48px] font-headline-md font-bold mb-1 leading-none tracking-tight">{matter.activityCount}</div>
              <div className="text-[11px] font-label-sm uppercase tracking-widest text-[#7c839f] border-b border-[#162244] pb-6 font-semibold">
                Total Activities
              </div>
            </div>
            
            <div className="space-y-5">
              <div className="flex justify-between items-center group">
                <span className="text-[15px] font-body-md text-[#bfc5e4] group-hover:text-white transition-colors">Time Entries</span>
                <span className="text-[13px] font-label-md font-bold text-white bg-[#162244] px-2.5 py-1 rounded-sm">
                  {matter.activities.filter((a) => a.type === 'time').length}
                </span>
              </div>
              <div className="flex justify-between items-center group">
                <span className="text-[15px] font-body-md text-[#bfc5e4] group-hover:text-white transition-colors">Documents</span>
                <span className="text-[13px] font-label-md font-bold text-white bg-[#162244] px-2.5 py-1 rounded-sm">
                  {matter.activities.filter((a) => a.type === 'document').length}
                </span>
              </div>
              <div className="pt-4 border-t border-[#162244]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[15px] font-body-md text-[#bfc5e4]">Billable Progress</span>
                  <span className="text-[13px] font-label-md font-bold text-[#D4AF37]">{progressPct}%</span>
                </div>
                <div className="h-2 bg-[#162244] rounded-full overflow-hidden">
                  <div className="h-full bg-[#D4AF37] rounded-full transition-all" style={{ width: `${progressPct}%` }}></div>
                </div>
                <p className="text-[11px] text-[#7c839f] mt-1.5">{totalBillableHours}h / {matter.billableTargetHours || 0}h</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <Link href={`/time/new?matterId=${matterId}`} className="w-full bg-[#D4AF37] text-[#0A1128] text-[12px] font-bold uppercase tracking-widest px-5 py-3 hover:bg-[#e0c04a] transition-colors text-center">
                Log Time
              </Link>
              <Link href={`/billing/new?matterId=${matterId}`} className="w-full bg-transparent border border-[#D4AF37]/40 text-[#D4AF37] text-[12px] font-bold uppercase tracking-widest px-5 py-3 hover:bg-[#D4AF37]/10 transition-colors text-center">
                Create Invoice
              </Link>
            </div>
          </div>

          {/* Recent Invoices */}
          {matter.recentInvoices.length > 0 && (
            <div className="bg-white border border-[#c6c6ce]/40 p-6 rounded-none shadow-sm">
              <h3 className="text-[12px] font-label-md font-bold uppercase tracking-widest text-[#0A1128] mb-4 flex items-center gap-2">
                <Receipt size={16} className="text-[#D4AF37]" /> Recent Invoices
              </h3>
              <div className="space-y-3">
                {matter.recentInvoices.slice(0, 5).map(inv => (
                  <Link key={inv.id} href={`/billing/${inv.id}`}
                    className="flex justify-between items-center py-2 border-b border-[#c6c6ce]/20 last:border-0 hover:bg-[#f8f9ff] -mx-2 px-2 transition-colors rounded">
                    <div>
                      <p className="text-[13px] font-semibold text-[#0A1128]">{inv.invoiceNumber}</p>
                      <p className={`text-[11px] font-medium uppercase tracking-wider ${
                        inv.status === 'Paid' ? 'text-[#15803d]' : inv.status === 'Draft' ? 'text-[#7c839f]' : 'text-[#92400e]'
                      }`}>{inv.status}</p>
                    </div>
                    <span className="text-[14px] font-bold text-[#0A1128]">${inv.amount.toLocaleString()}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recent Time Entries */}
          {matter.recentTimeEntries.length > 0 && (
            <div className="bg-white border border-[#c6c6ce]/40 p-6 rounded-none shadow-sm">
              <h3 className="text-[12px] font-label-md font-bold uppercase tracking-widest text-[#0A1128] mb-4 flex items-center gap-2">
                <Clock size={16} className="text-[#D4AF37]" /> Recent Time
              </h3>
              <div className="space-y-2">
                {matter.recentTimeEntries.slice(0, 5).map(te => (
                  <Link key={te.id} href={`/time/entries/${te.id}`} className="flex justify-between items-center py-1.5 border-b border-[#c6c6ce]/20 last:border-0 hover:bg-[#f8f9ff] -mx-2 px-2 transition-colors rounded">
                    <p className="text-[13px] text-[#46464d] truncate flex-1">{te.description}</p>
                    <span className="text-[13px] font-semibold text-[#0A1128] ml-3">{te.hours}h</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}