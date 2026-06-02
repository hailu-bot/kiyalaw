export default function AutomationLoading() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        <p className="font-body-md text-[#76767e]">Loading automation hub...</p>
      </div>
    </div>
  );
}