export function ListLoading({ rows = 3 }: { rows?: number }) {
  return (
    <div className="w-full animate-pulse space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-white border border-[#c6c6ce]/40 p-6">
          <div className="h-5 w-1/3 bg-[#c6c6ce]/30 mb-3" />
          <div className="h-4 w-2/3 bg-[#c6c6ce]/20 mb-2" />
          <div className="h-4 w-1/4 bg-[#c6c6ce]/20" />
        </div>
      ))}
    </div>
  );
}

export function DetailLoading() {
  return (
    <div className="w-full animate-pulse">
      <div className="h-8 w-1/3 bg-[#c6c6ce]/30 rounded mb-4" />
      <div className="h-5 w-1/2 bg-[#c6c6ce]/20 rounded mb-8" />
      <div className="bg-white border border-[#c6c6ce]/40 p-6">
        <div className="h-6 w-1/4 bg-[#c6c6ce]/30 rounded mb-6" />
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="h-20 bg-[#c6c6ce]/20 rounded" />
          <div className="h-20 bg-[#c6c6ce]/20 rounded" />
        </div>
        <div className="h-40 bg-[#c6c6ce]/20 rounded" />
      </div>
    </div>
  );
}

export function FormLoading() {
  return (
    <div className="w-full animate-pulse">
      <div className="h-8 w-1/3 bg-[#c6c6ce]/30 rounded mb-4" />
      <div className="h-5 w-1/2 bg-[#c6c6ce]/20 rounded mb-8" />
      <div className="bg-white border border-[#c6c6ce]/40 p-6">
        <div className="h-5 w-1/4 bg-[#c6c6ce]/30 rounded mb-3" />
        <div className="h-10 w-full bg-[#c6c6ce]/20 rounded mb-6" />
        <div className="h-5 w-1/4 bg-[#c6c6ce]/30 rounded mb-3" />
        <div className="h-10 w-full bg-[#c6c6ce]/20 rounded mb-6" />
        <div className="h-5 w-1/4 bg-[#c6c6ce]/30 rounded mb-3" />
        <div className="h-32 w-full bg-[#c6c6ce]/20 rounded mb-6" />
        <div className="h-10 w-40 bg-[#c6c6ce]/30 rounded ml-auto" />
      </div>
    </div>
  );
}
