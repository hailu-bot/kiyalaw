"use server";

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma/client';
import { MatterStatus } from '@prisma/client';
import { getCurrentUserId, requireRole } from '@/lib/supabase/get-current-user-role';
export async function createMatter(formData: FormData) {
  if (!await requireRole('PARTNER', 'ASSOCIATE')) return { success: false as const, message: 'Forbidden' };
  const title = String(formData.get('title') ?? '').trim();
  const clientName = String(formData.get('clientName') ?? '').trim();
  const practiceArea = String(formData.get('practiceArea') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  let matterCode = String(formData.get('matterCode') ?? '').trim();
  if (!matterCode) matterCode = `MAT-${crypto.randomUUID().slice(0, 8)}`;
  const leadAttorneyName = String(formData.get('leadAttorneyName') ?? '').trim() || null;
  const billableRaw = formData.get('billableTargetHours');
  const billableTargetHours = billableRaw ? parseInt(String(billableRaw), 10) : null;
  const clientId = String(formData.get('clientId') ?? '').trim() || null;

  if (!title || !clientName || !practiceArea) {
    return { success: false as const, message: 'Title, client name, and practice area are required.' };
  }

  if (billableTargetHours !== null && (isNaN(billableTargetHours) || billableTargetHours < 0)) {
    return { success: false as const, message: 'Billable target hours must be a positive number.' };
  }

  try {
    const userId = await getCurrentUserId();
    await prisma.matter.create({
      data: {
        userId,
        matterCode,
        title,
        clientName,
        practiceArea,
        description: description || undefined,
        leadAttorneyName,
        billableTargetHours,
        clientId: clientId || undefined,
        status: MatterStatus.Active,
      },
    });
  } catch (error) {
    console.error('Matter creation failed:', error);
    return { success: false as const, error: 'UNKNOWN', message: 'Failed to create matter. Please try again.' };
  }

  revalidatePath('/matters');
  return { success: true as const, message: 'Matter created successfully.' };
}

export async function getMatters(filters?: {
  search?: string; practiceArea?: string; status?: string;
  sortBy?: string; sortDir?: string; page?: number; clientId?: string;
}) {
  const userId = await getCurrentUserId();
  const where: Record<string, unknown> = { userId };
  if (filters?.clientId) where.clientId = filters.clientId;
  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { clientName: { contains: filters.search, mode: 'insensitive' } },
      { practiceArea: { contains: filters.search, mode: 'insensitive' } },
      { matterCode: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  if (filters?.practiceArea) {
    const areas = filters.practiceArea.split(',').map(s => s.trim()).filter(Boolean);
    if (areas.length > 0) where.practiceArea = { in: areas };
  }
  if (filters?.status) {
    where.status = filters.status as MatterStatus;
  }

  const pageSize = 10;
  const page = Math.max(1, filters?.page ?? 1);
  const skip = (page - 1) * pageSize;

  const sortFieldMap: Record<string, string> = { title: 'title', status: 'status', createdAt: 'createdAt' };
  const sortField = sortFieldMap[filters?.sortBy ?? ''] || 'createdAt';
  const sortDir = filters?.sortDir === 'asc' ? 'asc' : 'desc';

  const [rows, totalCount] = await Promise.all([
    prisma.matter.findMany({
      where,
      orderBy: { [sortField]: sortDir },
      skip,
      take: pageSize,
      include: {
        _count: { select: { activities: true, invoices: true, timeEntries: true } },
        invoices: { select: { amount: true } },
      },
    }),
    prisma.matter.count({ where }),
  ]);

  return {
    matters: rows.map((row) => ({
      id: String(row.id),
      matterCode: row.matterCode,
      title: row.title,
      clientId: row.clientId,
      clientName: row.clientName,
      practiceArea: row.practiceArea,
      status: row.status,
      billableTargetHours: row.billableTargetHours ?? undefined,
      leadAttorneyName: row.leadAttorneyName ?? undefined,
      createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
      activityCount: row._count.activities,
      invoiceCount: row._count.invoices,
      totalInvoiced: row.invoices.reduce((sum, inv) => sum + Number(inv.amount), 0),
    })),
    totalCount,
    page,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}

export async function getMatterById(id: string) {
  const userId = await getCurrentUserId();
  const row = await prisma.matter.findFirst({
    where: { id, userId },
    include: {
      client: { select: { id: true, name: true } },
      invoices: { orderBy: { createdAt: 'desc' }, take: 10 },
      timeEntries: { orderBy: { createdAt: 'desc' }, take: 10 },
      _count: { select: { activities: true, documents: true, timeEntries: true, invoices: true } },
      activities: { orderBy: { createdAt: 'desc' }, take: 50 },
    },
  });

  if (!row) return null;

  const totalHours = row.timeEntries.reduce((sum, te) => sum + Number(te.hours), 0);
  const totalInvoiced = row.invoices.reduce((sum, inv) => sum + Number(inv.amount), 0);

  return {
    id: row.id,
    matterCode: row.matterCode,
    title: row.title,
    clientName: row.clientName,
    clientId: row.clientId,
    client: row.client,
    practiceArea: row.practiceArea,
    status: row.status,
    billableTargetHours: row.billableTargetHours ?? undefined,
    leadAttorneyName: row.leadAttorneyName ?? undefined,
      description: row.description ?? null,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
    activityCount: row._count.activities,
    documentCount: row._count.documents,
    timeEntryCount: row._count.timeEntries,
    invoiceCount: row._count.invoices,
    totalHours,
    totalInvoiced,
    recentInvoices: row.invoices.map(inv => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      amount: Number(inv.amount),
      status: inv.status,
      createdAt: inv.createdAt instanceof Date ? inv.createdAt.toISOString() : String(inv.createdAt),
    })),
    recentTimeEntries: row.timeEntries.map(te => ({
      id: te.id,
      description: te.description,
      hours: Number(te.hours),
      date: te.date instanceof Date ? te.date.toISOString() : String(te.date),
    })),
    activities: row.activities.map(a => ({
      id: a.id,
      type: a.type,
      description: a.description,
      createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : String(a.createdAt),
    })),
  };
}

export async function updateMatterStatus(matterId: string, status: string) {
  if (!await requireRole('PARTNER', 'ASSOCIATE')) return { success: false as const, error: 'UNKNOWN', message: 'Forbidden' };
  try {
    const userId = await getCurrentUserId();
    const matter = await prisma.matter.findFirst({ where: { id: matterId, userId } });
    if (!matter) return { success: false as const, error: 'NOT_FOUND', message: 'Matter not found' };
    await prisma.matter.update({
      where: { id: matterId },
      data: { status: status as MatterStatus },
    });

    revalidatePath('/matters');
    revalidatePath(`/matters/${matterId}`);
    return { success: true as const, message: 'Status updated' };
  } catch (error) {
    console.error('updateMatterStatus error:', error);
    return { success: false as const, error: 'UNKNOWN', message: 'Failed to update matter status' };
  }
}

export async function createActivity(formData: FormData) {
  if (!await requireRole('PARTNER', 'ASSOCIATE')) return { success: false, message: 'Forbidden' };
  const matterId = String(formData.get('matterId') ?? '').trim();
  const type = String(formData.get('type') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();

  if (!matterId || !type || !description) {
    return { success: false, message: 'Missing required fields' };
  }

  const userId = await getCurrentUserId();
  await prisma.activity.create({
    data: {
      userId,
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      matterId,
      type: type as 'time' | 'document' | 'communication',
      description,
    },
  });

  revalidatePath(`/matters/${matterId}`);
  return { success: true, message: 'Activity created' };
}

export async function createTimeEntryActivity(formData: FormData) {
  if (!await requireRole('PARTNER', 'ASSOCIATE')) return { success: false, message: 'Forbidden' };
  const matterId = String(formData.get('matterId') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();

  if (!matterId || !description) {
    return { success: false, message: 'Missing required fields' };
  }

  const userId = await getCurrentUserId();
  await prisma.activity.create({
    data: {
      userId,
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      matterId,
      type: 'time',
      description,
    },
  });

  revalidatePath('/time');
  return { success: true, message: 'Time entry created' };
}
