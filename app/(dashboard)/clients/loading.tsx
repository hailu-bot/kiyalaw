export default function ClientsLoading() {
  return (
    <div className="px-margin-mobile md:px-margin-desktop py-8 max-w-container-max mx-auto w-full animate-pulse">
      <div className="h-8 w-48 bg-[#c6c6ce]/30 rounded mb-2" />
      <div className="h-5 w-72 bg-[#c6c6ce]/20 rounded mb-12" />
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-gutter">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white border border-[#c6c6ce]/50 p-6">
            <div className="h-4 w-24 bg-[#c6c6ce]/30 rounded mb-3" />
            <div className="h-6 w-40 bg-[#c6c6ce]/20 rounded mb-2" />
            <div className="h-4 w-32 bg-[#c6c6ce]/20 rounded mb-6" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-[#c6c6ce]/20 rounded" />
              <div className="h-10 bg-[#c6c6ce]/20 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
