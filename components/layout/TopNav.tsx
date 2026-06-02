'use client';

import React, { useState } from 'react';
import { Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUIStore } from '../../lib/store/useUIStore';
import UserDropdown from '../ui/UserDropdown';

export default function TopNav() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const [pillOpen, setPillOpen] = useState(false);

  return (
    <>
      <button
        onClick={toggleSidebar}
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className={`
          fixed top-4 z-50 flex items-center justify-center
          w-9 h-9 rounded-full
          bg-surface/90 backdrop-blur-md
          border border-outline-variant
          shadow-md
          hover:border-[#D4AF37] hover:bg-[#F8FAFC] dark:hover:bg-slate-800
          transition-all duration-200
          focus:outline-none
          ${sidebarCollapsed ? 'left-[84px]' : 'left-[268px]'}
        `}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-4 h-4 text-on-surface-variant hover:text-[#D4AF37] transition-colors" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-on-surface-variant hover:text-[#D4AF37] transition-colors" />
        )}
      </button>

      <div
        className={`
          fixed top-4 right-4 z-50
          flex items-center gap-2
          bg-surface/90 backdrop-blur-md
          border border-outline-variant
          shadow-md rounded-full
          transition-all duration-300 ease-in-out
          overflow-hidden
          ${pillOpen ? 'px-3 py-2' : 'p-1'}
        `}
      >
        {pillOpen && (
          <>
            <button
              className="p-1.5 rounded-full text-on-surface-variant hover:text-[#D4AF37] hover:bg-surface-container-low transition-all"
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>
            <div className="w-[1px] h-5 bg-outline-variant/60 mx-1" />
            <UserDropdown />
          </>
        )}

        {!pillOpen && (
          <button
            onClick={() => setPillOpen(true)}
            aria-label="Open user menu"
            className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center font-bold text-[11px] text-on-primary shadow-sm hover:brightness-110 transition-all shrink-0"
          >
            KL
          </button>
        )}
        {pillOpen && (
          <button
            onClick={() => setPillOpen(false)}
            aria-label="Close menu"
            className="w-8 h-8 rounded-full bg-[#0A1128] flex items-center justify-center font-bold text-[11px] text-white shadow-sm hover:brightness-110 transition-all shrink-0"
          >
            <ChevronRight size={14} className="text-white" />
          </button>
        )}
      </div>
    </>
  );
}
