'use client';

import React from 'react';
import { LayoutDashboard, Briefcase, Wallet, Receipt, FileText, Users, HelpCircle, LogOut, Building2, Bot, Settings, Clock, User, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '../../lib/store/useUIStore';
import { useAuth } from '../auth/AuthProvider';
import { signOut } from '@/app/actions/authActions';
import { useTheme } from '../ui/ThemeProvider';

export default function Sidebar() {
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className={`flex flex-col bg-[#0A1128] text-on-primary h-screen shadow-[4px_0_24px_rgba(10,17,40,0.2)] z-40 fixed left-0 top-0 transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>

      {/* Top Branding Section */}
      <div className={`px-6 pt-8 pb-6 flex flex-col ${sidebarCollapsed ? 'items-center justify-center' : ''}`}>
        {sidebarCollapsed ? (
          <Building2 size={32} className="text-[#D4AF37]" />
        ) : (
          <>
            <h1 className="text-headline-sm font-headline-sm text-on-primary tracking-tighter">Kiya Law</h1>
            <p className="text-label-sm font-label-sm text-[#7c839f] mt-1">Legal Excellence</p>
          </>
        )}
      </div>

      {/* Action Button Section */}
      <div className={`px-4 mb-2 flex ${sidebarCollapsed ? 'items-center justify-center' : ''}`}>
        <Link
          href="/billing/new"
          className={`w-full bg-[#D4AF37] text-[#241a00] font-label-md text-label-md uppercase py-3 rounded hover:bg-[#ffe088] transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${sidebarCollapsed ? 'h-12 rounded-full px-0' : ''}`}
        >
          {sidebarCollapsed ? (
            <span className="text-[20px] font-bold">$</span>
          ) : (
            'Create Invoice'
          )}
        </Link>
      </div>

      {/* Middle Scrollable Section */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pt-4">
        <ul className="flex flex-col gap-2">
          <SidebarNavItem icon={LayoutDashboard} label="Dashboard" href="/" isCollapsed={sidebarCollapsed} isActive={pathname === '/'} />
          <SidebarNavItem icon={Briefcase} label="Matters" href="/matters" isCollapsed={sidebarCollapsed} isActive={pathname.startsWith('/matters')} />
          <SidebarNavItem icon={Wallet} label="Billing" href="/billing" isCollapsed={sidebarCollapsed} isActive={pathname.startsWith('/billing')} />
          <SidebarNavItem icon={Receipt} label="Expenses" href="/expenses" isCollapsed={sidebarCollapsed} isActive={pathname.startsWith('/expenses')} />
          <SidebarNavItem icon={FileText} label="Documents" href="/documents" isCollapsed={sidebarCollapsed} isActive={pathname.startsWith('/documents')} />
          <SidebarNavItem icon={Users} label="Clients" href="/clients" isCollapsed={sidebarCollapsed} isActive={pathname.startsWith('/clients')} />
          <SidebarNavItem icon={Clock} label="AI Time Logger" href="/time/ai-logger" isCollapsed={sidebarCollapsed} isActive={pathname.startsWith('/time/ai-logger')} />
          <SidebarNavItem icon={Bot} label="Automation Hub" href="/automation" isCollapsed={sidebarCollapsed} isActive={pathname.startsWith('/automation')} />
        </ul>
      </div>

      {/* User Info + Pinned Bottom Section */}
      <div className="mt-auto border-t border-white/5 pt-3 pb-1 bg-[#0A1128]">

        {/* User info — compact avatar row */}
        {!sidebarCollapsed && !loading && user && (
          <div className="px-4 pb-2 mb-2 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 shrink-0 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                <User size={13} className="text-[#D4AF37]" />
              </div>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="text-[12px] text-white truncate font-medium">{user.user_metadata?.full_name || user.email}</p>
                <p className="text-[10px] text-[#7c839f] truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        <ul className="flex flex-col gap-0.5">
          <SidebarNavItem icon={Settings} label="Settings" href="/settings" isCollapsed={sidebarCollapsed} isActive={pathname.startsWith('/settings')} compact />
          <SidebarNavItem icon={HelpCircle} label="Help Center" href="/help" isCollapsed={sidebarCollapsed} compact />
          <li>
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-4 py-2 transition-all duration-150 rounded w-full text-left cursor-pointer ${sidebarCollapsed ? 'justify-center px-0 w-12 mx-auto h-10' : 'px-4 mx-2 w-auto'} text-[#7c839f] hover:bg-[#162244] hover:text-white`}
            >
              {theme === 'dark' ? (
                <svg className={sidebarCollapsed ? 'w-5 h-5' : 'w-4 h-4'} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                </svg>
              ) : (
                <svg className={sidebarCollapsed ? 'w-5 h-5' : 'w-4 h-4'} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                </svg>
              )}
              <span className={`font-label-md text-label-md transition-all duration-300 whitespace-nowrap overflow-hidden ${sidebarCollapsed ? 'opacity-0 max-w-0' : 'opacity-100 max-w-[150px]'}`}>
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>
          </li>
          <li>
            <form action={async () => {
              try { await signOut(); } catch (e) { console.error('Sign out failed:', e); }
            }}>
              <button type="submit" className={`flex items-center gap-4 py-2 transition-all duration-150 rounded w-full text-left cursor-pointer ${sidebarCollapsed ? 'justify-center px-0 w-12 mx-auto h-10' : 'px-4 mx-2 w-auto'} text-[#7c839f] hover:bg-[#162244] hover:text-white`}>
                <LogOut size={sidebarCollapsed ? 20 : 16} />
                <span className={`font-label-md text-label-md transition-all duration-300 whitespace-nowrap overflow-hidden ${sidebarCollapsed ? 'opacity-0 max-w-0' : 'opacity-100 max-w-[150px]'}`}>
                  Log Out
                </span>
              </button>
            </form>
          </li>
        </ul>

        {/* Collapse toggle */}
        <div className="border-t border-white/5 mt-2 pt-1 px-3 pb-2">
          <button
            onClick={() => useUIStore.getState().toggleSidebar()}
            className="flex items-center justify-center w-full py-1.5 rounded text-[#7c839f] hover:bg-[#162244] hover:text-white transition-all duration-150 cursor-pointer"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            <span className={`ml-2 text-[11px] font-label-md transition-all duration-300 whitespace-nowrap overflow-hidden ${sidebarCollapsed ? 'opacity-0 max-w-0 ml-0' : 'opacity-100 max-w-[120px]'}`}>
              Collapse
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}

interface SidebarNavItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  isCollapsed: boolean;
  isActive?: boolean;
  compact?: boolean;
}

function SidebarNavItem({ icon: Icon, label, href, isCollapsed, isActive, compact }: SidebarNavItemProps) {
  const padY = compact ? 'py-2' : 'py-3';
  const h = compact ? 'h-10' : 'h-12';
  const iconSize = isCollapsed ? (compact ? 20 : 24) : (compact ? 16 : 20);
  return (
    <li>
      <Link href={href} className={`flex items-center gap-4 ${padY} transition-all duration-150 rounded ${isCollapsed ? `justify-center px-0 w-12 mx-auto ${h}` : 'px-4 mx-2 w-auto'} ${isActive ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-l-4 border-[#D4AF37] font-bold' : 'text-[#7c839f] hover:bg-[#162244] hover:text-white'}`}>
        <Icon size={iconSize} className={isActive ? 'text-[#D4AF37]' : ''} />
        <span className={`font-label-md text-label-md transition-all duration-300 whitespace-nowrap overflow-hidden ${isCollapsed ? 'opacity-0 max-w-0' : 'opacity-100 max-w-[150px]'}`}>
          {label}
        </span>
      </Link>
    </li>
  );
}
