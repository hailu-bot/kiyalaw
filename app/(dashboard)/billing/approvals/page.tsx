import React from 'react';
import Link from 'next/link';
import InvoiceApprovalQueue from '../../../../components/invoice/InvoiceApprovalQueue';
import ApproveAllButton from '../../../../components/invoice/ApproveAllButton';

export const dynamic = 'force-dynamic';

export default function BillingApprovalsPage() {
  return (
    <div className="px-6 md:px-12 py-8 md:py-12 max-w-[1200px] mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <Link href="/billing" className="flex items-center gap-2 text-[#7c839f] hover:text-[#0A1128] transition-colors">
          ← Back to Billing Dashboard
        </Link>
        <div className="flex items-center gap-4">
          <h1 className="font-headline-lg text-[28px] font-bold text-[#0A1128]">Invoice Approval Queue</h1>
          <ApproveAllButton />
        </div>
      </div>

      <InvoiceApprovalQueue />
    </div>
  );
}
