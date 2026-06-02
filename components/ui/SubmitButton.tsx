'use client';

import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';

type Props = {
  label: string;
  pendingLabel?: string;
  className?: string;
};

export default function SubmitButton({ label, pendingLabel = 'Processing...', className = '' }: Props) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      {pending && <Loader2 size={18} className="animate-spin" />}
      {pending ? pendingLabel : label}
    </button>
  );
}
