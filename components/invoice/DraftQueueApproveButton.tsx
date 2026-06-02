'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { approveInvoice } from '@/app/actions/billingActions';
import { useToastStore } from '../../lib/store/useToastStore';

export default function DraftQueueApproveButton({ invoiceId }: { invoiceId: string }) {
  const router = useRouter();
  const { addToast, updateToast } = useToastStore();
  const [loading, setLoading] = useState(false);

  const handleApprove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    const toastId = addToast('Approving...', 'pending');
    const result = await approveInvoice(invoiceId);
    updateToast(toastId, result.message, result.success ? 'success' : 'error');
    if (result.success) router.refresh();
    else setLoading(false);
  };

  return (
    <button
      onClick={handleApprove}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D4AF37] text-[#0A1128] text-[11px] font-bold uppercase tracking-wider hover:bg-[#e9c349] transition-colors disabled:opacity-50 cursor-pointer"
    >
      <Check size={14} />
      {loading ? '...' : 'Approve'}
    </button>
  );
}
