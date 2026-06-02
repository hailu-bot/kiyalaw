import { create } from 'zustand';
import React from 'react';

interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  topNavContent: React.ReactNode | null;
  setTopNavContent: (content: React.ReactNode | null) => void;
  isAiPanelOpen: boolean;
  toggleAiPanel: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  topNavContent: null,
  setTopNavContent: (content) => set({ topNavContent: content }),
  isAiPanelOpen: false,
  toggleAiPanel: () => set((state) => ({ isAiPanelOpen: !state.isAiPanelOpen })),
}));