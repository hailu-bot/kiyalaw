import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getCurrentUserId } from '@/lib/supabase/get-current-user-role';
import { buildCSV } from '@/lib/csv-export';
import { CLIENT_CSV_COLUMNS } from '@/lib/csv-import';

function getAddrField(addr: unknown, field: string): string {
  if (!addr || typeof addr !== 'object') return '';
  const a = addr as Record<string, string>;
  return a[field] ?? '';
}

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    const clients = await prisma.client.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });

    const headers = [...CLIENT_CSV_COLUMNS];
    const rows = clients.map((c) => [
      c.name,
      c.contactName ?? '',
      c.contactTitle ?? '',
      c.email ?? '',
      c.phone ?? '',
      c.industry ?? '',
      c.status,
      c.notes ?? '',
      c.registrationNumber ?? '',
      c.taxId ?? '',
      c.vatNumber ?? '',
      c.businessType ?? '',
      c.dateOfIncorporation instanceof Date ? c.dateOfIncorporation.toISOString().split('T')[0] : '',
      c.jurisdiction ?? '',
      getAddrField(c.registeredAddress, 'street'),
      getAddrField(c.registeredAddress, 'city'),
      getAddrField(c.registeredAddress, 'state'),
      getAddrField(c.registeredAddress, 'zip'),
      getAddrField(c.registeredAddress, 'country'),
      getAddrField(c.billingAddress, 'street'),
      getAddrField(c.billingAddress, 'city'),
      getAddrField(c.billingAddress, 'state'),
      getAddrField(c.billingAddress, 'zip'),
      getAddrField(c.billingAddress, 'country'),
      c.website ?? '',
      c.annualRevenueRange ?? '',
      c.employeeCount != null ? String(c.employeeCount) : '',
      c.billingTerms ?? '',
      c.creditLimit != null ? String(c.creditLimit) : '',
      c.referralSource ?? '',
      (c.tags ?? []).join(', '),
    ]);

    const csv = buildCSV(headers, rows);
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="clients-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export clients error:', error);
    if (error instanceof Error && error.message === 'Not authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}