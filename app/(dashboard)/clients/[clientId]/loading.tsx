export default function ClientDetailLoading() {
  return (
    <div className="px-margin-mobile md:px-margin-desktop py-8 max-w-container-max mx-auto w-full animate-pulse">
      <div className="h-5 w-48 bg-[#c6c6ce]/30 rounded mb-8" />
      <div className="bg-white border border-[#c6c6ce]/50 p-6 md:p-8 lg:p-10 mb-8">
        <div className="h-8 w-56 bg-[#c6c6ce]/30 rounded mb-4" />
        <div className="h-5 w-80 bg-[#c6c6ce]/20 rounded mb-6" />
        <div className="flex gap-6">
          <div className="h-20 w-36 bg-[#c6c6ce]/20 rounded" />
          <div className="h-20 w-36 bg-[#c6c6ce]/20 rounded" />
        </div>
      </div>
    </div>
  );
}
