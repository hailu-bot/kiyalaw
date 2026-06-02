'use client';

import React from 'react';
import { Clock, User, Briefcase, Calendar, FileText, Edit3, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type TimeEntryData = {
  id: string;
  matterId: string;
  clientId: string | null;
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

interface TimeEntryDetailProps {
  entry: TimeEntryData;
}

export default function TimeEntryDetail({ entry }: TimeEntryDetailProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/time" className="inline-flex items-center gap-2 text-[#46464d] hover:text-[#0A1128] transition-colors mb-8 font-label-md text-[13px] font-bold uppercase tracking-wider">
        <ArrowLeft size={18} />
        Back to Time Logger
      </Link>

      <div className="bg-white border border-[#c6c6ce]/40 shadow-[0_2px_10px_0_rgba(10,17,40,0.02)] p-8 md:p-10 relative overflow-hidden mb-8">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#D4AF37]"></div>

        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Clock size={18} className="text-[#735c00]" />
              <span className="text-[12px] font-label-md uppercase tracking-widest text-[#46464d] font-bold">Time Entry</span>
              <span className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest ${entry.billable ? 'bg-[#D4AF37]/10 text-[#735c00] border border-[#D4AF37]/30' : 'bg-[#eff4ff] text-[#46464d] border border-[#c6c6ce]/40'}`}>
                {entry.billable ? 'Billable' : 'Non-Billable'}
              </span>
            </div>
            <h1 className="text-[28px] md:text-[32px] font-headline-md font-bold text-[#0A1128] mb-3 tracking-tight leading-none">
              {entry.description}
            </h1>
          </div>
          <div className="text-right hidden md:block">
            <span className="font-label-sm text-[12px] text-[#46464d] block mb-1">REFERENCE NO.</span>
            <span className="font-label-md text-[13px] text-[#0A1128] tracking-widest font-bold">{entry.id.slice(0, 8).toUpperCase()}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#f8f9ff] border border-[#c6c6ce]/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <User size={16} className="text-[#7c839f]" />
              <span className="font-label-sm text-[11px] font-bold uppercase tracking-widest text-[#46464d]">Attorney</span>
            </div>
            <p className="font-body-md text-[15px] text-[#0A1128] font-semibold">{entry.attorneyName || '—'}</p>
          </div>
          <div className="bg-[#f8f9ff] border border-[#c6c6ce]/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase size={16} className="text-[#7c839f]" />
              <span className="font-label-sm text-[11px] font-bold uppercase tracking-widest text-[#46464d]">Client</span>
            </div>
            {entry.clientId ? (
              <Link href={`/clients/${entry.clientId}`} className="font-body-md text-[15px] text-[#0A1128] font-semibold hover:text-[#D4AF37] transition-colors">{entry.matter.clientName}</Link>
            ) : (
              <p className="font-body-md text-[15px] text-[#0A1128] font-semibold">{entry.matter.clientName}</p>
            )}
          </div>
          <div className="bg-[#f8f9ff] border border-[#c6c6ce]/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} className="text-[#7c839f]" />
              <span className="font-label-sm text-[11px] font-bold uppercase tracking-widest text-[#46464d]">Date</span>
            </div>
            <p className="font-body-md text-[15px] text-[#0A1128] font-semibold">
              {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="bg-[#f8f9ff] border border-[#c6c6ce]/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-[#7c839f]" />
              <span className="font-label-sm text-[11px] font-bold uppercase tracking-widest text-[#46464d]">Duration</span>
            </div>
            <p className="font-body-md text-[15px] text-[#0A1128] font-semibold">{entry.hours} hours</p>
          </div>
        </div>

        <div className="border-t border-[#c6c6ce]/30 pt-6">
          <div className="bg-[#f8f9ff] border border-[#c6c6ce]/30 p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={16} className="text-[#7c839f]" />
              <span className="font-label-sm text-[11px] font-bold uppercase tracking-widest text-[#46464d]">Task Category</span>
            </div>
            <p className="font-body-md text-[15px] text-[#0A1128] font-semibold">{entry.category || '—'}</p>
          </div>
          <div className="bg-[#f8f9ff] border border-[#c6c6ce]/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase size={16} className="text-[#7c839f]" />
              <span className="font-label-sm text-[11px] font-bold uppercase tracking-widest text-[#46464d]">Matter</span>
            </div>
            <Link href={`/matters/${entry.matterId}`} className="font-body-md text-[15px] text-[#0A1128] font-semibold hover:text-[#D4AF37] transition-colors">{entry.matter.title}</Link>
          </div>
        </div>

        <div className="flex gap-4 mt-8 pt-6 border-t border-[#c6c6ce]/30">
          <Link
            href={`/time/entries/${entry.id}/edit`}
            className="flex items-center gap-2 bg-[#0A1128] text-white font-label-md text-[13px] font-bold uppercase tracking-wider px-6 py-3 hover:bg-[#162244] transition-colors shadow-md"
          >
            <Edit3 size={16} />
            Edit Entry
          </Link>
        </div>
      </div>
    </div>
  );
}
