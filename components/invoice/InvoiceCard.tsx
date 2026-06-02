'use client';

import React from 'react';
import { X, Check } from 'lucide-react';

interface InvoiceCardProps {
  invoiceNumber: string;
  clientName: string;
  amount: string;
  dueDate: string;
  isOverdue?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
  disabled?: boolean;
}

export default function InvoiceCard({ invoiceNumber, clientName, amount, dueDate, isOverdue = false, onApprove, onReject, disabled = false }: InvoiceCardProps) {
  return (
    <div className="bg-[#0A1128] text-white rounded-none p-4 flex items-center justify-between gap-4 border-l-0 hover:border-l-4 hover:border-l-[#D4AF37] transition-all">
      <div className="flex flex-col">
        <span className="text-[14px] font-label-md font-bold">{invoiceNumber}</span>
        <span className="text-[13px] font-body-md text-[#f1f5fb] mt-1">{clientName}</span>
        <span className="text-[12px] font-label-sm text-[#c6c6ce] mt-1">Due: {dueDate}</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className="text-[16px] font-semibold">{amount}</div>
          {isOverdue && <div className="text-[11px] text-[#ffb4a8] font-bold uppercase tracking-wider">Overdue</div>}
        </div>

        <div className="flex items-center gap-2">
          <button type="button" title="Reject" aria-label="Reject" onClick={onReject} disabled={disabled || !onReject} className="px-3 py-2 bg-transparent border border-[#ffffff20] hover:bg-[#ffffff08] rounded-none text-[#fff] disabled:opacity-40">
            <X size={16} />
          </button>
          <button type="button" title="Approve" aria-label="Approve" onClick={onApprove} disabled={disabled || !onApprove} className="px-3 py-2 bg-[#D4AF37] text-[#0A1128] font-bold rounded-none disabled:opacity-40">
            <Check size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
