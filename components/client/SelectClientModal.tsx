"use client";

import { useState } from "react";
import { CheckCircle2, Search, X } from "lucide-react";
import type { ClientDirectoryEntry } from "@/lib/types";

type SelectClientModalProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (clientId: string) => void;
  clients: ClientDirectoryEntry[];
};

export function SelectClientModal({ open, onClose, onSelect, clients }: SelectClientModalProps) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!open) return null;

  const filtered = query
    ? clients.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.contactName.toLowerCase().includes(query.toLowerCase()) ||
        c.industry.toLowerCase().includes(query.toLowerCase())
      )
    : clients;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1128]/75 p-4 sm:p-8 backdrop-blur-sm" onClick={onClose}>
      <section
        className="w-full max-w-[752px] border border-[#c6c6ce]/50 bg-white shadow-2xl shadow-black/20"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-[#c6c6ce]/30 px-6 py-5">
          <h2 className="font-headline-sm text-headline-sm text-[#0A1128]">Select Client</h2>
          <button onClick={onClose} aria-label="Close" className="text-[#76767e] hover:text-[#0A1128] transition-colors cursor-pointer">
            <X className="h-6 w-6" />
          </button>
        </header>

        <div className="border-b border-[#c6c6ce]/30 bg-[#f8f9ff] px-6 py-5">
          <label className="flex items-center gap-3 border-b border-[#c6c6ce] bg-white px-4 py-3 text-[15px] text-[#76767e]">
            <Search className="h-5 w-5 text-[#76767e] shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search clients..."
              className="flex-1 bg-transparent outline-none text-[#0A1128] placeholder:text-[#76767e]"
              autoFocus
            />
          </label>
        </div>

        <div className="max-h-[50vh] overflow-y-auto">
          {filtered.length === 0 && (
            <p className="px-6 py-8 text-center text-[#76767e] font-body-md text-body-md">No clients found.</p>
          )}
          {filtered.map((client) => (
            <button
              key={client.id}
              onClick={() => setSelectedId(client.id)}
              className={`w-full flex items-center justify-between border-b border-[#c6c6ce]/20 px-6 py-4 text-left transition cursor-pointer ${
                selectedId === client.id
                  ? "bg-[#fff8e6] border-l-4 border-l-[#D4AF37]"
                  : "hover:bg-[#f8f9ff]"
              }`}
            >
              <span>
                <span className="block text-[15px] font-semibold text-[#0A1128]">{client.name}</span>
                <span className="mt-0.5 block text-[13px] text-[#46464d]">
                  {client.industry || 'N/A'} &bull; {client.activeMatters} active matter{client.activeMatters === 1 ? '' : 's'}
                </span>
              </span>
              {selectedId === client.id && (
                <CheckCircle2 className="h-6 w-6 text-[#D4AF37]" strokeWidth={2} />
              )}
            </button>
          ))}
        </div>

        <footer className="flex justify-end gap-3 border-t border-[#c6c6ce]/30 bg-[#f8f9ff] px-6 py-4">
          <button onClick={onClose} className="px-5 py-2 border border-[#c6c6ce] bg-white text-[#0A1128] font-label-sm text-label-sm uppercase tracking-wider hover:bg-[#f8f9ff] transition-colors cursor-pointer">
            Cancel
          </button>
          <button
            onClick={() => { if (selectedId) { onSelect(selectedId); onClose(); } }}
            disabled={!selectedId}
            className="px-6 py-2 bg-[#0A1128] text-white font-label-sm text-label-sm uppercase tracking-wider hover:bg-[#162244] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Select Client
          </button>
        </footer>
      </section>
    </div>
  );
}
