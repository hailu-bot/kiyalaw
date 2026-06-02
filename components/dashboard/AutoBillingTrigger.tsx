'use client';

import { useEffect } from 'react';

export default function AutoBillingTrigger() {
  useEffect(() => {
    import('@/app/actions/billingActions').then(({ runBillingCycle }) => {
      runBillingCycle().catch(() => {});
    });
  }, []);

  return null;
}
