'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye } from 'lucide-react';

type InvoiceRow = {
  id: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  dueDate: string;
  status: string;
  createdAt: string;
  matterId: string | null;
  matterTitle: string | null;
  clientId: string | null;
};

interface RecentInvoicesTableProps {
  invoices: InvoiceRow[];
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function statusBadge(status: string) {
  switch (status) {
    case 'Draft':
      return 'bg-[#ffdad6]/20 border border-[#ba1a1a] text-[#ba1a1a]';
    case 'PendingApproval':
      return 'bg-[#fed65b]/10 border border-[#745c00] text-[#745c00]';
    case 'Finalized':
      return 'bg-[#e6f7e6]/20 border border-[#2e7d32] text-[#2e7d32]';
    case 'Paid':
      return 'bg-green-50 border border-green-700 text-green-700';
    default:
      return 'bg-[#eff4ff] border border-[#c6c6ce] text-[#46464d]';
  }
}

export default function RecentInvoicesTable({ invoices }: RecentInvoicesTableProps) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        <div className="grid grid-cols-12 gap-4 px-4 py-4 bg-[#f8f9ff] border-b-2 border-[#0A1128] font-label-sm text-[11px] font-bold text-[#7c839f] uppercase tracking-widest">
          <div className="col-span-2">Invoice #</div>
          <div className="col-span-4">Client / Matter</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-2 text-right">Amount</div>
          <div className="col-span-2 text-right pr-4">Status</div>
        </div>

        <div className="flex flex-col">
          {invoices.length === 0 && (
            <div className="px-4 py-12 text-center font-body-md text-[#7c839f]">No invoices found.</div>
          )}
          {invoices.map((inv) => (
            <div
              key={inv.id}
              onClick={() => router.push(`/billing/${inv.id}`)}
              className="grid grid-cols-12 gap-4 px-4 py-6 border-b border-[#c6c6ce]/30 hover:bg-[#f8f9ff] transition-colors items-center group cursor-pointer"
            >
              <div className="col-span-2 font-label-md text-[14px] font-bold text-[#0A1128]">{inv.invoiceNumber}</div>
              <div className="col-span-4 flex flex-col">
                {inv.clientId ? (
                  <Link href={`/clients/${inv.clientId}`} onClick={(e) => e.stopPropagation()} className="font-label-md text-[15px] font-bold text-[#0A1128] hover:text-[#D4AF37] transition-colors underline underline-offset-2">{inv.clientName}</Link>
                ) : (
                  <span className="font-label-md text-[15px] font-bold text-[#0A1128]">{inv.clientName}</span>
                )}
                {inv.matterId && inv.matterTitle && (
                  <Link href={`/matters/${inv.matterId}`} onClick={(e) => e.stopPropagation()} className="font-body-md text-[12px] text-[#46464d] hover:text-[#D4AF37] transition-colors mt-0.5">{inv.matterTitle}</Link>
                )}
              </div>
              <div className="col-span-2 font-body-md text-[14px] text-[#46464d]">
                {new Date(inv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="col-span-2 font-label-md text-[15px] font-bold text-[#0A1128] text-right">{formatAmount(inv.amount)}</div>
              <div className="col-span-2 flex justify-end items-center gap-4">
                <span className={`px-2.5 py-1 rounded-none font-label-sm text-[10px] font-bold uppercase tracking-widest ${statusBadge(inv.status)}`}>
                  {inv.status === 'PendingApproval' ? 'Pending' : inv.status}
                </span>
                <div className="text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[#D4AF37]/10 rounded-none">
                  <Eye size={18} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}