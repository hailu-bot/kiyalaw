'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Briefcase, Users, Wallet, FileText } from 'lucide-react';
import { globalSearch, type SearchResult } from '@/app/actions/searchActions';

const typeIcons: Record<string, React.ElementType> = {
  matter: Briefcase,
  client: Users,
  invoice: Wallet,
  document: FileText,
};

const typeColors: Record<string, string> = {
  matter: 'bg-blue-50 text-blue-700 border-blue-200',
  client: 'bg-purple-50 text-purple-700 border-purple-200',
  invoice: 'bg-green-50 text-green-700 border-green-200',
  document: 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => {
          if (!prev) {
            setQuery('');
            setResults([]);
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
          }
          return !prev;
        });
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const res = await globalSearch(query);
      setResults(res);
      setSelectedIndex(0);
      setLoading(false);
    }, query.trim().length < 2 ? 0 : 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        router.push(results[selectedIndex].href);
        setOpen(false);
      }
    },
    [results, selectedIndex, router]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-xl bg-white shadow-2xl border border-[#c6c6ce]/40 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#c6c6ce]/30">
          <Search size={18} className="text-[#7c839f]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search matters, clients, invoices, documents..."
            className="flex-1 outline-none text-[15px] font-body-md text-[#0A1128] placeholder:text-[#7c839f]"
          />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#7c839f] bg-[#f8f9ff] px-2 py-1 border border-[#c6c6ce]/30">ESC</span>
        </div>

        <div className="max-h-[50vh] overflow-y-auto">
          {loading && (
            <div className="px-4 py-8 text-center text-[13px] text-[#7c839f]">Searching...</div>
          )}

          {!loading && query.trim().length >= 2 && results.length === 0 && (
            <div className="px-4 py-8 text-center text-[13px] text-[#7c839f]">No results found.</div>
          )}

          {results.map((r, i) => {
            const Icon = typeIcons[r.type] || Search;
            const colorClass = typeColors[r.type] || 'bg-gray-50 text-gray-700 border-gray-200';
            return (
              <button
                key={`${r.type}-${r.id}`}
                onClick={() => { router.push(r.href); setOpen(false); }}
                onMouseEnter={() => setSelectedIndex(i)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer ${
                  i === selectedIndex ? 'bg-[#f0f3ff]' : 'hover:bg-[#f8f9ff]'
                }`}
              >
                <div className={`p-1.5 border ${colorClass}`}>
                  <Icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[#0A1128] truncate">{r.label}</p>
                  <p className="text-[12px] text-[#7c839f] truncate">{r.subtitle}</p>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border ${colorClass}`}>
                  {r.type}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
