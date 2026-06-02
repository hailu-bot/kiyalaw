'use client';

export default function SettingsError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="text-center max-w-md p-8">
        <h1 className="text-headline-md font-headline-md text-[#D4AF37] mb-4">Settings Error</h1>
        <p className="font-body-md text-[#46464d] mb-6">Failed to load settings. Please try again.</p>
        <button
          onClick={() => reset()}
          className="bg-[#D4AF37] text-[#0A1128] px-6 py-3 font-label-md uppercase tracking-wider hover:bg-[#e8c14a] transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}