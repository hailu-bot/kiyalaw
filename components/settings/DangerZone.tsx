'use client';

import React, { useState, useActionState } from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import { deleteUserAccount } from '@/app/actions/settingsActions';

export default function DangerZone() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'warning' | 'confirm'>('warning');
  const [confirmation, setConfirmation] = useState('');
  const [state, formAction, pending] = useActionState(
    async (prev: { success: boolean; message?: string } | null, formData: FormData) => {
      return deleteUserAccount(formData);
    },
    null
  );

  const handleClose = () => {
    setOpen(false);
    setStep('warning');
    setConfirmation('');
  };

  if (!open) {
    return (
      <section className="border border-[#ba1a1a]/40 bg-[#fffbee]">
        <div className="px-6 py-5 border-b border-[#ba1a1a]/20 flex items-center gap-3">
          <AlertTriangle size={20} className="text-[#ba1a1a]" />
          <h2 className="font-headline-sm text-headline-sm text-[#ba1a1a]">Danger Zone</h2>
        </div>
        <div className="p-6 flex items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-label-md text-label-md text-[#0A1128] mb-1">Delete Your Account</h3>
            <p className="font-body-md text-body-md text-[#46464d]">Permanently remove your account and all associated data.</p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="px-5 py-2.5 bg-[#ba1a1a] text-white font-label-md text-[13px] font-bold uppercase tracking-wider hover:bg-[#93000a] transition-colors shrink-0"
          >
            Delete Account
          </button>
        </div>
      </section>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={handleClose}>
        <div className="bg-white w-full max-w-[520px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#c6c6ce]/20">
            <div className="flex items-center gap-3">
              <AlertTriangle size={20} className="text-[#ba1a1a]" />
              <h2 className="font-headline-sm text-headline-sm text-[#0A1128]">
                {step === 'warning' ? 'Delete Account' : 'Final Confirmation'}
              </h2>
            </div>
            <button onClick={handleClose} className="text-[#76767e] hover:text-[#0A1128] transition-colors">
              <X size={20} />
            </button>
          </div>

          {step === 'warning' ? (
            <div className="p-6 space-y-6">
              <div className="bg-[#ffdad6] border border-[#ba1a1a] p-4">
                <p className="font-label-md text-label-md text-[#93000a] mb-2">This action cannot be undone.</p>
                <p className="font-body-md text-body-md text-[#93000a]">
                  Deleting your account will permanently remove:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1 font-body-md text-body-md text-[#93000a]">
                  <li>All clients and matters</li>
                  <li>All invoices and billing history</li>
                  <li>All time entries and activities</li>
                  <li>All documents and folders</li>
                  <li>Your user profile and login access</li>
                </ul>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={handleClose}
                  className="px-6 py-2.5 border border-[#76767e] text-[#0A1128] font-label-md text-[13px] font-bold uppercase tracking-wider hover:bg-[#f8f9ff] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setStep('confirm')}
                  className="px-6 py-2.5 bg-[#ba1a1a] text-white font-label-md text-[13px] font-bold uppercase tracking-wider hover:bg-[#93000a] transition-colors"
                >
                  I Understand, Continue
                </button>
              </div>
            </div>
          ) : (
            <form action={formAction} className="p-6 space-y-6">
              <div>
                <p className="font-body-md text-body-md text-[#46464d] mb-4">
                  Type <span className="font-bold text-[#ba1a1a]">DELETE</span> below to confirm permanent account deletion.
                </p>
                <input
                  type="text"
                  name="confirmation"
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  placeholder="Type DELETE to confirm"
                  className="w-full bg-[#f8f9ff] border border-[#c6c6ce] px-4 py-3 font-body-md text-body-md text-[#0A1128] focus:border-[#ba1a1a] focus:ring-0 outline-none"
                  autoFocus
                />
              </div>

              {state?.message && !state.success && (
                <div className="bg-[#ffdad6] border border-[#ba1a1a] text-[#93000a] px-4 py-3 text-[13px] font-medium">{state.message}</div>
              )}

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2.5 border border-[#76767e] text-[#0A1128] font-label-md text-[13px] font-bold uppercase tracking-wider hover:bg-[#f8f9ff] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={confirmation !== 'DELETE' || pending}
                  className="px-6 py-2.5 bg-[#ba1a1a] text-white font-label-md text-[13px] font-bold uppercase tracking-wider hover:bg-[#93000a] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {pending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    'Permanently Delete My Account'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

