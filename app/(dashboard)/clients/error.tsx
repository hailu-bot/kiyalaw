'use client';

export default function ClientsError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="px-margin-mobile md:px-margin-desktop py-8 max-w-container-max mx-auto w-full">
      <div className="bg-[#fef2f2] border border-[#fecaca] p-8 text-center">
        <h2 className="font-headline-sm text-headline-sm text-[#b91c1c] mb-2">Failed to load clients</h2>
        <p className="font-body-md text-body-md text-[#7f1d1d] mb-4">{error.message}</p>
        <button onClick={reset} className="bg-[#b91c1c] text-white px-6 py-2 font-label-sm text-label-sm uppercase tracking-wider hover:bg-[#991b1b] transition-colors cursor-pointer">
          Try again
        </button>
      </div>
    </div>
  );
}
