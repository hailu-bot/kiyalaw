'use client';

import { useRouter } from 'next/navigation';

export default function ClickableClientName({ clientId, clientName }: { clientId: string; clientName: string }) {
  const router = useRouter();

  return (
    <span
      className="text-[#0A1128] font-semibold hover:text-[#D4AF37] transition-colors underline underline-offset-2 cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        router.push(`/clients/${clientId}`);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.stopPropagation();
          router.push(`/clients/${clientId}`);
        }
      }}
      role="link"
      tabIndex={0}
    >
      {clientName}
    </span>
  );
}
