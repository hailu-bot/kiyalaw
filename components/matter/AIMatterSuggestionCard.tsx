'use client';

import React from 'react';
import { Sparkles, Check, X, Edit3, Briefcase } from 'lucide-react';
import Link from 'next/link';

interface AIMatterSuggestionCardProps {
  suggestion: {
    id: string;
    type: 'time' | 'document' | 'action';
    title: string;
    description: string;
    matterName: string;
    matterId: string;
    confidence: number;
  };
  onDismiss: (id: string) => void;
  onApply: (id: string) => void;
}

export default function AIMatterSuggestionCard({ suggestion, onDismiss, onApply }: AIMatterSuggestionCardProps) {
  return (
    <div className="bg-white border border-[#c6c6ce]/40 hover:shadow-[0_4px_20px_rgba(10,17,40,0.06)] transition-shadow">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#D4AF37]" />
            <span className="font-label-sm text-[11px] font-bold uppercase tracking-widest text-[#D4AF37]">
              {suggestion.type === 'time' ? 'Time Entry' : suggestion.type === 'document' ? 'Document' : 'Action'}
            </span>
            <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
              suggestion.confidence > 85 ? 'bg-[#D4AF37]/10 text-[#735c00]' : 'bg-[#eff4ff] text-[#46464d]'
            }`}>
              {suggestion.confidence}%
            </span>
          </div>
        </div>

        <h4 className="font-headline-sm text-[18px] font-bold text-[#0A1128] mb-1 tracking-tight">{suggestion.title}</h4>
        <p className="font-body-md text-[14px] text-[#46464d] mb-4">{suggestion.description}</p>

        <Link
          href={`/matters/${suggestion.matterId}`}
          className="inline-flex items-center gap-1.5 font-label-sm text-[11px] text-[#7c839f] hover:text-[#0A1128] transition-colors mb-4"
        >
          <Briefcase size={14} />
          {suggestion.matterName}
        </Link>
      </div>

      <div className="flex border-t border-[#c6c6ce]/20">
        <button
          onClick={() => onApply(suggestion.id)}
          className="flex-1 flex items-center justify-center gap-2 py-3 font-label-md text-[12px] font-bold uppercase tracking-widest text-[#0A1128] hover:bg-[#D4AF37]/10 hover:text-[#735c00] transition-colors border-r border-[#c6c6ce]/20"
        >
          <Check size={16} />
          Apply
        </button>
        <button
          onClick={() => onDismiss(suggestion.id)}
          className="flex-1 flex items-center justify-center gap-2 py-3 font-label-md text-[12px] font-bold uppercase tracking-widest text-[#46464d] hover:bg-red-50 hover:text-red-600 transition-colors border-r border-[#c6c6ce]/20"
        >
          <X size={16} />
          Dismiss
        </button>
        <Link
          href={`/matters/${suggestion.matterId}`}
          className="flex-1 flex items-center justify-center gap-2 py-3 font-label-md text-[12px] font-bold uppercase tracking-widest text-[#46464d] hover:bg-[#f8f9ff] hover:text-[#0A1128] transition-colors"
        >
          <Edit3 size={16} />
          Review
        </Link>
      </div>
    </div>
  );
}
