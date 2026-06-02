'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, Clock, FileText, Paperclip } from 'lucide-react';

type Activity = {
  id: string;
  type: string;
  description: string;
  createdAt: string;
};

function activityIcon(type: string) {
  switch (type) {
    case 'time':
      return <Clock size={20} />;
    case 'document':
      return <FileText size={20} />;
    default:
      return <Paperclip size={20} />;
  }
}

function activityBadge(type: string) {
  switch (type) {
    case 'time':
      return 'bg-[#D4AF37]/10 text-[#735c00] border border-[#D4AF37]/30';
    case 'document':
      return 'bg-[#eff4ff] text-[#46464d] border border-[#c6c6ce]/40';
    default:
      return 'bg-[#eff4ff] text-[#46464d] border border-[#c6c6ce]/40';
  }
}

export default function MatterTimeline({ activities }: { activities: Activity[] }) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filtered = useMemo(() => {
    let result = activities;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(a => a.description.toLowerCase().includes(q));
    }
    if (typeFilter) {
      result = result.filter(a => a.type === typeFilter);
    }
    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      result = result.filter(a => new Date(a.createdAt).getTime() >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime() + 86400000;
      result = result.filter(a => new Date(a.createdAt).getTime() <= to);
    }
    return result;
  }, [activities, search, typeFilter, dateFrom, dateTo]);

  return (
    <>
      <div className="bg-white border border-[#c6c6ce]/40 p-4 flex flex-col md:flex-row gap-4 items-center rounded-none shadow-sm">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7c839f]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-b border-[#c6c6ce]/50 bg-transparent focus:border-[#D4AF37] focus:ring-0 text-[15px] font-body-md placeholder-[#7c839f] transition-colors outline-none"
            placeholder="Search activity log..."
            type="text"
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            aria-label="Filter by activity type"
            className="border-b border-[#c6c6ce]/50 bg-transparent py-2 pr-8 focus:border-[#D4AF37] outline-none text-[14px] font-label-md text-[#46464d] cursor-pointer"
          >
            <option value="">All Types</option>
            <option value="time">Time Entry</option>
            <option value="document">Document Drafted</option>
          </select>
          <button
            onClick={() => setShowMoreFilters(p => !p)}
            className="flex items-center gap-2 text-[13px] font-label-md font-bold text-[#0A1128] uppercase tracking-wider px-4 py-2 hover:bg-[#f8f9ff] transition-colors whitespace-nowrap rounded-none"
          >
            <Filter size={16} />
            {showMoreFilters ? 'Hide Filters' : 'More Filters'}
          </button>
        </div>
      </div>

      {showMoreFilters && (
        <div className="bg-white border border-[#c6c6ce]/40 p-4 flex flex-col sm:flex-row gap-4 items-center rounded-none shadow-sm">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-[11px] font-bold uppercase tracking-widest text-[#46464d]">From</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="border border-[#c6c6ce]/50 px-3 py-1.5 text-[13px] font-body-md outline-none focus:border-[#D4AF37]" />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-[11px] font-bold uppercase tracking-widest text-[#46464d]">To</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="border border-[#c6c6ce]/50 px-3 py-1.5 text-[13px] font-body-md outline-none focus:border-[#D4AF37]" />
          </div>
          {(dateFrom || dateTo || search || typeFilter) && (
            <button onClick={() => { setSearch(''); setTypeFilter(''); setDateFrom(''); setDateTo(''); }}
              className="text-[11px] font-bold uppercase tracking-widest text-[#D4AF37] hover:underline ml-auto">
              Clear filters
            </button>
          )}
        </div>
      )}

      <div className="relative py-8">
        <div className="absolute top-0 bottom-0 left-[28px] md:left-1/2 w-0.5 bg-[#c6c6ce]/40 md:-translate-x-1/2 z-0"></div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-[#7c839f] font-body-md">
            {activities.length === 0 ? 'No activities recorded yet.' : 'No activities match your filters.'}
          </div>
        )}

        {filtered.map((activity, index) => {
          const isLeft = index % 2 === 0;
          return (
            <div key={activity.id} className={`relative flex ${isLeft ? 'justify-end' : 'justify-start'} w-full mb-12 group`}>
              <div className={`absolute left-[8px] md:left-1/2 top-4 w-11 h-11 ${activity.type === 'time' ? 'bg-[#0A1128] text-[#D4AF37]' : 'bg-[#eff4ff] text-[#46464d]'} rounded-full flex items-center justify-center md:-translate-x-1/2 z-10 border-4 border-background shadow-md`}>
                {activityIcon(activity.type)}
              </div>

              <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] ${isLeft ? '' : 'ml-auto md:ml-0'} bg-white p-6 border border-[#c6c6ce]/40 shadow-sm hover:shadow-md transition-shadow rounded-none relative`}>
                <div className={`hidden md:block absolute top-7 ${isLeft ? '-left-2 border-b border-l' : '-right-2 border-t border-r'} w-4 h-4 bg-white border-[#c6c6ce]/40 rotate-45`}></div>
                {!isLeft && (
                  <div className="md:hidden absolute top-7 -left-2 w-4 h-4 bg-white border-b border-l border-[#c6c6ce]/40 rotate-45"></div>
                )}

                <div className="flex justify-between items-start mb-4">
                  <div className="text-[12px] font-label-md text-[#7c839f] uppercase tracking-wider font-semibold">
                    {new Date(activity.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm ${activityBadge(activity.type)}`}>
                    {activity.type === 'time' ? 'Billed' : activity.type === 'document' ? 'Draft' : 'Note'}
                  </span>
                </div>
                <h3 className="text-[22px] font-headline-sm font-bold text-[#0A1128] mb-2 tracking-tight">{activity.type}</h3>
                <p className="text-[15px] font-body-md text-[#46464d] mb-6 leading-relaxed">
                  {activity.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
