'use client';

import React from 'react';
import { User, Mail, Shield, Calendar } from 'lucide-react';
import DangerZone from './DangerZone';

interface UserData {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  avatarUrl: string | null;
}

export default function TabUserAccount({ user }: { user: UserData }) {
  return (
    <div className="space-y-8">
      <section className="bg-white border border-[#c6c6ce]/30 shadow-[0_4px_40px_rgba(10,17,40,0.03)]">
        <div className="px-6 py-5 border-b border-[#c6c6ce]/20 bg-[#f8f9ff]/50 flex items-center gap-3">
          <User size={20} className="text-[#0A1128]" />
          <h2 className="font-headline-sm text-headline-sm text-[#0A1128]">Account Details</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-start gap-5 pb-6 border-b border-[#c6c6ce]/10">
            <div className="w-16 h-16 bg-[#0A1128] flex items-center justify-center shrink-0">
              <span className="text-white font-headline-sm text-[24px] font-bold">
                {(user.name || user.email).charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-label-md text-label-md text-[#0A1128]">{user.name || 'Unnamed'}</h3>
                  <p className="font-body-md text-body-md text-[#46464d]">{user.email}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#f8f9ff] border border-[#c6c6ce]/30 font-label-sm text-[11px] font-bold uppercase tracking-wider text-[#0A1128]">
                  <Shield size={12} />
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-[#7c839f]" />
              <div>
                <p className="font-label-sm text-[11px] text-[#46464d] uppercase tracking-wider">Email</p>
                <p className="font-body-md text-body-md text-[#0A1128]">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield size={16} className="text-[#7c839f]" />
              <div>
                <p className="font-label-sm text-[11px] text-[#46464d] uppercase tracking-wider">Role</p>
                <p className="font-body-md text-body-md text-[#0A1128]">{user.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar size={16} className="text-[#7c839f]" />
              <div>
                <p className="font-label-sm text-[11px] text-[#46464d] uppercase tracking-wider">Member Since</p>
                <p className="font-body-md text-body-md text-[#0A1128]">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <DangerZone />
    </div>
  );
}

