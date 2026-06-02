'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp } from '@/app/actions/authActions';
import { Shield, Loader2, Gavel, UserPlus, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const result = await signUp(form);
    setLoading(false);
    if (result.success) {
      router.push('/login?registered=true');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] font-sans min-h-dvh flex flex-col overflow-x-hidden overflow-y-auto">
      <header className="flex justify-between items-center h-20 px-4 md:px-[48px] w-full sticky top-0 z-50 bg-white border-b border-[#c6c6ce]">
        <div className="font-headline-lg text-[#000] uppercase">Kiya Law</div>
        <div className="flex items-center gap-4">
          <span className="text-[14px] font-[600] text-[#46464d] hidden md:block">SECURE GATEWAY</span>
          <Shield size={20} className="text-[#000]" />
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center py-12 px-4 md:px-0">
        <div className="max-w-[1100px] w-full grid grid-cols-1 md:grid-cols-12 bg-white shadow-sm border border-[#c6c6ce] overflow-hidden">

          <div className="hidden md:flex md:col-span-5 p-12 flex-col justify-between relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #141a32 0%, #0b1c30 100%)' }}>
            <div className="z-10">
              <h1 className="text-[48px] font-[700] font-headline-lg text-white mb-6 m-0 leading-tight">Attorney Registration</h1>
              <p className="text-[18px] text-[#bfc5e4] opacity-90 leading-relaxed m-0">
                Create your account to access Kiya Law Systems — the premier legal infrastructure platform for corporate counsel and law firms.
              </p>
            </div>
            <div className="z-10 space-y-8">
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <Gavel size={24} className="text-[#ffe088]" />
                </div>
                <div>
                  <p className="text-[14px] font-[600] text-white mb-1 uppercase tracking-widest">Firm Integrity</p>
                  <p className="text-[#7c839f] text-[12px] leading-relaxed">Secure access for legal professionals and firm administrators.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <UserPlus size={24} className="text-[#ffe088]" />
                </div>
                <div>
                  <p className="text-[14px] font-[600] text-white mb-1 uppercase tracking-widest">Instant Access</p>
                  <p className="text-[#7c839f] text-[12px] leading-relaxed">Register with your firm email and start managing matters immediately.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-7 p-8 md:p-16 flex flex-col justify-center">
            <div className="mb-8">
              <h2 className="font-headline-md">Create Your Account</h2>
              <p className="text-[16px] text-[#46464d]">Fill in your details below to get started.</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-[600] text-[#0b1c30] uppercase tracking-wider" htmlFor="fullName">Full Name</label>
                <input id="fullName" name="fullName" className="border border-[#c6c6ce] bg-[#f8f9ff] px-4 py-3 text-[16px] text-[#0b1c30] focus:outline-none focus:border-[#735c00] transition-all" placeholder="John D. Sutherland" type="text" required />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-[600] text-[#0b1c30] uppercase tracking-wider" htmlFor="email">Firm Email</label>
                <input id="email" name="email" className="border border-[#c6c6ce] bg-[#f8f9ff] px-4 py-3 text-[16px] text-[#0b1c30] focus:outline-none focus:border-[#735c00] transition-all" placeholder="lawyer@kiyalaw.com" type="email" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-[600] text-[#0b1c30] uppercase tracking-wider" htmlFor="password">Password</label>
                  <div className="relative">
                    <input id="password" name="password" className="w-full border border-[#c6c6ce] bg-[#f8f9ff] px-4 py-3 pr-10 text-[16px] text-[#0b1c30] focus:outline-none focus:border-[#735c00] transition-all" placeholder="Min. 6 characters" type={showPassword ? 'text' : 'password'} required minLength={6} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#76767e] hover:text-[#0b1c30] transition-colors cursor-pointer" tabIndex={-1}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-[600] text-[#0b1c30] uppercase tracking-wider" htmlFor="confirmPassword">Confirm Password</label>
                  <div className="relative">
                    <input id="confirmPassword" name="confirmPassword" className="w-full border border-[#c6c6ce] bg-[#f8f9ff] px-4 py-3 pr-10 text-[16px] text-[#0b1c30] focus:outline-none focus:border-[#735c00] transition-all" placeholder="Re-enter password" type={showConfirm ? 'text' : 'password'} required minLength={6} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#76767e] hover:text-[#0b1c30] transition-colors cursor-pointer" tabIndex={-1}>
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-[#ffdad6] border border-[#ba1a1a] text-[#93000a] px-4 py-3 text-[13px] font-medium">{error}</div>
              )}

              <button
                disabled={loading}
                className="w-full bg-[#141a32] text-white py-5 text-[14px] font-[600] uppercase tracking-widest hover:bg-[#3f465f] transition-all cursor-pointer flex justify-center items-center gap-3 disabled:opacity-60"
                type="submit"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-[#c6c6ce] text-center">
              <p className="text-[14px] text-[#46464d]">
                Already have an account?{' '}
                <Link href="/login" className="text-[#735c00] font-[600] hover:underline">Sign In</Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
