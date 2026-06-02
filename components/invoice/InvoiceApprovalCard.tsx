'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import InvoiceCard from './InvoiceCard';
import { approveInvoice, rejectInvoice } from '@/app/actions/billingActions';
import { useToastStore } from '../../lib/store/useToastStore';

interface InvoiceApprovalCardProps {
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
  amount: string;
  dueDate: string;
  isOverdue?: boolean;
}

export default function InvoiceApprovalCard(props: InvoiceApprovalCardProps) {
  const router = useRouter();
  const { addToast, updateToast } = useToastStore();
  const [disabled, setDisabled] = useState(false);

  const handleApprove = async () => {
    setDisabled(true);
    const toastId = addToast('Approving invoice...', 'pending');
    const result = await approveInvoice(props.invoiceId);
    updateToast(toastId, result.message, result.success ? 'success' : 'error');
    if (result.success) router.refresh();
    else setDisabled(false);
  };

  const handleReject = async () => {
    setDisabled(true);
    const toastId = addToast('Rejecting invoice...', 'pending');
    const result = await rejectInvoice(props.invoiceId);
    updateToast(toastId, result.message, result.success ? 'success' : 'error');
    if (result.success) router.refresh();
    else setDisabled(false);
  };

  return (
    <InvoiceCard
      invoiceNumber={props.invoiceNumber}
      clientName={props.clientName}
      amount={props.amount}
      dueDate={props.dueDate}
      isOverdue={props.isOverdue}
      onApprove={handleApprove}
      onReject={handleReject}
      disabled={disabled}
    />
  );
}
