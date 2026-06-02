'use client';

import React, { useState } from 'react';
import { Zap } from 'lucide-react';

export default function RunBillingButton() {
  const [running, setRunning] = useState(false);

  const handleClick = async () => {
    setRunning(true);
    try {
      const { runBillingCycle } = await import('@/app/actions/billingActions');
      await runBillingCycle();
      window.location.reload();
    } catch {
      setRunning(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={running}
      className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] hover:text-[#b8962e] transition-colors disabled:opacity-50 cursor-pointer"
    >
      <Zap size={13} />
      {running ? 'Running...' : 'Run Now'}
    </button>
  );
}
