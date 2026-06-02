'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma/client';
import type { ClientStatus, BusinessType, BillingTerms, DocumentLabel } from '@prisma/client';
import { getCurrentUserId, requireRole } from '@/lib/supabase/get-current-user-role';

function parseJsonField(value: string | null): Record<string, string> | undefined {
  if (!value) return undefined;
  try { return JSON.parse(value); } catch { return undefined; }
}

async function ensureClientFolder(clientName: string, authorId: string) {
  let folderName = clientName;
  let suffix = 0;
  let existing = await prisma.documentFolder.findFirst({ where: { name: folderName, authorId } });
  while (existing) {
    suffix++;
    folderName = `${clientName} (${suffix})`;
    existing = await prisma.documentFolder.findFirst({ where: { name: folderName, authorId } });
  }
  await prisma.documentFolder.create({ data: { name: folderName, authorId } });
}

export async function getClients() {
  const userId = await getCurrentUserId();
  const rows = await prisma.client.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { matters: true } },
      matters: {
        include: {
          invoices: { select: { amount: true } },
        },
      },
    },
  });

  return rows.map((client) => {
    const initials = client.name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const totalBalance = client.matters.reduce((sum, m) => {
      return sum + m.invoices.reduce((s, inv) => s + Number(inv.amount), 0);
    }, 0);

    return {
      id: client.id,
      name: client.name,
      contactName: client.contactName ?? '',
      contactTitle: client.contactTitle ?? '',
      initials,
      email: client.email ?? '',
      phone: client.phone ?? '',
      industry: client.industry ?? '',
      status: client.status,
      activeMatters: client._count.matters,
      avatarUrl: client.avatarUrl ?? undefined,
      balance: totalBalance,
      createdAt: client.createdAt instanceof Date ? client.createdAt.toISOString() : String(client.createdAt),
      billingAddress: client.billingAddress,
    };
  });
}

export async function getClientById(id: string) {
  const userId = await getCurrentUserId();
  const client = await prisma.client.findFirst({
    where: { id, userId },
    include: {
      matters: {
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { activities: true } },
          invoices: { select: { amount: true, status: true } },
        },
      },
      clientDocuments: { orderBy: { uploadedAt: 'desc' } },
    },
  });

  if (!client) return null;

  const totalInvoiced = client.matters.reduce((sum, m) => {
    return sum + m.invoices.reduce((s, inv) => s + Number(inv.amount), 0);
  }, 0);

  const initials = client.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const registeredAddress = client.registeredAddress as Record<string, string> | null;
  const billingAddress = client.billingAddress as Record<string, string> | null;

  return {
    id: client.id,
    name: client.name,
    contactName: client.contactName ?? '',
    contactTitle: client.contactTitle ?? '',
    email: client.email ?? '',
    phone: client.phone ?? '',
    industry: client.industry ?? '',
    status: client.status,
    notes: client.notes ?? '',
    avatarUrl: client.avatarUrl ?? undefined,
    registrationNumber: client.registrationNumber ?? undefined,
    taxId: client.taxId ?? undefined,
    vatNumber: client.vatNumber ?? undefined,
    businessType: client.businessType ?? undefined,
    dateOfIncorporation: client.dateOfIncorporation?.toISOString() ?? undefined,
    jurisdiction: client.jurisdiction ?? undefined,
    registeredAddress: registeredAddress ? { street: registeredAddress.street ?? '', city: registeredAddress.city ?? '', state: registeredAddress.state ?? '', zip: registeredAddress.zip ?? '', country: registeredAddress.country ?? '' } : undefined,
    billingAddress: billingAddress ? { street: billingAddress.street ?? '', city: billingAddress.city ?? '', state: billingAddress.state ?? '', zip: billingAddress.zip ?? '', country: billingAddress.country ?? '' } : undefined,
    website: client.website ?? undefined,
    annualRevenueRange: client.annualRevenueRange ?? undefined,
    employeeCount: client.employeeCount ?? undefined,
    billingTerms: client.billingTerms ?? undefined,
    creditLimit: client.creditLimit ? Number(client.creditLimit) : undefined,
    referralSource: client.referralSource ?? undefined,
    tags: client.tags ?? undefined,
    initials,
    totalInvoiced,
    activeMatters: client.matters.filter((m) => m.status === 'Active').length,
    totalMatters: client.matters.length,
    matters: client.matters.map((m) => ({
      id: m.id,
      matterCode: m.matterCode,
      title: m.title,
      practiceArea: m.practiceArea,
      status: m.status,
      activityCount: m._count.activities,
      leadAttorneyName: m.leadAttorneyName ?? undefined,
      invoiceTotal: m.invoices.reduce((s, inv) => s + Number(inv.amount), 0),
      createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : String(m.createdAt),
    })),
    clientDocuments: client.clientDocuments.map((d) => ({
      id: d.id,
      clientId: d.clientId,
      fileName: d.fileName,
      originalName: d.originalName,
      mimeType: d.mimeType,
      fileSize: d.fileSize,
      label: d.label,
      fileUrl: d.fileUrl,
      metadata: d.metadata as Record<string, unknown> | undefined,
      uploadedAt: d.uploadedAt instanceof Date ? d.uploadedAt.toISOString() : String(d.uploadedAt),
    })),
    createdAt: client.createdAt instanceof Date ? client.createdAt.toISOString() : String(client.createdAt),
  };
}

