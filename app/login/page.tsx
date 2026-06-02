'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { signIn } from '@/app/actions/authActions';
import { Shield, Loader2, Fingerprint, KeyRound, ArrowRight, CheckCircle, Eye, EyeOff } from 'lucide-react';

export default function SecureSignIn() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}

function SignInForm() {
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get('registered') === 'true';
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const result = await signIn(form);
    setLoading(false);
    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] min-h-dvh flex flex-col justify-center items-center relative overflow-y-auto px-4 md:px-0 py-6">
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #0b1c30 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
      </div>

      <div className="z-10 mb-12 text-center">
        <h1 className="font-headline-lg uppercase tracking-[0.2em] m-0">Kiya Law</h1>
        <p className="text-[14px] font-[600] text-[#46464d] mt-2 tracking-widest opacity-80 m-0">GLOBAL LEGAL INFRASTRUCTURE</p>
      </div>

      <div className="z-10 w-full max-w-[480px] bg-white border border-[#c6c6ce] shadow-[0_20px_50px_rgba(10,17,40,0.08)] p-10 md:p-12 relative">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#141a32] text-white px-4 py-2 flex items-center gap-2 border border-[#000000]">
          <Shield size={18} />
          <span className="text-[12px] font-[500] tracking-widest uppercase">SOC2 TYPE II CERTIFIED</span>
        </div>

        <div className="mb-10 text-center">
          <h2 className="font-headline-md">Secure Sign In</h2>
          <div className="h-1 w-12 bg-[#735c00] mx-auto mt-4"></div>
        </div>

        {justRegistered && (
          <div className="mb-6 bg-[#e8f5e9] border border-[#4caf50] text-[#2e7d32] px-4 py-3 text-[13px] font-medium flex items-center gap-2">
            <CheckCircle size={16} />
            Account created. Check your email for a confirmation link, then sign in below.
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="group">
            <label className="text-[14px] font-[600] text-[#46464d] block mb-2 group-focus-within:text-[#735c00] transition-colors" htmlFor="email">OFFICE EMAIL</label>
            <input className="w-full border-0 border-b border-[#c6c6ce] bg-transparent py-3 px-0 focus:ring-0 focus:border-[#735c00] transition-all outline-none text-[16px] text-[#0b1c30]" id="email" name="email" placeholder="lawyer@kiyalaw.com" type="email" required />
          </div>

          <div className="group relative">
            <label className="text-[14px] font-[600] text-[#46464d] block mb-2 group-focus-within:text-[#735c00] transition-colors" htmlFor="password">ENCRYPTED KEY</label>
            <div className="relative">
              <input className="w-full border-0 border-b border-[#c6c6ce] bg-transparent py-3 pr-10 px-0 focus:ring-0 focus:border-[#735c00] transition-all outline-none text-[16px] text-[#0b1c30]" id="password" name="password" placeholder="••••••••••••" type={showPassword ? 'text' : 'password'} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-1/2 -translate-y-1/2 text-[#76767e] hover:text-[#0b1c30] transition-colors cursor-pointer p-1" tabIndex={-1}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-[#ffdad6] border border-[#ba1a1a] text-[#93000a] px-4 py-3 text-[13px] font-medium">{error}</div>
          )}

          <button
            disabled={loading}
            className="w-full text-[14px] font-[600] py-5 tracking-[0.15em] uppercase border bg-[#141a32] text-white border-[#000000] hover:bg-[#0b1c30] transition-all duration-300 mt-4 flex justify-center items-center gap-3 disabled:opacity-60 cursor-pointer"
            type="submit"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                Authenticate Session
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#c6c6ce] text-center">
          <p className="text-[14px] text-[#46464d]">
            No account?{' '}
            <Link href="/register" className="text-[#735c00] font-semibold hover:underline decoration-[#735c00] underline-offset-4">Create Account</Link>
          </p>
        </div>

        <div className="mt-8 pt-8 border-t border-[#c6c6ce]">
          <p className="text-[12px] font-[500] text-[#46464d] text-center mb-6 tracking-wider uppercase">Hardware &amp; Biometric Authentication</p>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center gap-3 py-4 border border-[#c6c6ce] hover:border-[#735c00] hover:bg-[#eff4ff] transition-all group cursor-not-allowed opacity-60" disabled type="button">
              <Fingerprint size={24} className="text-[#46464d] group-hover:text-[#735c00]" />
              <span className="text-[12px] font-[500] uppercase tracking-tighter">Passkey</span>
            </button>
            <button className="flex flex-col items-center gap-3 py-4 border border-[#c6c6ce] hover:border-[#735c00] hover:bg-[#eff4ff] transition-all group cursor-not-allowed opacity-60" disabled type="button">
              <KeyRound size={24} className="text-[#46464d] group-hover:text-[#735c00]" />
              <span className="text-[12px] font-[500] uppercase tracking-tighter">Hardware Key</span>
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <Link href="/forgot-password" className="text-[14px] font-[600] text-[#46464d] hover:text-[#735c00] transition-colors">
            Forgot Key?
          </Link>
        </div>
      </div>

      <footer className="z-10 mt-12 flex flex-col md:flex-row items-center gap-6 text-[#46464d] opacity-60 text-[12px] font-[500] uppercase tracking-[0.1em]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#735c00]"></span>
          Kiya Law Systems Online
        </div>
        <div className="hidden md:block">|</div>
        <div>TLS 1.3 Encryption Active</div>
        <div className="hidden md:block">|</div>
        <div>Node: London-HQ-01</div>
      </footer>
    </div>
  );
}
