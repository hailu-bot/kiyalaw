'use client';

import React, { useState } from 'react';
import { Sparkles, X, Wand2, Loader2 } from 'lucide-react';
import { refineTimeDescription } from '@/app/actions/timeActions';

interface AITimeEntryRefinementProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (refined: string) => void;
  entryDescription: string;
}

export default function AITimeEntryRefinement({ isOpen, onClose, onApply, entryDescription }: AITimeEntryRefinementProps) {
  const [refinedText, setRefinedText] = useState(entryDescription);
  const [tone, setTone] = useState('formal');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleRefine = async () => {
    setLoading(true);
    const result = await refineTimeDescription(entryDescription, tone);
    setRefinedText(result);
    setLoading(false);
  };

  const handleApply = () => {
    onApply(refinedText);
    onClose();
  };

  const refinements = [
    { id: 'formal', label: 'Formal Legal', description: 'Formal legal language with precise terminology' },
    { id: 'concise', label: 'Concise', description: 'Short, billable-optimized descriptions' },
    { id: 'detailed', label: 'Detailed', description: 'Expanded narrative with full context' },
  ];

  return (
    <div className="fixed inset-0 bg-[#0A1128]/80 backdrop-blur-sm flex items-center justify-center z-50 p-margin-mobile md:p-margin-desktop">
      <div className="bg-white w-full max-w-2xl border border-[#c6c6ce]/30 shadow-[0_20px_40px_rgba(10,17,40,0.08)]">
        <div className="px-8 py-6 border-b border-[#c6c6ce]/20 flex justify-between items-center bg-[#f8f9ff]">
          <div className="flex items-center gap-3">
            <Wand2 className="text-[#D4AF37]" size={24} />
            <h2 className="font-headline-sm text-[24px] font-bold text-[#0A1128]">Refine Time Entry</h2>
          </div>
          <button onClick={onClose} className="text-[#46464d] hover:text-[#0A1128] transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div>
            <label className="font-label-md text-[12px] font-bold uppercase tracking-widest text-[#46464d] block mb-3">Original Description</label>
            <div className="bg-[#f8f9ff] border border-[#c6c6ce]/30 p-4 font-body-md text-[15px] text-[#46464d]">
              {entryDescription}
            </div>
          </div>

          <div>
            <label className="font-label-md text-[12px] font-bold uppercase tracking-widest text-[#46464d] block mb-3">Refinement Style</label>
            <div className="flex gap-3">
              {refinements.map((r) => (
                <button
                  key={r.id}
                  onClick={() => { setTone(r.id); setRefinedText(entryDescription); }}
                  className={`flex-1 p-4 border text-left transition-all ${
                    tone === r.id
                      ? 'bg-[#0A1128] text-white border-[#D4AF37]'
                      : 'bg-[#f8f9ff] border-[#c6c6ce]/30 hover:border-[#D4AF37]/50'
                  }`}
                >
                  <span className={`font-label-md text-[12px] font-bold uppercase tracking-widest block mb-1 ${
                    tone === r.id ? 'text-[#D4AF37]' : 'text-[#0A1128]'
                  }`}>
                    {r.label}
                  </span>
                  <span className={`font-body-md text-[13px] ${
                    tone === r.id ? 'text-white/70' : 'text-[#46464d]'
                  }`}>
                    {r.description}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={handleRefine}
              disabled={loading}
              className="mt-3 flex items-center gap-2 px-5 py-2 bg-[#0A1128] text-[#D4AF37] font-label-md text-[12px] font-bold uppercase tracking-wider hover:bg-[#162244] transition-colors disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {loading ? 'Refining...' : 'Generate Refinement'}
            </button>
          </div>

          <div>
            <label className="font-label-md text-[12px] font-bold uppercase tracking-widest text-[#46464d] block mb-3">Refined Description</label>
            <textarea
              value={refinedText}
              onChange={(e) => setRefinedText(e.target.value)}
              rows={4}
              className="w-full bg-[#f8f9ff] border border-[#c6c6ce] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] p-4 font-body-md text-[15px] text-[#0A1128] outline-none"
            />
          </div>
        </div>

        <div className="px-8 py-6 border-t border-[#c6c6ce]/20 bg-[#f8f9ff] flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-3 font-label-md text-[13px] font-bold uppercase tracking-widest text-[#0A1128] hover:bg-[#d3e4fe] transition-colors">
            Cancel
          </button>
          <button onClick={handleApply} className="flex items-center gap-2 px-8 py-3 font-label-md text-[13px] font-bold uppercase tracking-widest bg-[#0A1128] text-[#D4AF37] hover:bg-[#162244] transition-colors shadow-md">
            <Sparkles size={16} />
            Apply Refinement
          </button>
        </div>
      </div>
    </div>
  );
}
