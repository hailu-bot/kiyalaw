'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import ToastContainer from '../ui/ToastContainer';
import AgentSuggestionPanel from '../ai/AgentSuggestionPanel';
import GuidedTour from '../ui/GuidedTour';
import CommandPalette from '../ui/CommandPalette';
import ErrorBoundary from '../ui/ErrorBoundary';
import { useUIStore } from '../../lib/store/useUIStore';

const authPaths = ['/login', '/register', '/mfa', '/forgot-password', '/help'];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const isAiPanelOpen = useUIStore((state) => state.isAiPanelOpen);
  const toggleAiPanel = useUIStore((state) => state.toggleAiPanel);

  if (authPaths.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen w-full bg-[#0A1128]">
      <Sidebar />
      <TopNav />
      <main
        className={`
          flex-1 flex flex-col h-screen overflow-y-auto
          transition-all duration-300 relative
          bg-gradient-to-br from-white via-[#f8f9ff] to-[#e6ecf5]
          dark:bg-gradient-to-br dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#0f172a]
          ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}
        `}
      >
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <ToastContainer />
        <GuidedTour />
      </main>

      <CommandPalette />

      <button
        onClick={toggleAiPanel}
        className="fixed bottom-6 right-6 z-50 bg-[#0A1128] text-white p-3 shadow-lg hover:bg-[#162244] transition-colors cursor-pointer"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
        </svg>
      </button>

      {isAiPanelOpen && (
        <div className="fixed bottom-24 right-6 z-50">
          <AgentSuggestionPanel />
        </div>
      )}
    </div>
  );
}
