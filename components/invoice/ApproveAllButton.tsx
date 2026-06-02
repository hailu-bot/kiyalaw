'use client';

import React, { useCallback, useState } from 'react';
import { approveAllDrafts } from '@/app/actions/billingActions';
import { useToastStore } from '../../lib/store/useToastStore';

export default function ApproveAllButton() {
  const { addToast, updateToast } = useToastStore();
  const [loading, setLoading] = useState(false);

  const handleApproveAll = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    const toastId = addToast('Approving all drafts...', 'pending');
    const result = await approveAllDrafts();
    if (result.success) {
      updateToast(toastId, result.message, 'success');
    } else {
      updateToast(toastId, result.message, 'error');
    }
    setLoading(false);
  }, [loading, addToast]);

  return (
    <button
      type="button"
      title="Approve All Drafts"
      aria-label="Approve All Drafts"
      onClick={handleApproveAll}
      disabled={loading}
      className="bg-[#0A1128] text-white px-4 py-2 rounded-none font-bold disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? 'Approving...' : 'Approve All Drafts'}
    </button>
  );
}
