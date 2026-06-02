import React from 'react';
import InvoiceApprovalCard from './InvoiceApprovalCard';
import ApproveAllButton from './ApproveAllButton';
import { getInvoices } from '@/app/actions/billingActions';


export default async function InvoiceApprovalQueue() {
  const { invoices } = await getInvoices({ status: 'Draft,PendingApproval' });

  return (
    <div className="flex flex-col gap-4 bg-white border border-[#c6c6ce]/40 shadow-sm rounded-none p-6 md:p-8">
      <div className="flex items-center justify-between pb-4 border-b border-[#c6c6ce]/40">
        <h3 className="font-headline-sm text-[20px] font-bold text-[#0A1128] tracking-tight">
          {invoices.length} Draft{invoices.length !== 1 ? 's' : ''} Pending Approval
        </h3>
        <ApproveAllButton />
      </div>

      <div className="space-y-4 mt-4">
        {invoices.map((inv) => (
          <InvoiceApprovalCard
            key={inv.id}
            invoiceId={inv.id}
            invoiceNumber={inv.invoiceNumber}
            clientName={inv.clientName}
            amount={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(inv.amount)}
            dueDate={inv.dueDate}
            isOverdue={false}
          />
        ))}

        {invoices.length === 0 && (
          <div className="text-[#7c839f] text-[14px]">No invoices pending approval.</div>
        )}
      </div>
    </div>
  );
}
