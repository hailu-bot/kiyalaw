'use client';

import React, { useState } from 'react';
import { Building2, Bell, Zap, User, DollarSign } from 'lucide-react';
import TabFirmProfile from './TabFirmProfile';
import TabNotifications from './TabNotifications';
import TabAutomation from './TabAutomation';
import TabUserAccount from './TabUserAccount';
import TabRateCards from './TabRateCards';

export interface SettingsData {
  firmName: string;
  defaultRate: number;
  logoUrl: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  timezone: string;
  dateFormat: string;
  emailNotifications: boolean;
  billingAlerts: boolean;
  automationSettings: Record<string, unknown> | null;
}

export interface UserData {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  avatarUrl: string | null;
}

interface Props {
  settings: SettingsData;
  user: UserData;
  initialTab?: string;
  clients?: { id: string; name: string }[];
  matters?: { id: string; title: string }[];
  initialCards?: {
    id: string; userId: string; clientId: string | null; matterId: string | null;
    clientName: string | null; matterTitle: string | null; rate: number;
    label: string | null; effectiveFrom: string | null; effectiveTo: string | null;
  }[];
}

const TABS = [
  { id: 'profile', label: 'Firm Profile', icon: Building2 },
  { id: 'rates', label: 'Rate Cards', icon: DollarSign },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'automation', label: 'Automation', icon: Zap },
  { id: 'account', label: 'User Account', icon: User },
];

export default function SettingsTabs({ settings, user, initialTab, clients, matters, initialCards }: Props) {
  const [activeTab, setActiveTab] = useState(initialTab || 'profile');

  const automationDefaults = {
    requireApproval: true,
    autoArchive: false,
    notifySuccess: true,
    notifyClient: false,
    notifyDelegation: true,
    leadTime: 5,
    docFormat: 'docx',
  };

  const automationData = settings.automationSettings
    ? { ...automationDefaults, ...settings.automationSettings }
    : automationDefaults;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-headline-md text-headline-md text-[#0A1128] mb-2">Settings</h1>
        <p className="font-body-lg text-body-lg text-[#46464d]">Configure firm profile, preferences, and account settings.</p>
      </div>

      <div className="border-b border-[#c6c6ce]/20 mb-8">
        <nav className="flex gap-0 -mb-px overflow-x-auto">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 font-label-md text-[13px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 ${
                  isActive
                    ? 'border-[#D4AF37] text-[#0A1128]'
                    : 'border-transparent text-[#76767e] hover:text-[#0A1128] hover:border-[#c6c6ce]'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {activeTab === 'profile' && <TabFirmProfile data={settings} />}
      {activeTab === 'rates' && <TabRateCards clients={clients ?? []} matters={matters ?? []} initialCards={initialCards ?? []} />}
      {activeTab === 'notifications' && (
        <TabNotifications
          data={{ emailNotifications: settings.emailNotifications, billingAlerts: settings.billingAlerts }}
        />
      )}
      {activeTab === 'automation' && <TabAutomation data={automationData} />}
      {activeTab === 'account' && <TabUserAccount user={user} />}
    </div>
  );
}
