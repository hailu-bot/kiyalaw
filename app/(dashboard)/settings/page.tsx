import React from 'react';
import { prisma } from '@/lib/prisma/client';
import { getCurrentUserId } from '@/lib/supabase/get-current-user';
import SettingsTabs from '@/components/settings/SettingsTabs';

export default async function SettingsPage() {
  const userId = await getCurrentUserId();

  const [profile, user, clients, matters, rateCards] = await Promise.all([
    prisma.firmProfile.findFirst({ orderBy: { createdAt: 'asc' } }).then(async (p) => {
      if (p) return p;
      return prisma.firmProfile.create({ data: {} });
    }),
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.client.findMany({ where: { userId }, select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    prisma.matter.findMany({ where: { userId }, select: { id: true, title: true }, orderBy: { title: 'asc' } }),
    prisma.rateCard.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { client: { select: { name: true } }, matter: { select: { title: true } } },
    }),
  ]);

  const settings = {
    firmName: profile.firmName,
    defaultRate: profile.defaultRate,
    logoUrl: profile.logoUrl,
    address: profile.address,
    phone: profile.phone,
    email: profile.email,
    website: profile.website,
    timezone: profile.timezone,
    dateFormat: profile.dateFormat,
    emailNotifications: profile.emailNotifications,
    billingAlerts: profile.billingAlerts,
    automationSettings: profile.automationSettings as Record<string, unknown> | null,
  };

  const userData = {
    id: user?.id ?? '',
    name: user?.name ?? null,
    email: user?.email ?? '',
    role: user?.role ?? '',
    createdAt: (user?.createdAt ?? new Date()).toISOString(),
    avatarUrl: user?.avatarUrl ?? null,
  };

  const initialCards = rateCards.map((r) => ({
    id: r.id,
    userId: r.userId,
    clientId: r.clientId,
    matterId: r.matterId,
    clientName: r.client?.name ?? null,
    matterTitle: r.matter?.title ?? null,
    rate: Number(r.rate),
    label: r.label,
    effectiveFrom: r.effectiveFrom instanceof Date ? r.effectiveFrom.toISOString() : null,
    effectiveTo: r.effectiveTo instanceof Date ? r.effectiveTo.toISOString() : null,
  }));

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-8 max-w-container-max mx-auto w-full flex-1">
      <SettingsTabs settings={settings} user={userData} clients={clients} matters={matters} initialCards={initialCards} />
    </div>
  );
}
