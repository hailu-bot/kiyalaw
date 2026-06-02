'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, ArrowUpDown, ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { ClientCard } from './ClientCard';
import ClientOnboardingWizard from './ClientOnboardingWizard';
import ImportCsvModal from './ImportCsvModal';
import type { ClientDirectoryEntry } from '@/lib/types';

type Props = {
  clients: ClientDirectoryEntry[];
};

type SortKey = 'name' | 'activeMatters' | 'createdAt';
type SortDir = 'asc' | 'desc';

export default function ClientDirectoryGrid({ clients }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const PAGE_SIZE = 12;

  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const list = clients.filter((c) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.contactName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      );
    });

    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortKey === 'activeMatters') cmp = a.activeMatters - b.activeMatters;
      else if (sortKey === 'createdAt') cmp = a.createdAt.localeCompare(b.createdAt);
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [clients, searchQuery, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const renderSortBtn = (k: SortKey, label: string) => (
    <button key={k} onClick={() => { toggleSort(k); setPage(1); }} className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#46464d] hover:text-[#0A1128] transition-colors cursor-pointer">
      {label}
      <ArrowUpDown className={`h-3 w-3 ${sortKey === k ? 'text-[#D4AF37]' : ''}`} />
    </button>
  );

  return (
    <div>
      <ClientOnboardingWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />
      <ImportCsvModal open={importOpen} onClose={() => setImportOpen(false)} />

      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-12 gap-6">
        <div>
          <h1 className="font-headline-md text-headline-md text-[#0A1128] mb-2">Client Directory</h1>
          <p className="font-body-lg text-body-lg text-[#46464d]">Manage corporate accounts and track active matters.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#76767e] h-5 w-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              placeholder="Search clients, companies..."
              className="w-full bg-white border-b border-[#c6c6ce] focus:border-[#D4AF37] focus:ring-0 focus:outline-none py-3 pl-10 pr-4 font-body-md text-body-md text-[#0A1128] transition-colors placeholder:text-[#46464d]/50 rounded-none"
            />
          </div>
          <button
            onClick={() => setImportOpen(true)}
            className="border border-[#0A1128] text-[#0A1128] px-6 py-3 font-label-md text-label-md uppercase tracking-wider transition-colors flex items-center justify-center gap-2 whitespace-nowrap hover:bg-[#f8f9ff] cursor-pointer"
          >
            <Upload className="h-5 w-5" />
            Import CSV
          </button>
          <button
            onClick={() => setWizardOpen(true)}
            className="bg-[#0A1128] text-white px-6 py-3 font-label-md text-label-md uppercase tracking-wider transition-colors flex items-center justify-center gap-2 whitespace-nowrap hover:bg-[#162244] cursor-pointer"
          >
            <Plus className="h-5 w-5" />
            New Client
          </button>
        </div>
      </div>

      {/* Sort controls */}
      <div className="flex items-center gap-4 mb-4 px-1">
        <span className="font-label-sm text-label-sm text-[#76767e] uppercase tracking-wider">Sort by:</span>
        {renderSortBtn('name', 'Name')}
        {renderSortBtn('activeMatters', 'Matters')}
        {renderSortBtn('createdAt', 'Created')}
        <a href="/api/export/clients" download className="ml-auto flex items-center gap-1 px-3 py-1 border border-[#c6c6ce]/50 text-[#46464d] text-[10px] font-bold uppercase tracking-widest hover:bg-[#f8f9ff] transition-colors">
          CSV
        </a>
        <span className="text-[11px] text-[#76767e]">{filtered.length} client{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {filtered.length === 0 && (
        <div className="bg-[#f8f9ff] border border-[#c6c6ce]/30 p-8 text-center">
          <p className="font-body-md text-body-md text-[#46464d]">No clients match your search.</p>
        </div>
      )}

      <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-gutter">
        {paged.map((client) => (
          <ClientCard
            key={client.id}
            id={client.id}
            name={client.name}
            contactName={client.contactName}
            contactTitle={client.contactTitle}
            initials={client.initials}
            activeMatters={client.activeMatters}
            email={client.email}
            phone={client.phone}
            industry={client.industry}
            status={client.status}
            avatarUrl={client.avatarUrl}
            createdAt={client.createdAt}
            balance={client.balance}
          />
        ))}
      </section>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#c6c6ce]/30">
          <span className="text-[13px] text-[#46464d]">Page {page} of {totalPages}</span>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <button onClick={() => setPage(p => p - 1)} className="flex items-center gap-1 px-3 py-1.5 border border-[#c6c6ce]/50 text-[#0A1128] text-[11px] font-bold uppercase tracking-wider hover:bg-[#f8f9ff] transition-colors cursor-pointer">
                <ChevronLeft size={14} /> Prev
              </button>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 flex items-center justify-center text-[12px] font-bold transition-colors cursor-pointer ${p === page ? 'bg-[#0A1128] text-white' : 'border border-[#c6c6ce]/50 text-[#0A1128] hover:bg-[#f8f9ff]'}`}>
                {p}
              </button>
            ))}
            {page < totalPages && (
              <button onClick={() => setPage(p => p + 1)} className="flex items-center gap-1 px-3 py-1.5 border border-[#c6c6ce]/50 text-[#0A1128] text-[11px] font-bold uppercase tracking-wider hover:bg-[#f8f9ff] transition-colors cursor-pointer">
                Next <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
