'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, Check, BrainCircuit } from 'lucide-react';
import { generateTimeSuggestions } from '@/app/actions/timeActions';
import { createTimeEntry } from '@/app/actions/timeActions';

interface Suggestion {
  id: string;
  matterId: string;
  client: string;
  matter: string;
  description: string;
  hours: number;
  confidence: number;
}

interface AITimeEntrySuggestionsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AITimeEntrySuggestions({ isOpen, onClose }: AITimeEntrySuggestionsProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [creating, setCreating] = useState(false);
  const fetchedRef = React.useRef(0);
  useEffect(() => {
    if (!isOpen) return;
    fetchedRef.current += 1;
    const id = fetchedRef.current;
    generateTimeSuggestions().then(data => {
      if (id !== fetchedRef.current) return;
      const withIds = data.map((s, i) => ({ ...s, id: String(i + 1) }));
      setSuggestions(withIds);
    });
  }, [isOpen]);

  const toggleSelection = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleAddSelected = async () => {
    if (selected.length === 0 || creating) return;
    setCreating(true);
    for (const id of selected) {
      const suggestion = suggestions.find(s => s.id === id);
      if (!suggestion || !suggestion.matterId) continue;
      await createTimeEntry({
        matterId: suggestion.matterId,
        description: suggestion.description,
        date: new Date().toISOString().split('T')[0],
        hours: suggestion.hours,
        rate: 850,
        billable: true,
      });
    }
    setCreating(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0A1128]/80 backdrop-blur-sm flex items-center justify-center z-50 p-margin-mobile md:p-margin-desktop">
      <div className="bg-white w-full max-w-2xl border border-[#c6c6ce]/30 shadow-[0_20px_40px_rgba(10,17,40,0.08)] flex flex-col max-h-[80vh]">
        <div className="px-8 py-6 border-b border-[#c6c6ce]/20 flex justify-between items-center bg-[#f8f9ff]">
          <div className="flex items-center gap-3">
            <BrainCircuit className="text-[#D4AF37]" size={24} />
            <h2 className="font-headline-sm text-[24px] font-bold text-[#0A1128]">AI Time Entry Suggestions</h2>
          </div>
          <button onClick={onClose} className="text-[#46464d] hover:text-[#0A1128] transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {suggestions.length === 0 && (
            <p className="text-center py-8 text-[#7c839f] font-body-md">No suggestions available. Try with more active matters.</p>
          )}

          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              onClick={() => toggleSelection(suggestion.id)}
              className={`border p-5 cursor-pointer transition-all ${
                selected.includes(suggestion.id)
                  ? 'bg-[#0A1128] text-white border-[#D4AF37]'
                  : 'bg-[#f8f9ff] border-[#c6c6ce]/30 hover:border-[#D4AF37]/50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-label-sm text-[11px] font-bold uppercase tracking-widest ${
                      selected.includes(suggestion.id) ? 'text-[#D4AF37]' : 'text-[#46464d]'
                    }`}>
                      {suggestion.client}
                    </span>
                    <span className={`text-[11px] ${selected.includes(suggestion.id) ? 'text-white/50' : 'text-[#7c839f]'}`}>•</span>
                    <span className={`font-label-sm text-[11px] font-bold uppercase tracking-widest ${
                      selected.includes(suggestion.id) ? 'text-[#D4AF37]' : 'text-[#46464d]'
                    }`}>
                      {suggestion.matter}
                    </span>
                  </div>
                  <p className={`font-body-md text-[15px] ${selected.includes(suggestion.id) ? 'text-white' : 'text-[#0A1128]'}`}>
                    {suggestion.description}
                  </p>
                </div>
                {selected.includes(suggestion.id) && (
                  <Check size={20} className="text-[#D4AF37] ml-2 mt-1" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`flex items-center gap-1 font-label-sm text-[12px] ${
                    selected.includes(suggestion.id) ? 'text-[#D4AF37]' : 'text-[#735c00]'
                  }`}>
                    <Clock size={14} />
                    {suggestion.hours}h
                  </span>
                  <span className={`font-label-sm text-[11px] ${
                    selected.includes(suggestion.id) ? 'text-white/50' : 'text-[#7c839f]'
                  }`}>
                    {suggestion.confidence}% match
                  </span>
                </div>
                <div className="w-16 h-1.5 bg-[#c6c6ce]/30 overflow-hidden">
                  <div className="h-full bg-[#D4AF37] transition-all" style={{ width: `${suggestion.confidence}%` }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="px-8 py-6 border-t border-[#c6c6ce]/20 bg-[#f8f9ff] flex justify-between items-center">
          <span className="font-label-sm text-[12px] text-[#46464d]">
            {selected.length} entry{selected.length !== 1 ? 'ies' : ''} selected
          </span>
          <div className="flex gap-4">
            <button onClick={onClose} className="px-6 py-3 font-label-md text-[13px] font-bold uppercase tracking-widest text-[#0A1128] hover:bg-[#d3e4fe] transition-colors">
              Cancel
            </button>
            <button
              onClick={handleAddSelected}
              disabled={selected.length === 0 || creating}
              className="px-8 py-3 font-label-md text-[13px] font-bold uppercase tracking-widest bg-[#0A1128] text-[#D4AF37] hover:bg-[#162244] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {creating ? 'Adding...' : `Add Selected (${selected.length})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
