'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, CheckCircle, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate send — real implementation will connect to Supabase auth
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="bg-[#f8f9ff] min-h-dvh flex flex-col justify-center items-center px-4">
        <div className="w-full max-w-[480px] bg-white border border-[#c6c6ce] shadow-lg p-10 md:p-12 text-center">
          <CheckCircle size={48} className="text-green-600 mx-auto mb-6" />
          <h1 className="font-headline-sm">Check Your Email</h1>
          <p className="text-[#46464d] mb-8">
            If an account exists for <strong>{email}</strong>, we have sent password reset instructions.
          </p>
          <Link href="/login" className="text-[#735c00] font-semibold hover:underline">Return to Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9ff] min-h-dvh flex flex-col justify-center items-center px-4 py-6">
      <div className="w-full max-w-[480px] bg-white border border-[#c6c6ce] shadow-lg p-10 md:p-12">
        <Link href="/login" className="inline-flex items-center gap-2 text-[14px] text-[#46464d] hover:text-[#735c00] transition-colors mb-8">
          <ArrowLeft size={16} /> Back to Sign In
        </Link>

        <div className="mb-8 text-center">
          <Mail size={32} className="text-[#735c00] mx-auto mb-4" />
          <h1 className="font-headline-sm">Forgot Your Key?</h1>
          <p className="text-[14px] text-[#46464d]">Enter your firm email and we will send a recovery link.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[14px] font-semibold text-[#46464d] block mb-2" htmlFor="email">FIRM EMAIL</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border-0 border-b border-[#c6c6ce] bg-transparent py-3 px-0 focus:ring-0 focus:border-[#735c00] transition-all outline-none text-[16px] text-[#0b1c30]"
              placeholder="lawyer@kiyalaw.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#141a32] text-white py-4 text-[14px] font-semibold uppercase tracking-widest hover:bg-[#0b1c30] transition-all disabled:opacity-60 flex items-center justify-center gap-3 cursor-pointer"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Send Recovery Link'}
          </button>
        </form>
      </div>
    </div>
  );
}
