'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma/client';
import { getCurrentUserId, requireRole } from '@/lib/supabase/get-current-user-role';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createAuthServerClient } from '@/lib/supabase/auth-server';

export async function getFirmProfile() {
  await getCurrentUserId();
  const existing = await prisma.firmProfile.findFirst({ orderBy: { createdAt: 'asc' } });
  if (existing) return existing;
  return prisma.firmProfile.create({ data: {} });
}

export async function updateFirmProfile(formData: FormData) {
  if (!await requireRole('PARTNER', 'ASSOCIATE')) return { success: false, message: 'Forbidden' };
  try {
    const data: Record<string, string | number | boolean> = {};
    const firmName = formData.get('firmName');
    if (firmName) data.firmName = String(firmName);
    const defaultRateRaw = formData.get('defaultRate');
    if (defaultRateRaw !== null) {
      const num = Number(defaultRateRaw);
      if (!isNaN(num)) data.defaultRate = Math.round(num);
    }
    const timezone = formData.get('timezone');
    if (timezone) data.timezone = String(timezone);
    const dateFormat = formData.get('dateFormat');
    if (dateFormat) data.dateFormat = String(dateFormat);
    const address = formData.get('address');
    if (address) data.address = String(address);
    const phone = formData.get('phone');
    if (phone) data.phone = String(phone);
    const email = formData.get('email');
    if (email) data.email = String(email);
    const website = formData.get('website');
    if (website) data.website = String(website);
    const emailNotifications = formData.get('emailNotifications');
    if (emailNotifications !== null) data.emailNotifications = emailNotifications === 'on';
    const billingAlerts = formData.get('billingAlerts');
    if (billingAlerts !== null) data.billingAlerts = billingAlerts === 'on';
    const billingCycleDays = formData.get('billingCycleDays');
    if (billingCycleDays !== null) {
      const num = Number(billingCycleDays);
      if (!isNaN(num) && num > 0) data.billingCycleDays = Math.round(num);
    }
    const billingLeadDays = formData.get('billingLeadDays');
    if (billingLeadDays !== null) {
      const num = Number(billingLeadDays);
      if (!isNaN(num) && num >= 0) data.billingLeadDays = Math.round(num);
    }

    const profile = await prisma.firmProfile.findFirst({ orderBy: { createdAt: 'asc' } });
    if (profile) {
      await prisma.firmProfile.update({ where: { id: profile.id }, data: data as Prisma.FirmProfileUpdateInput });
    } else {
      await prisma.firmProfile.create({ data: data as Prisma.FirmProfileCreateInput });
    }
    revalidatePath('/settings');
    return { success: true };
  } catch (error) {
    console.error('updateFirmProfile error:', error);
    return { success: false, message: 'Failed to save settings.' };
  }
}

export async function updateAutomationSettings(formData: FormData) {
  if (!await requireRole('PARTNER')) return { success: false, message: 'Forbidden' };
  try {
    const settings: Record<string, unknown> = {};
    const requireApproval = formData.get('requireApproval');
    if (requireApproval !== null) settings.requireApproval = requireApproval === 'on';
    const autoArchive = formData.get('autoArchive');
    if (autoArchive !== null) settings.autoArchive = autoArchive === 'on';
    const notifySuccess = formData.get('notifySuccess');
    if (notifySuccess !== null) settings.notifySuccess = notifySuccess === 'on';
    const notifyClient = formData.get('notifyClient');
    if (notifyClient !== null) settings.notifyClient = notifyClient === 'on';
    const notifyDelegation = formData.get('notifyDelegation');
    if (notifyDelegation !== null) settings.notifyDelegation = notifyDelegation === 'on';
    const leadTime = formData.get('leadTime');
    if (leadTime) settings.leadTime = Number(leadTime);
    const docFormat = formData.get('docFormat');
    if (docFormat) settings.docFormat = String(docFormat);

    const profile = await prisma.firmProfile.findFirst({ orderBy: { createdAt: 'asc' } });
    if (profile) {
      await prisma.firmProfile.update({ where: { id: profile.id }, data: { automationSettings: settings as Prisma.InputJsonValue } });
    } else {
      await prisma.firmProfile.create({ data: { automationSettings: settings as Prisma.InputJsonValue } });
    }
    revalidatePath('/settings');
    return { success: true };
  } catch (error) {
    console.error('updateAutomationSettings error:', error);
    return { success: false, message: 'Failed to save automation settings.' };
  }
}

export async function uploadFirmLogo(formData: FormData) {
  const file = formData.get('logo') as File | null;
  if (!file) return { success: false, message: 'No file provided.' };

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) return { success: false, message: 'File exceeds 5MB limit.' };

  try {
    const userId = await getCurrentUserId();
    const supabase = createSupabaseServerClient();

    const { data: existingBucket } = await supabase.storage.getBucket('FirmLogos');
    if (!existingBucket) {
      const { error: createError } = await supabase.storage.createBucket('FirmLogos', { public: true });
      if (createError) throw createError;
    }

    const ext = file.name.split('.').pop() || 'png';
    const filePath = `firm-logos/${userId}-${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error } = await supabase.storage.from('FirmLogos').upload(filePath, buffer, {
      contentType: file.type,
      upsert: true,
    });
    if (error) throw error;

    const { data: urlData } = supabase.storage.from('FirmLogos').getPublicUrl(filePath);
    const logoUrl = urlData?.publicUrl;

    const profile = await prisma.firmProfile.findFirst({ orderBy: { createdAt: 'asc' } });
    if (profile) {
      await prisma.firmProfile.update({ where: { id: profile.id }, data: { logoUrl } });
    }
    revalidatePath('/settings');
    return { success: true, logoUrl };
  } catch (error) {
    console.error('uploadFirmLogo error:', error);
    return { success: false, message: 'Failed to upload logo.' };
  }
}

export async function deleteUserAccount(formData: FormData) {
  const userId = await getCurrentUserId();
  const confirmation = String(formData.get('confirmation') ?? '');

  if (confirmation !== 'DELETE') {
    return { success: false, message: 'Must type DELETE to confirm.' };
  }

  try {
    await prisma.user.delete({ where: { id: userId } });

    const supabaseAdmin = createSupabaseServerClient();
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) console.error('Supabase admin deleteUser error:', error);

    const supabase = await createAuthServerClient();
    await supabase.auth.signOut();
  } catch (error) {
    console.error('deleteUserAccount error:', error);
    return { success: false, message: 'Failed to delete account. Please contact support.' };
  }

  revalidatePath('/', 'layout');
  redirect('/login');
}
