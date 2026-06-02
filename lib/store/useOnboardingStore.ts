'use client';

import { create } from 'zustand';

interface OnboardingState {
  completedTours: Record<string, boolean>;
  activeTour: string | null;
  showPrompt: string | null;
  completeTour: (path: string) => void;
  runTour: (path: string) => void;
  showTourPrompt: (path: string) => void;
  dismissPrompt: () => void;
  isTourComplete: (path: string) => boolean;
}

function loadCompleted(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem('kiya-completed-tours') ?? '{}');
  } catch {
    return {};
  }
}

function saveCompleted(tours: Record<string, boolean>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('kiya-completed-tours', JSON.stringify(tours));
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  completedTours: loadCompleted(),
  activeTour: null,
  showPrompt: null,
  completeTour: (path: string) => {
    const updated = { ...get().completedTours, [path]: true };
    saveCompleted(updated);
    set({ completedTours: updated, activeTour: null, showPrompt: null });
  },
  runTour: (path: string) => set({ activeTour: path, showPrompt: null }),
  showTourPrompt: (path: string) => {
    const completed = get().completedTours[path];
    if (!completed) set({ showPrompt: path });
  },
  dismissPrompt: () => set({ showPrompt: null }),
  isTourComplete: (path: string) => !!get().completedTours[path],
}));
