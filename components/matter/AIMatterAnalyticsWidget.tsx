'use client';

import React from 'react';
import { Clock, AlertTriangle, Calendar } from 'lucide-react';

const analytics = {
  billableHours: 142.5,
  targetHours: 180,
  upcomingDeadlines: 4,
  riskFlags: 2,
  utilization: 79,
};

export default function AIMatterAnalyticsWidget() {
  return (
    <div className="bg-[#0A1128] text-white border border-[#162244]">
      <div className="px-6 py-5 border-b border-[#162244]">
        <h3 className="font-label-md text-[12px] font-bold uppercase tracking-widest text-[#D4AF37]">Matter Analytics</h3>
      </div>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center">
              <Clock size={20} />
            </div>
            <div>
              <p className="font-label-sm text-[11px] text-[#7c839f] uppercase tracking-widest font-bold">Billable Hours</p>
              <p className="font-headline-sm text-[22px] font-bold">{analytics.billableHours}h</p>
            </div>
          </div>
          <span className="font-label-sm text-[11px] text-[#735c00] bg-[#D4AF37]/10 px-2 py-1">
            {analytics.utilization}%
          </span>
        </div>

        <div className="h-2 bg-[#162244] overflow-hidden">
          <div className="h-full bg-[#D4AF37] transition-all" style={{ width: `${analytics.utilization}%` }}></div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex items-start gap-3">
            <Calendar size={18} className="text-[#D4AF37] mt-0.5" />
            <div>
              <p className="font-label-sm text-[11px] text-[#7c839f] uppercase tracking-widest font-bold">Deadlines</p>
              <p className="font-headline-sm text-[20px] font-bold">{analytics.upcomingDeadlines}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-red-400 mt-0.5" />
            <div>
              <p className="font-label-sm text-[11px] text-[#7c839f] uppercase tracking-widest font-bold">Risk Flags</p>
              <p className="font-headline-sm text-[20px] font-bold">{analytics.riskFlags}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
