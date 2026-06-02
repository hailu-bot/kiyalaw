'use client';

import React, { useState } from 'react';
import { Sparkles, BrainCircuit } from 'lucide-react';
import AITimeEntrySuggestions from './AITimeEntrySuggestions';

interface AITimeInputProps {
  onClear?: () => void;
}

export default function AITimeInput({ onClear }: AITimeInputProps) {
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  return (
    <>
      <div className="bg-[#f8f9ff] border border-[#c6c6ce]/40 p-5">
        <h3 className="font-label-md text-[12px] font-bold uppercase tracking-widest text-[#46464d] mb-4 flex items-center gap-2">
          <BrainCircuit size={18} className="text-[#D4AF37]" />
          AI Time Suggestion
        </h3>
        <p className="font-body-md text-[14px] text-[#46464d] mb-4">
          Let AI suggest time entries based on your active matters.
        </p>
        <div className="flex gap-2">
          <button onClick={() => setSuggestionsOpen(true)} className="flex-1 bg-[#0A1128] text-[#D4AF37] font-label-md text-[12px] font-bold uppercase tracking-wider py-2.5 hover:bg-[#162244] transition-colors">
            <Sparkles size={16} className="inline mr-2" />
            AI Suggestions
          </button>
          <button onClick={onClear} className="flex-1 border border-[#c6c6ce]/50 text-[#0A1128] font-label-md text-[12px] font-bold uppercase tracking-wider py-2.5 hover:bg-[#eff4ff] transition-colors">
            Clear
          </button>
        </div>
      </div>
      <AITimeEntrySuggestions isOpen={suggestionsOpen} onClose={() => setSuggestionsOpen(false)} />
    </>
  );
}
