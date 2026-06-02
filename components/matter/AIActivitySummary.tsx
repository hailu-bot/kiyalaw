'use client';

import React from 'react';
import { Clock, FileText, MessageSquare, Sparkles } from 'lucide-react';

const activities = [
  { id: '1', type: 'time', text: '2.5h logged on M&A Strategy — Horizon Capital Partners', time: '2h ago', icon: Clock },
  { id: '2', type: 'document', text: 'Mutual NDA drafted for TechNova Innovations', time: '4h ago', icon: FileText },
  { id: '3', type: 'message', text: 'Client comment added to IP Dispute matter', time: '1d ago', icon: MessageSquare },
  { id: '4', type: 'time', text: '1.75h — Court appearance recorded for Vanguard compliance', time: '1d ago', icon: Clock },
  { id: '5', type: 'document', text: 'MSJ template selected for ongoing litigation', time: '2d ago', icon: FileText },
];

export default function AIActivitySummary() {
  return (
    <div className="bg-white border border-[#c6c6ce]/40">
      <div className="px-6 py-5 border-b border-[#c6c6ce]/20 bg-[#f8f9ff] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-[#D4AF37]" />
          <h3 className="font-label-md text-[12px] font-bold uppercase tracking-widest text-[#0A1128]">AI Activity Summary</h3>
        </div>
        <span className="font-label-sm text-[11px] text-[#7c839f]">Today</span>
      </div>
      <div className="divide-y divide-[#c6c6ce]/20">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="px-6 py-4 flex items-start gap-4 hover:bg-[#f8f9ff] transition-colors">
              <div className="w-8 h-8 bg-[#eff4ff] text-[#735c00] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body-md text-[14px] text-[#0A1128]">{activity.text}</p>
                <span className="font-label-sm text-[11px] text-[#7c839f]">{activity.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