export async function createClient(formData: FormData) {
  if (!await requireRole('PARTNER', 'ASSOCIATE')) return { success: false as const, error: 'FORBIDDEN', message: 'Forbidden' };
  const name = String(formData.get('name') ?? '').trim();
  const contactName = String(formData.get('contactName') ?? '').trim();
  const contactTitle = String(formData.get('contactTitle') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();
  const industry = String(formData.get('industry') ?? '').trim();

  if (!name) {
    return { success: false as const, error: 'VALIDATION', message: 'Client name is required.' };
  }

  try {
    const userId = await getCurrentUserId();
    await prisma.client.create({
      data: { userId, name, contactName, contactTitle, email, phone, industry },
    });
    await ensureClientFolder(name, userId);
    revalidatePath('/clients');
    return { success: true as const, message: `Client "${name}" created successfully.` };
  } catch (error) {
    console.error('Client creation failed:', error);
    return { success: false as const, error: 'UNKNOWN', message: 'Failed to create client. The name may already exist.' };
  }
}

export async function createClientFull(formData: FormData) {
  if (!await requireRole('PARTNER', 'ASSOCIATE')) return { success: false as const, error: 'FORBIDDEN', message: 'Forbidden' };
  const name = String(formData.get('name') ?? '').trim();
  const contactName = String(formData.get('contactName') ?? '').trim();
  const contactTitle = String(formData.get('contactTitle') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();
  const industry = String(formData.get('industry') ?? '').trim();
  const status = String(formData.get('status') ?? 'Active').trim() as ClientStatus;
  const notes = String(formData.get('notes') ?? '').trim();
  const registrationNumber = String(formData.get('registrationNumber') ?? '').trim() || null;
  const taxId = String(formData.get('taxId') ?? '').trim() || null;
  const vatNumber = String(formData.get('vatNumber') ?? '').trim() || null;
  const businessType = String(formData.get('businessType') ?? '').trim() as BusinessType | '' || null;
  const dateOfIncorporationStr = String(formData.get('dateOfIncorporation') ?? '').trim();
  const dateOfIncorporation = dateOfIncorporationStr ? new Date(dateOfIncorporationStr) : null;
  const jurisdiction = String(formData.get('jurisdiction') ?? '').trim() || null;
  const registeredAddress = parseJsonField(String(formData.get('registeredAddress') ?? '').trim() || null);
  const billingAddress = parseJsonField(String(formData.get('billingAddress') ?? '').trim() || null);
  const website = String(formData.get('website') ?? '').trim() || null;
  const annualRevenueRange = String(formData.get('annualRevenueRange') ?? '').trim() || null;
  const employeeCountStr = String(formData.get('employeeCount') ?? '').trim();
  const employeeCount = employeeCountStr ? parseInt(employeeCountStr, 10) : null;
  const billingTerms = String(formData.get('billingTerms') ?? '').trim() as BillingTerms | '' || null;
  const creditLimitStr = String(formData.get('creditLimit') ?? '').trim();
  const creditLimit = creditLimitStr ? parseFloat(creditLimitStr) : null;
  const referralSource = String(formData.get('referralSource') ?? '').trim() || null;
  const tagsStr = String(formData.get('tags') ?? '').trim();
  const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [];

  if (!name) {
    return { success: false as const, error: 'VALIDATION', message: 'Client name is required.' };
  }

  try {
    const userId = await getCurrentUserId();
    const client = await prisma.client.create({
      data: {
        userId, name,
        contactName: contactName || null,
        contactTitle: contactTitle || null,
        email: email || null,
        phone: phone || null,
        industry: industry || null,
        status,
        notes: notes || null,
        registrationNumber,
        taxId,
        vatNumber,
        businessType,
        dateOfIncorporation,
        jurisdiction,
        registeredAddress,
        billingAddress,
        website,
        annualRevenueRange,
        employeeCount,
        billingTerms,
        creditLimit,
        referralSource,
        tags,
      },
    });
    await ensureClientFolder(name, userId);
    revalidatePath('/clients');
    return { success: true as const, clientId: client.id, message: `Client "${name}" created successfully.` };
  } catch (error) {
    console.error('Client full creation failed:', error);
    return { success: false as const, error: 'UNKNOWN', message: 'Failed to create client. The name may already exist.' };
  }
}

export async function updateClient(clientId: string, formData: FormData) {
  if (!await requireRole('PARTNER', 'ASSOCIATE')) return { success: false as const, error: 'FORBIDDEN', message: 'Forbidden' };
  const name = String(formData.get('name') ?? '').trim();
  const contactName = String(formData.get('contactName') ?? '').trim();
  const contactTitle = String(formData.get('contactTitle') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();
  const industry = String(formData.get('industry') ?? '').trim();
  const status = String(formData.get('status') ?? 'Active').trim() as ClientStatus;
  const notes = String(formData.get('notes') ?? '').trim();
  const registrationNumber = String(formData.get('registrationNumber') ?? '').trim() || null;
  const taxId = String(formData.get('taxId') ?? '').trim() || null;
  const vatNumber = String(formData.get('vatNumber') ?? '').trim() || null;
  const businessType = String(formData.get('businessType') ?? '').trim() as BusinessType | '' || null;
  const dateOfIncorporationStr = String(formData.get('dateOfIncorporation') ?? '').trim();
  const dateOfIncorporation = dateOfIncorporationStr ? new Date(dateOfIncorporationStr) : null;
  const jurisdiction = String(formData.get('jurisdiction') ?? '').trim() || null;
  const registeredAddress = parseJsonField(String(formData.get('registeredAddress') ?? '').trim() || null);
  const billingAddress = parseJsonField(String(formData.get('billingAddress') ?? '').trim() || null);
  const website = String(formData.get('website') ?? '').trim() || null;
  const annualRevenueRange = String(formData.get('annualRevenueRange') ?? '').trim() || null;
  const employeeCountStr = String(formData.get('employeeCount') ?? '').trim();
  const employeeCount = employeeCountStr ? parseInt(employeeCountStr, 10) : null;
  const billingTerms = String(formData.get('billingTerms') ?? '').trim() as BillingTerms | '' || null;
  const creditLimitStr = String(formData.get('creditLimit') ?? '').trim();
  const creditLimit = creditLimitStr ? parseFloat(creditLimitStr) : null;
  const referralSource = String(formData.get('referralSource') ?? '').trim() || null;
  const tagsStr = String(formData.get('tags') ?? '').trim();
  const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [];

  if (!name) {
    return { success: false as const, error: 'VALIDATION', message: 'Client name is required.' };
  }

  try {
    const userId = await getCurrentUserId();
    const client = await prisma.client.findFirst({ where: { id: clientId, userId } });
    if (!client) {
      return { success: false as const, error: 'NOT_FOUND', message: 'Client not found.' };
    }
    await prisma.client.update({
      where: { id: clientId },
      data: {
        name,
        contactName: contactName || null,
        contactTitle: contactTitle || null,
        email: email || null,
        phone: phone || null,
        industry: industry || null,
        status,
        notes: notes || null,
        registrationNumber,
        taxId,
        vatNumber,
        businessType,
        dateOfIncorporation,
        jurisdiction,
        registeredAddress,
        billingAddress,
        website,
        annualRevenueRange,
        employeeCount,
        billingTerms,
        creditLimit,
        referralSource,
        tags,
      },
    });
    revalidatePath('/clients');
    revalidatePath(`/clients/${clientId}`);
    return { success: true as const, message: 'Client updated successfully.' };
  } catch (error) {
    console.error('Client update failed:', error);
    return { success: false as const, error: 'UNKNOWN', message: 'Failed to update client.' };
  }
}

export type BulkClientInput = {
  name: string;
  contactName?: string;
  contactTitle?: string;
  email?: string;
  phone?: string;
  industry?: string;
  status?: string;
  notes?: string;
  registrationNumber?: string;
  taxId?: string;
  vatNumber?: string;
  businessType?: string;
  dateOfIncorporation?: string;
  jurisdiction?: string;
  registeredAddress?: Record<string, string>;
  billingAddress?: Record<string, string>;
  website?: string;
  annualRevenueRange?: string;
  employeeCount?: number | null;
  billingTerms?: string;
  creditLimit?: number | null;
  referralSource?: string;
  tags?: string[];
};

export async function bulkCreateClients(clients: BulkClientInput[]) {
  if (!await requireRole('PARTNER', 'ASSOCIATE')) return { success: false as const, error: 'FORBIDDEN' as const, message: 'Forbidden' };

  const results: { index: number; name: string; success: boolean; error?: string }[] = [];
  let createdCount = 0;

  for (let i = 0; i < clients.length; i++) {
    const c = clients[i];
    if (!c.name?.trim()) {
      results.push({ index: i, name: '', success: false, error: 'Name is required.' });
      continue;
    }
    try {
      const userId = await getCurrentUserId();
      const client = await prisma.client.create({
        data: {
          userId,
          name: c.name.trim(),
          contactName: c.contactName?.trim() || null,
          contactTitle: c.contactTitle?.trim() || null,
          email: c.email?.trim() || null,
          phone: c.phone?.trim() || null,
          industry: c.industry?.trim() || null,
          status: (c.status as ClientStatus) || 'Active',
          notes: c.notes?.trim() || null,
          registrationNumber: c.registrationNumber?.trim() || null,
          taxId: c.taxId?.trim() || null,
          vatNumber: c.vatNumber?.trim() || null,
          businessType: (c.businessType as BusinessType) || null,
          dateOfIncorporation: c.dateOfIncorporation ? new Date(c.dateOfIncorporation) : null,
          jurisdiction: c.jurisdiction?.trim() || null,
          registeredAddress: c.registeredAddress ?? undefined,
          billingAddress: c.billingAddress ?? undefined,
          website: c.website?.trim() || null,
          annualRevenueRange: c.annualRevenueRange?.trim() || null,
          employeeCount: c.employeeCount ?? null,
          billingTerms: (c.billingTerms as BillingTerms) || null,
          creditLimit: c.creditLimit ?? null,
          referralSource: c.referralSource?.trim() || null,
          tags: c.tags ?? [],
        },
      });
      await ensureClientFolder(client.name, userId);
      results.push({ index: i, name: client.name, success: true });
      createdCount++;
    } catch (error) {
      console.error(`Bulk create row ${i} failed:`, error);
      results.push({ index: i, name: c.name || `Row ${i + 1}`, success: false, error: 'Database error. Name may already exist.' });
    }
  }

  revalidatePath('/clients');
  return { success: true as const, createdCount, total: clients.length, results };
}

export async function deleteClient(clientId: string) {
  if (!await requireRole('PARTNER')) return { success: false as const, error: 'FORBIDDEN', message: 'Forbidden' };
  try {
    const userId = await getCurrentUserId();
    const client = await prisma.client.findFirst({ where: { id: clientId, userId } });
    if (!client) {
      return { success: false as const, error: 'NOT_FOUND', message: 'Client not found.' };
    }
    const activeMatterCount = await prisma.matter.count({
      where: { clientId, status: 'Active', userId },
    });

    if (activeMatterCount > 0) {
      return {
        success: false as const,
        error: 'HAS_ACTIVE_MATTERS' as const,
        message: `Cannot delete client with ${activeMatterCount} active matter(s). Archive or reassign them first.`,
      };
    }

    await prisma.client.delete({ where: { id: clientId } });
    revalidatePath('/clients');
    return { success: true as const, message: 'Client deleted successfully.' };
  } catch (error) {
    console.error('Client deletion failed:', error);
    return { success: false as const, error: 'UNKNOWN', message: 'Failed to delete client.' };
  }
}

export async function getClientDocuments(clientId: string) {
  const userId = await getCurrentUserId();
  const docs = await prisma.clientDocument.findMany({
    where: { clientId, client: { userId } },
    orderBy: { uploadedAt: 'desc' },
  });

  return docs.map((d) => ({
    id: d.id,
    clientId: d.clientId,
    fileName: d.fileName,
    originalName: d.originalName,
    mimeType: d.mimeType,
    fileSize: d.fileSize,
    label: d.label,
    fileUrl: d.fileUrl,
    metadata: d.metadata as Record<string, unknown> | undefined,
    uploadedAt: d.uploadedAt instanceof Date ? d.uploadedAt.toISOString() : String(d.uploadedAt),
  }));
}

export async function createClientDocumentRecord(data: {
  clientId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  label: DocumentLabel;
  fileUrl: string;
  metadata?: Record<string, unknown>;
  }) {
  if (!await requireRole('PARTNER', 'ASSOCIATE')) return { success: false as const, error: 'FORBIDDEN', message: 'Forbidden' };
  await prisma.clientDocument.create({
    data: {
      ...data,
      metadata: data.metadata as object | undefined,
    },
  });
  revalidatePath(`/clients/${data.clientId}`);
  return { success: true as const, message: 'Document uploaded successfully.' };
}

export async function deleteClientDocument(docId: string, clientId: string) {
  if (!await requireRole('PARTNER', 'ASSOCIATE')) return { success: false as const, error: 'FORBIDDEN', message: 'Forbidden' };
  try {
    const userId = await getCurrentUserId();
    const doc = await prisma.clientDocument.findFirst({ where: { id: docId, clientId, client: { userId } } });
    if (!doc) return { success: false as const, error: 'NOT_FOUND', message: 'Document not found.' };
    await prisma.clientDocument.delete({ where: { id: docId } });
    revalidatePath(`/clients/${clientId}`);
    return { success: true as const, message: 'Document deleted.' };
  } catch {
    return { success: false as const, error: 'UNKNOWN', message: 'Failed to delete document.' };
  }
}
