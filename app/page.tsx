import React, { Suspense } from 'react';
import Link from 'next/link';
import { Clock, ClipboardList, Receipt, Plus, Timer, Users, Loader2, TrendingUp, Activity, Sparkles } from 'lucide-react';
import { prisma } from '../lib/prisma/client';
import { getCurrentUserId } from '../lib/supabase/get-current-user';
import DashboardAIInsights from '../components/dashboard/DashboardAIInsights';
import DraftQueueApproveButton from '../components/invoice/DraftQueueApproveButton';
import RunBillingButton from '../components/dashboard/RunBillingButton';
import AutoBillingTrigger from '../components/dashboard/AutoBillingTrigger';
import { getPendingAutoInvoices } from '../app/actions/billingActions';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let allInvoices: { amount: unknown; status: string }[] = [];
  let draftCount = 0;
  let pendingCount = 0;
  let activeMatters = 0;
  let todayHours = 0;
  let recentActivities: { id: string; type: string; description: string; createdAt: Date; matterId: string; matter?: { title: string } }[] = [];
  let pendingAutoInvoices: Array<{ id: string; invoiceNumber: string; clientName: string; matterTitle: string; amount: number; billingPeriodStart: string | null; billingPeriodEnd: string | null; createdAt: string }> = [];

  try {
    const userId = await getCurrentUserId();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    pendingAutoInvoices = await getPendingAutoInvoices();

    [allInvoices, draftCount, pendingCount, activeMatters, todayHours, recentActivities] = await Promise.all([
      prisma.invoice.findMany({ where: { userId }, select: { amount: true, status: true } }),
      prisma.invoice.count({ where: { userId, status: 'Draft' } }),
      prisma.invoice.count({ where: { userId, status: 'PendingApproval' } }),
      prisma.matter.count({ where: { userId, status: 'Active' } }),
      prisma.timeEntry.aggregate({
        where: { userId, date: { gte: todayStart } },
        _sum: { hours: true },
      }).then(r => Number(r._sum.hours ?? 0)),
      prisma.activity.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: { matter: { select: { title: true } } },
      }),
    ]);
  } catch {
    // DB unreachable during local dev — fall back to zeros
  }

  const outstandingAmount = allInvoices
    .filter((inv) => inv.status === 'Draft' || inv.status === 'PendingApproval')
    .reduce((sum, inv) => sum + Number(inv.amount), 0);

  const attentionCount = draftCount + pendingCount;

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-8 max-w-container-max mx-auto w-full flex-1 relative">
      <AutoBillingTrigger />

      {/* Quick Action Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-8 pb-6 border-b border-[#c6c6ce]/20">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#7c839f] mr-2">Quick Actions</span>
        <Link href="/matters/new" className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0A1128] text-white text-[11px] font-bold uppercase tracking-wider hover:bg-[#162244] transition-colors rounded-none">
          <Plus size={14} /> New Matter
        </Link>
        <Link href="/time/new" className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#c6c6ce]/50 text-[#0A1128] text-[11px] font-bold uppercase tracking-wider hover:bg-[#f8f9ff] transition-colors rounded-none">
          <Timer size={14} /> Log Time
        </Link>
        <Link href="/billing/new" className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#c6c6ce]/50 text-[#0A1128] text-[11px] font-bold uppercase tracking-wider hover:bg-[#f8f9ff] transition-colors rounded-none">
          <Receipt size={14} /> New Invoice
        </Link>
        <Link href="/clients" className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#c6c6ce]/50 text-[#0A1128] text-[11px] font-bold uppercase tracking-wider hover:bg-[#f8f9ff] transition-colors rounded-none">
          <Users size={14} /> Add Client
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter mb-8">
        <Link href="/matters" className="bg-white border border-outline-variant rounded-none p-6 shadow-[0_2px_10px_0_rgba(10,17,40,0.03)] hover:shadow-[0_8px_30px_0_rgba(10,17,40,0.08)] transition-all duration-300 block group">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Active Matters</h3>
            <Clock className="text-secondary group-hover:scale-110 transition-transform" size={20} />
          </div>
          <p className="text-headline-md font-headline-md text-on-background">{activeMatters}</p>
        </Link>

        <Link href="/billing/approvals" className="bg-[#0A1128] text-white border-[#D4AF37] border-[1px] rounded-none p-6 shadow-[0_10px_30px_-10px_rgba(10,17,40,0.15)] relative overflow-hidden group block">
          <div className="absolute inset-0 opacity-5 bg-[url('/patterns/linen.png')] group-hover:opacity-10 transition-opacity"></div>
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#D4AF37] opacity-10 rounded-full blur-xl"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="text-label-sm font-label-sm text-[#7c839f] uppercase tracking-wider">Awaiting Approval</h3>
            <ClipboardList className="text-secondary-fixed" size={20} />
          </div>
          <p className="text-headline-md font-headline-md text-white relative z-10">{attentionCount}</p>
          <p className="text-[11px] text-[#7c839f] mt-1 relative z-10">{draftCount} draft · {pendingCount} pending</p>
        </Link>

        <Link href="/billing" className="bg-white border border-outline-variant rounded-none p-6 shadow-[0_2px_10px_0_rgba(10,17,40,0.03)] hover:shadow-[0_8px_30px_0_rgba(10,17,40,0.08)] transition-all duration-300 block group">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Outstanding</h3>
            <Receipt className="text-error group-hover:scale-110 transition-transform" size={20} />
          </div>
          <p className="text-headline-md font-headline-md text-on-background">${outstandingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </Link>

        <Link href="/time/daily" className="bg-white border border-outline-variant rounded-none p-6 shadow-[0_2px_10px_0_rgba(10,17,40,0.03)] hover:shadow-[0_8px_30px_0_rgba(10,17,40,0.08)] transition-all duration-300 block group">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Today&apos;s Hours</h3>
            <Timer className="text-[#D4AF37] group-hover:scale-110 transition-transform" size={20} />
          </div>
          <p className="text-headline-md font-headline-md text-on-background">{todayHours.toFixed(1)}</p>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="flex flex-wrap items-center gap-4 mb-8 px-1">
        <div className="flex items-center gap-1.5 text-[11px] text-[#46464d]">
          <TrendingUp size={14} className="text-[#D4AF37]" />
          <span>{attentionCount > 0 ? `${attentionCount} item${attentionCount > 1 ? 's' : ''} need${attentionCount === 1 ? 's' : ''} attention` : 'All caught up'}</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="lg:col-span-7 space-y-6">
          {/* Unified Approval Queue */}
          <div className="bg-white border border-outline-variant rounded-none p-6 shadow-[0_2px_10px_0_rgba(10,17,40,0.03)]">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-outline-variant/30">
              <h2 className="text-[24px] font-headline-sm text-on-background font-semibold">Approval Queue</h2>
              <Link href="/billing/approvals" className="text-label-sm font-label-sm text-secondary hover:underline font-semibold transition">View All</Link>
            </div>
            <DraftQueueSection />
          </div>

          {/* Pending Auto-Billing */}
          {pendingAutoInvoices.length > 0 && (
            <div className="bg-white border border-outline-variant rounded-none p-6 shadow-[0_2px_10px_0_rgba(10,17,40,0.03)]">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-outline-variant/30">
                <h2 className="text-[24px] font-headline-sm text-on-background font-semibold flex items-center gap-2">
                  <Sparkles size={20} className="text-[#D4AF37]" /> Pending Auto-Billing
                </h2>
                <RunBillingButton />
              </div>
              <div className="flex flex-col gap-3">
                {pendingAutoInvoices.map((inv) => (
                  <Link key={inv.id} href={`/billing/${inv.id}`} className="flex justify-between items-center p-3 border border-[#c6c6ce]/30 hover:bg-[#f8f9ff] transition-colors rounded-none">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-bold uppercase tracking-widest bg-[#D4AF37]/10 text-[#735c00] px-1.5 py-0.5">Auto</span>
                        <p className="text-[13px] font-bold text-[#0A1128]">{inv.invoiceNumber}</p>
                      </div>
                      <p className="text-[12px] text-[#46464d] mt-0.5">{inv.clientName} — {inv.matterTitle}</p>
                      {inv.billingPeriodStart && (
                        <p className="text-[10px] text-[#7c839f] mt-0.5">
                          Period: {new Date(inv.billingPeriodStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {inv.billingPeriodEnd && ` — ${new Date(inv.billingPeriodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                        </p>
                      )}
                    </div>
                    <p className="text-[14px] font-bold text-[#0A1128] tabular-nums">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(inv.amount)}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {recentActivities.length > 0 && (
            <div className="bg-white border border-outline-variant rounded-none p-6 shadow-[0_2px_10px_0_rgba(10,17,40,0.03)]">
              <h2 className="text-[24px] font-headline-sm text-on-background font-semibold mb-6 pb-4 border-b border-outline-variant/30 flex items-center gap-2">
                <Activity size={20} className="text-[#D4AF37]" /> Recent Activity
              </h2>
              <div className="flex flex-col gap-3">
                {recentActivities.map((act) => (
                  <Link key={act.id} href={`/matters/${act.matterId}`} className="flex items-start gap-3 py-2 border-b border-[#c6c6ce]/10 last:border-0 hover:bg-[#f8f9ff] -mx-2 px-2 transition-colors rounded-none">
                    <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                      act.type === 'time' ? 'bg-[#D4AF37]' : act.type === 'document' ? 'bg-[#0A1128]' : 'bg-[#7c839f]'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-[#46464d] truncate">{act.description}</p>
                      <p className="text-[11px] text-[#7c839f] mt-0.5">
                        {act.matter?.title ?? 'Unknown matter'} · {new Date(act.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-5">
          <Suspense fallback={<div className="bg-white border border-outline-variant rounded-none p-6 flex items-center justify-center text-[#76767e]"><Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading insights...</div>}>
            <DashboardAIInsights />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

async function DraftQueueSection() {
  let draftInvoices: { id: string; invoiceNumber: string; clientName: string; amount: unknown; createdAt: Date; status: string }[] = [];
  try {
    const userId = await getCurrentUserId();
    draftInvoices = await prisma.invoice.findMany({
      where: { userId, status: { in: ['Draft', 'PendingApproval'] } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
  } catch {
    // DB unreachable during local dev — fall back to empty
  }

  if (draftInvoices.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#7c839f] font-body-md">No invoices pending approval.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {draftInvoices.map((inv) => (
        <div key={inv.id} className="flex justify-between items-center p-4 border border-outline-variant rounded bg-surface hover:bg-surface-container-low transition-colors duration-200 shadow-sm">
          <Link href={`/billing/${inv.id}`} className="flex-1">
            <p className="text-[14px] font-label-md text-on-background font-bold tracking-tight">{inv.invoiceNumber}</p>
            <p className="text-[16px] font-body-md text-on-surface-variant mt-1">{inv.clientName}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${
                inv.status === 'Draft' ? 'bg-[#ffdad6]/20 text-[#ba1a1a]' : 'bg-[#fed65b]/10 text-[#745c00]'
              }`}>{inv.status === 'PendingApproval' ? 'Pending' : inv.status}</span>
              <span className="text-[11px] text-[#7c839f]">
                {new Date(inv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <p className="text-[16px] font-body-md font-semibold text-on-background tabular-nums">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(inv.amount))}
            </p>
            <DraftQueueApproveButton invoiceId={inv.id} />
          </div>
        </div>
      ))}
    </div>
  );
}
