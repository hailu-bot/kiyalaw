'use client';

import React from 'react';
import { Play, Pause, Settings, MoreHorizontal } from 'lucide-react';

interface AutomationWorkflowCardProps {
  workflow: {
    id: string;
    name: string;
    description: string;
    status: 'active' | 'paused' | 'draft';
    trigger: string;
    action: string;
    lastRun?: string;
  };
}

const statusStyles = {
  active: 'bg-[#D4AF37]/10 text-[#735c00] border-[#D4AF37]/30',
  paused: 'bg-[#eff4ff] text-[#46464d] border-[#c6c6ce]/50',
  draft: 'bg-[#f8f9ff] text-[#7c839f] border-[#c6c6ce]/30',
};

export default function AutomationWorkflowCard({ workflow }: AutomationWorkflowCardProps) {
  return (
    <div className="bg-white border border-[#c6c6ce]/40 p-5 hover:shadow-[0_4px_20px_rgba(10,17,40,0.06)] hover:border-[#D4AF37]/30 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-headline-sm text-[18px] font-bold text-[#0A1128] tracking-tight">{workflow.name}</h3>
            <span className={`px-2 py-0.5 font-label-sm text-[10px] font-bold uppercase tracking-widest border ${statusStyles[workflow.status]}`}>
              {workflow.status}
            </span>
          </div>
          <p className="font-body-md text-[14px] text-[#46464d]">{workflow.description}</p>
        </div>
        <button className="p-1.5 text-[#7c839f] hover:text-[#0A1128] opacity-0 group-hover:opacity-100 transition-all">
          <MoreHorizontal size={18} />
        </button>
      </div>

      <div className="flex items-center gap-4 text-[12px] font-label-md text-[#7c839f] mb-4">
        <span>Trigger: <span className="text-[#0A1128] font-semibold">{workflow.trigger}</span></span>
        <span>→</span>
        <span>Action: <span className="text-[#0A1128] font-semibold">{workflow.action}</span></span>
      </div>

      {workflow.lastRun && (
        <p className="font-label-sm text-[11px] text-[#7c839f] mb-4">Last run: {workflow.lastRun}</p>
      )}

      <div className="flex items-center gap-3 pt-4 border-t border-[#c6c6ce]/20">
        <button className="flex items-center gap-1.5 px-4 py-2 bg-[#0A1128] text-white font-label-md text-[11px] font-bold uppercase tracking-widest hover:bg-[#162244] transition-colors">
          {workflow.status === 'active' ? <><Pause size={14} /> Pause</> : <><Play size={14} /> {workflow.status === 'paused' ? 'Resume' : 'Activate'}</>}
        </button>
        <button className="flex items-center gap-1.5 px-4 py-2 border border-[#c6c6ce] text-[#46464d] font-label-md text-[11px] font-bold uppercase tracking-widest hover:bg-[#f8f9ff] transition-colors">
          <Settings size={14} />
          Configure
        </button>
      </div>
    </div>
  );
}
