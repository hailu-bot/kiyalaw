'use client';

import { useCallback } from 'react';
import { Search } from 'lucide-react';

export function FilterForm({ search, practiceArea, status }: { search?: string; practiceArea?: string; status?: string }) {
  const submit = useCallback(() => {
    const form = document.getElementById('matter-filter-form') as HTMLFormElement;
    form?.requestSubmit();
  }, []);

  return (
    <form method="GET" action="/matters" id="matter-filter-form">
      {search && <input type="hidden" name="search" value={search} />}

      {/* Practice Areas Filter */}
      <div className="bg-white border border-[#c6c6ce]/40 rounded-none p-6 shadow-[0_2px_10px_0_rgba(10,17,40,0.02)]">
        <h3 className="text-[12px] font-label-md uppercase tracking-widest text-[#0A1128] mb-5 font-bold">Practice Areas</h3>
        <ul className="space-y-3.5">
          {['Corporate', 'Litigation', 'Intellectual Property', 'Real Estate'].map((area) => {
            const checked = practiceArea?.split(',').includes(area) ?? false;
            return (
              <li key={area}>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="practiceArea"
                    value={area}
                    defaultChecked={checked}
                    onChange={submit}
                    className="w-4 h-4 text-[#0A1128] border-[#c6c6ce] rounded-sm focus:ring-[#D4AF37] accent-[#0A1128] cursor-pointer"
                  />
                  <span className="text-[15px] font-body-md text-[#46464d] group-hover:text-[#0A1128] transition-colors">{area}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Status Filter */}
      <div className="bg-white border border-[#c6c6ce]/40 rounded-none p-6 shadow-[0_2px_10px_0_rgba(10,17,40,0.02)]">
        <h3 className="text-[12px] font-label-md uppercase tracking-widest text-[#0A1128] mb-5 font-bold">Status</h3>
        <ul className="space-y-3.5">
          {[{ label: 'All Active', value: '' }, { label: 'Active', value: 'Active' }, { label: 'Pending', value: 'Pending' }, { label: 'Closed', value: 'Closed' }].map(({ label, value }) => (
            <li key={value}>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="status"
                  value={value}
                  defaultChecked={(status || '') === value}
                  onChange={submit}
                  className="w-4 h-4 text-[#0A1128] border-[#c6c6ce] focus:ring-[#D4AF37] accent-[#0A1128] cursor-pointer"
                />
                <span className="text-[15px] font-body-md text-[#46464d] group-hover:text-[#0A1128] transition-colors">{label}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </form>
  );
}

export function SearchInput({ defaultValue }: { defaultValue: string }) {
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    (e.target.form as HTMLFormElement)?.requestSubmit();
  }, []);

  return (
    <form method="GET" action="/matters" className="relative w-full md:w-64">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7c839f]" size={18} />
      <input
        name="search"
        defaultValue={defaultValue}
        className="w-full pl-10 pr-4 py-2.5 bg-[#eff4ff] border border-[#c6c6ce]/50 rounded text-[14px] font-body-md focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all placeholder:text-[#7c839f]"
        placeholder="Search matters..."
        type="text"
        onBlur={handleBlur}
      />
    </form>
  );
}