'use client';

import React, { useActionState } from 'react';
import { Bell } from 'lucide-react';
import { updateFirmProfile } from '@/app/actions/settingsActions';

interface NotificationsData {
  emailNotifications: boolean;
  billingAlerts: boolean;
}

export default function TabNotifications({ data }: { data: NotificationsData }) {
  const [state, formAction, pending] = useActionState(
    async (prev: { success: boolean; message?: string } | null, formData: FormData) => {
      return updateFirmProfile(formData);
    },
    null
  );

  return (
    <section className="bg-white border border-[#c6c6ce]/30 shadow-[0_4px_40px_rgba(10,17,40,0.03)]">
      <div className="px-6 py-5 border-b border-[#c6c6ce]/20 bg-[#f8f9ff]/50 flex items-center gap-3">
        <Bell size={20} className="text-[#0A1128]" />
        <h2 className="font-headline-sm text-headline-sm text-[#0A1128]">Notifications</h2>
      </div>

      <form action={formAction} className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-3 pb-6 border-b border-[#c6c6ce]/10">
          <div className="flex-1">
            <span className="font-label-md text-label-md text-[#0A1128] block">Email Notifications</span>
            <p className="font-body-md text-body-md text-[#46464d]">Receive emails for key account activity.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input type="checkbox" name="emailNotifications" defaultChecked={data.emailNotifications} className="sr-only peer" />
            <div className="w-11 h-6 bg-[#c6c6ce]/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0A1128] border border-[#c6c6ce]/20"></div>
          </label>
        </div>

        <div className="flex items-center justify-between gap-3 pb-6 border-b border-[#c6c6ce]/10">
          <div className="flex-1">
            <span className="font-label-md text-label-md text-[#0A1128] block">Billing Alerts</span>
            <p className="font-body-md text-body-md text-[#46464d]">Get notified when invoices are created, approved, or paid.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input type="checkbox" name="billingAlerts" defaultChecked={data.billingAlerts} className="sr-only peer" />
            <div className="w-11 h-6 bg-[#c6c6ce]/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0A1128] border border-[#c6c6ce]/20"></div>
          </label>
        </div>

        {state?.success && (
          <div className="bg-[#e8f5e9] border border-[#4caf50] text-[#2e7d32] px-4 py-3 text-[13px] font-medium">Notification preferences saved.</div>
        )}

        <div className="flex justify-end pt-4 border-t border-[#c6c6ce]/10">
          <button
            type="submit"
            disabled={pending}
            className="px-6 py-2.5 bg-[#0A1128] text-white font-label-md text-[13px] font-bold uppercase tracking-wider hover:bg-[#162244] transition-colors disabled:opacity-60"
          >
            {pending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </section>
  );
}

