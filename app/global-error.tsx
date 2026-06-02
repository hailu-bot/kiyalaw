'use client';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body className="bg-[#0A1128] text-white flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md p-8">
          <h1 className="text-headline-md font-headline-md text-[#D4AF37] mb-4">Something went wrong</h1>
          <p className="font-body-md text-[#94a3b8] mb-6">An unexpected error occurred. Please try again.</p>
          <button
            onClick={() => reset()}
            className="bg-[#D4AF37] text-[#0A1128] px-6 py-3 font-label-md uppercase tracking-wider hover:bg-[#e8c14a] transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}