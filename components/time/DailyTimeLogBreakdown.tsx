'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type TimeEntry = {
  id: string;
  matterId: string;
  description: string;
  date: string;
  hours: number;
  rate: number;
  billable: boolean;
  category: string | null;
  attorneyName: string | null;
  notes: string | null;
  createdAt: string;
  matter: { title: string; clientName: string; matterCode: string };
};

type DailyMetrics = {
  dayTotal: number;
  billableTotal: number;
  nonBillableTotal: number;
  weekTotal: number;
  weekDays: { day: string; date: string; hours: number; today: boolean }[];
  entryCount: number;
  activeMatters: number;
  currentDate: string;
};

interface DailyTimeLogBreakdownProps {
  entries: TimeEntry[];
  metrics: DailyMetrics;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function DailyTimeLogBreakdown({ entries, metrics }: DailyTimeLogBreakdownProps) {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-headline-sm text-[28px] font-bold text-[#0A1128] mb-2">Daily Time Log</h1>
        <p className="font-body-md text-[15px] text-[#46464d]">Weekly breakdown of billable and non-billable time entries.</p>
      </div>

      <div className="bg-white border border-[#c6c6ce]/40 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-label-md text-[12px] font-bold uppercase tracking-widest text-[#46464d]">This Week</h3>
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-[#f8f9ff] transition-colors"><ChevronLeft size={18} /></button>
            <span className="font-label-md text-[13px] font-bold text-[#0A1128] px-4">{metrics.weekDays.length > 0 ? `${metrics.weekDays[0].date} – ${metrics.weekDays[metrics.weekDays.length - 1].date}` : '—'}</span>
            <button className="p-1.5 hover:bg-[#f8f9ff] transition-colors"><ChevronRight size={18} /></button>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {metrics.weekDays.map((day) => (
            <div
              key={day.day}
              className={`p-4 text-center border transition-all cursor-pointer ${
                day.today
                  ? 'bg-[#0A1128] text-white border-[#D4AF37]'
                  : 'bg-[#f8f9ff] border-[#c6c6ce]/30 hover:border-[#D4AF37]/50'
              }`}
            >
              <span className={`font-label-sm text-[11px] font-bold uppercase tracking-widest block ${
                day.today ? 'text-[#D4AF37]' : 'text-[#46464d]'
              }`}>
                {day.day}
              </span>
              <span className={`font-label-md text-[12px] block mt-1 ${
                day.today ? 'text-white/70' : 'text-[#7c839f]'
              }`}>
                {day.date}
              </span>
              <span className={`font-headline-sm text-[20px] font-bold block mt-2 ${
                day.today ? 'text-white' : 'text-[#0A1128]'
              }`}>
                {day.hours}h
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-[#0A1128] text-white p-6">
          <p className="font-label-sm text-[11px] text-[#D4AF37] uppercase tracking-widest font-bold mb-1">Total Hours</p>
          <p className="font-headline-sm text-[28px] font-bold">{metrics.dayTotal}h</p>
        </div>
        <div className="bg-[#f8f9ff] border border-[#c6c6ce]/30 p-6">
          <p className="font-label-sm text-[11px] text-[#46464d] uppercase tracking-widest font-bold mb-1">Billable</p>
          <p className="font-headline-sm text-[28px] font-bold text-[#0A1128]">{metrics.billableTotal}h</p>
        </div>
        <div className="bg-[#f8f9ff] border border-[#c6c6ce]/30 p-6">
          <p className="font-label-sm text-[11px] text-[#46464d] uppercase tracking-widest font-bold mb-1">Non-Billable</p>
          <p className="font-headline-sm text-[28px] font-bold text-[#0A1128]">{metrics.nonBillableTotal}h</p>
        </div>
      </div>

      <div className="bg-white border border-[#c6c6ce]/40">
        <div className="px-6 py-4 border-b border-[#c6c6ce]/20 bg-[#f8f9ff] flex items-center justify-between">
          <h3 className="font-label-md text-[12px] font-bold uppercase tracking-widest text-[#46464d]">
            Entries for {formatDate(metrics.currentDate)}
          </h3>
          <span className="font-label-sm text-[12px] text-[#46464d]">{metrics.entryCount} entries</span>
        </div>
        <div className="divide-y divide-[#c6c6ce]/20">
          {entries.length === 0 && (
            <div className="px-6 py-12 text-center font-body-md text-[#7c839f]">No time entries found.</div>
          )}
          {entries.map((entry) => (
            <Link key={entry.id} href={`/time/entries/${entry.id}`} className="px-6 py-4 flex items-center gap-4 hover:bg-[#f8f9ff] transition-colors block">
              <div className="flex-1">
                <p className="font-body-md text-[15px] text-[#0A1128] font-semibold">{entry.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-label-sm text-[11px] text-[#46464d]">{entry.matter.clientName}</span>
                  <span className="text-[#7c839f]">•</span>
                  <span className="font-label-sm text-[11px] text-[#46464d]">{entry.matter.title}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 font-label-sm text-[10px] font-bold uppercase tracking-widest ${
                  entry.billable
                    ? 'bg-[#D4AF37]/10 text-[#735c00] border border-[#D4AF37]/30'
                    : 'bg-[#eff4ff] text-[#46464d] border border-[#c6c6ce]/50'
                }`}>
                  {entry.billable ? 'Billable' : 'Non-Billable'}
                </span>
                <span className="font-headline-sm text-[18px] font-bold text-[#0A1128] w-16 text-right">{entry.hours}h</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
