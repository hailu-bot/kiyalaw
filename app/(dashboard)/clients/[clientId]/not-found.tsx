import Link from "next/link";

export default function ClientNotFound() {
  return (
    <div className="px-margin-mobile md:px-margin-desktop py-8 max-w-container-max mx-auto w-full">
      <div className="bg-[#f8f9ff] border border-[#c6c6ce]/30 p-8 text-center">
        <h2 className="font-headline-sm text-headline-sm text-[#0A1128] mb-2">Client Not Found</h2>
        <p className="font-body-md text-body-md text-[#46464d] mb-4">The client you are looking for does not exist or has been removed.</p>
        <Link href="/clients" className="inline-block bg-[#0A1128] text-white px-6 py-2 font-label-sm text-label-sm uppercase tracking-wider hover:bg-[#162244] transition-colors">
          Back to directory
        </Link>
      </div>
    </div>
  );
}
