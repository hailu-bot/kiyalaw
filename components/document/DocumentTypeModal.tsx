'use client';

import React, { useState } from 'react';
import { X, FileText, Gavel, BookOpen, FolderOpen, Search } from 'lucide-react';

const docTypes = [
  { id: 'contract', label: 'Contract', icon: FileText, description: 'Draft NDAs, MSAs, and employment agreements.' },
  { id: 'pleading', label: 'Pleading', icon: Gavel, description: 'Complaints, motions, answers, and declarations.' },
  { id: 'memo', label: 'Memo', icon: BookOpen, description: 'Internal legal research and client advisory memorandums.' },
  { id: 'other', label: 'Other', icon: FolderOpen, description: 'Letters, notices, discovery requests, and custom formats.' },
];

interface DocumentTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (type: string, label: string) => void;
}

export default function DocumentTypeModal({ isOpen, onClose, onCreate }: DocumentTypeModalProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = docTypes.filter(t =>
    t.label.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-[#0A1128]/80 backdrop-blur-sm flex items-center justify-center z-50 p-margin-mobile md:p-margin-desktop" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl border border-[#c6c6ce]/30 shadow-[0_20px_40px_rgba(10,17,40,0.08)]" onClick={e => e.stopPropagation()}>
        <div className="px-8 py-6 border-b border-[#c6c6ce]/20 flex justify-between items-center bg-[#f8f9ff]">
          <h2 className="font-headline-sm text-[24px] font-bold text-[#0A1128]">Create New Document</h2>
          <button onClick={onClose} className="text-[#46464d] hover:text-[#0A1128] transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7c839f]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search document types..."
              className="w-full pl-10 pr-4 py-3 border border-[#c6c6ce]/50 text-[15px] font-body-md outline-none focus:border-[#D4AF37] transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {filtered.map(type => {
              const Icon = type.icon;
              const isSelected = selected === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelected(type.id)}
                  className={`p-6 border text-left transition-all ${
                    isSelected
                      ? 'bg-[#0A1128] text-white border-[#D4AF37]'
                      : 'bg-[#f8f9ff] border-[#c6c6ce]/30 hover:border-[#D4AF37]/50'
                  }`}
                >
                  <Icon size={32} className={`mb-3 ${isSelected ? 'text-[#D4AF37]' : 'text-[#46464d]'}`} />
                  <h3 className={`font-headline-sm text-[18px] font-bold mb-1 ${isSelected ? 'text-white' : 'text-[#0A1128]'}`}>
                    {type.label}
                  </h3>
                  <p className={`font-body-md text-[13px] ${isSelected ? 'text-white/70' : 'text-[#46464d]'}`}>
                    {type.description}
                  </p>
                </button>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <p className="text-center py-8 text-[#7c839f]">No document types match your search.</p>
          )}
        </div>

        <div className="px-8 py-6 border-t border-[#c6c6ce]/20 bg-[#f8f9ff] flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-3 font-label-md text-[13px] font-bold uppercase tracking-widest text-[#0A1128] hover:bg-[#d3e4fe] transition-colors">
            Cancel
          </button>
          <button
            onClick={() => { if (selected) { const t = docTypes.find(d => d.id === selected); onCreate(selected, t?.label ?? selected); } }}
            disabled={!selected}
            className="px-8 py-3 font-label-md text-[13px] font-bold uppercase tracking-widest bg-[#0A1128] text-[#D4AF37] hover:bg-[#162244] transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-md"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
