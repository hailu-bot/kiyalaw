'use client';

import React from 'react';
import { Check, X, AlertTriangle } from 'lucide-react';

interface TimeEntryDetailReviewProps {
  entry: {
    client: string;
    matter: string;
    description: string;
    hours: number;
    date: string;
    category: string;
  };
  onConfirm: () => void;
  onReject: () => void;
}

export default function TimeEntryDetailReview({ entry, onConfirm, onReject }: TimeEntryDetailReviewProps) {
  return (
    <div className="bg-white border border-[#c6c6ce]/40 max-w-2xl mx-auto">
      <div className="px-8 py-6 border-b border-[#c6c6ce]/20 bg-[#f8f9ff]">
        <h2 className="font-headline-sm text-[24px] font-bold text-[#0A1128]">Review Time Entry</h2>
        <p className="font-body-md text-[15px] text-[#46464d] mt-1">Confirm the details below before saving.</p>
      </div>

      <div className="p-8 space-y-6">
        <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/30 p-4 flex items-start gap-3">
          <AlertTriangle size={20} className="text-[#735c00] mt-0.5" />
          <p className="font-body-md text-[14px] text-[#735c00]">Please review the following time entry for accuracy before it is recorded.</p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-[#c6c6ce]/20">
            <span className="font-label-md text-[12px] font-bold uppercase tracking-widest text-[#46464d]">Client</span>
            <span className="font-body-md text-[15px] text-[#0A1128] font-semibold">{entry.client}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-[#c6c6ce]/20">
            <span className="font-label-md text-[12px] font-bold uppercase tracking-widest text-[#46464d]">Matter</span>
            <span className="font-body-md text-[15px] text-[#0A1128] font-semibold">{entry.matter}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-[#c6c6ce]/20">
            <span className="font-label-md text-[12px] font-bold uppercase tracking-widest text-[#46464d]">Category</span>
            <span className="font-body-md text-[15px] text-[#0A1128] font-semibold">{entry.category}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-[#c6c6ce]/20">
            <span className="font-label-md text-[12px] font-bold uppercase tracking-widest text-[#46464d]">Date</span>
            <span className="font-body-md text-[15px] text-[#0A1128] font-semibold">{entry.date}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-[#c6c6ce]/20">
            <span className="font-label-md text-[12px] font-bold uppercase tracking-widest text-[#46464d]">Duration</span>
            <span className="font-body-md text-[15px] text-[#0A1128] font-semibold">{entry.hours} hours</span>
          </div>
          <div className="py-3">
            <span className="font-label-md text-[12px] font-bold uppercase tracking-widest text-[#46464d] block mb-2">Description</span>
            <p className="font-body-md text-[15px] text-[#0A1128] bg-[#f8f9ff] p-4 border border-[#c6c6ce]/30">{entry.description}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pt-6 border-t border-[#c6c6ce]/20">
          <button
            onClick={onReject}
            className="flex items-center gap-2 px-6 py-3 border border-[#c6c6ce] text-[#46464d] font-label-md text-[13px] font-bold uppercase tracking-wider hover:bg-[#f8f9ff] transition-colors"
          >
            <X size={16} />
            Reject
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center gap-2 px-8 py-3 bg-[#0A1128] text-white font-label-md text-[13px] font-bold uppercase tracking-wider hover:bg-[#162244] transition-colors shadow-md"
          >
            <Check size={16} />
            Confirm Entry
          </button>
        </div>
      </div>
    </div>
  );
}
