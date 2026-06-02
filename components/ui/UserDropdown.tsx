'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Settings, LogOut, X } from 'lucide-react';
import { signOut } from '@/app/actions/authActions';

export default function UserDropdown() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close menu' : 'Open user menu'}
        className="w-8 h-8 rounded-full bg-[#0A1128] flex items-center justify-center font-bold text-[11px] text-white shadow-sm hover:brightness-110 transition-all shrink-0"
      >
        {open ? <X size={14} className="text-white" /> : 'KL'}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-[#c6c6ce]/30 shadow-lg z-50">
          <button
            onClick={() => { setOpen(false); router.push('/settings?tab=account'); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-[500] text-[#0A1128] hover:bg-[#f8f9ff] transition-colors text-left"
          >
            <User size={16} />
            Profile
          </button>
          <button
            onClick={() => { setOpen(false); router.push('/settings'); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-[500] text-[#0A1128] hover:bg-[#f8f9ff] transition-colors text-left"
          >
            <Settings size={16} />
            Settings
          </button>
          <div className="border-t border-[#c6c6ce]/20" />
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-[500] text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors text-left"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
