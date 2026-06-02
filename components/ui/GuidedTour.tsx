'use client';

import { useEffect, useCallback, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Joyride, STATUS } from 'react-joyride';
import { useOnboardingStore } from '@/lib/store/useOnboardingStore';
import { TOURS, TOUR_LOCALE } from '@/lib/onboarding/tours';
import { HelpCircle } from 'lucide-react';

const AUTH_PATHS = ['/login', '/register', '/mfa', '/forgot-password', '/help'];

export default function GuidedTour() {
  const pathname = usePathname();
  const { activeTour, showPrompt, completeTour, runTour, showTourPrompt, dismissPrompt } = useOnboardingStore();
  const [helpBtn, setHelpBtn] = useState(false);

  const isAuthPath = AUTH_PATHS.includes(pathname);
  const steps = TOURS[pathname] ?? [];

  useEffect(() => {
    if (!isAuthPath && steps.length > 0 && !useOnboardingStore.getState().completedTours[pathname]) {
      showTourPrompt(pathname);
    }
  }, [pathname, steps.length, isAuthPath, showTourPrompt]);

  const handleJoyrideCallback = useCallback((data: { status: string }) => {
    if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
      completeTour(pathname);
    }
  }, [pathname, completeTour]);

  const isRunning = activeTour === pathname;

  if (isAuthPath) return null;

  return (
    <>
      {showPrompt === pathname && steps.length > 0 && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#0A1128] text-white px-6 py-4 shadow-2xl flex items-center gap-4 border border-[#D4AF37]/30 animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-sm font-body-md">Explore this screen? Get a quick guided tour.</p>
          <button
            onClick={() => { dismissPrompt(); runTour(pathname); }}
            className="px-4 py-1.5 bg-[#D4AF37] text-[#0A1128] text-xs font-bold uppercase tracking-wider hover:bg-[#e0c04b] transition-colors"
          >
            Start Tour
          </button>
          <button
            onClick={() => { dismissPrompt(); completeTour(pathname); }}
            className="px-3 py-1.5 text-[#9ca3af] text-xs hover:text-white transition-colors"
          >
            Skip
          </button>
        </div>
      )}

      {isRunning && steps.length > 0 && (
        <Joyride
          steps={steps}
          run={isRunning}
          continuous
          locale={TOUR_LOCALE}
          options={{ primaryColor: '#D4AF37', buttons: ['back', 'close', 'primary', 'skip'] }}
          onEvent={handleJoyrideCallback}
          styles={{
            tooltip: {
              borderRadius: 0,
              fontSize: 14,
              padding: 20,
              backgroundColor: '#ffffff',
              color: '#0A1128',
            },
            tooltipContainer: {
              textAlign: 'left',
            },
            buttonPrimary: {
              backgroundColor: '#0A1128',
              borderRadius: 0,
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '8px 16px',
              color: '#ffffff',
            },
            buttonBack: {
              color: '#46464d',
              fontSize: 12,
              fontWeight: 600,
            },
            buttonSkip: {
              color: '#9ca3af',
              fontSize: 12,
            },
            overlay: {
              backgroundColor: 'rgba(10, 17, 40, 0.5)',
            },
          }}
        />
      )}

      {steps.length > 0 && (
        <button
          onClick={() => runTour(pathname)}
          onMouseEnter={() => setHelpBtn(true)}
          onMouseLeave={() => setHelpBtn(false)}
          className="fixed bottom-6 right-6 z-50 w-10 h-10 flex items-center justify-center bg-[#0A1128] text-[#D4AF37] border border-[#D4AF37]/40 shadow-lg hover:bg-[#D4AF37] hover:text-[#0A1128] transition-all duration-200"
          title="Replay tour"
        >
          <HelpCircle size={helpBtn ? 22 : 20} />
        </button>
      )}
    </>
  );
}
