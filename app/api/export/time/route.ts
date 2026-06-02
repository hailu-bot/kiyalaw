import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getCurrentUserId } from '@/lib/supabase/get-current-user-role';
import { buildCSV } from '@/lib/csv-export';

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    const entries = await prisma.timeEntry.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      include: { matter: { select: { title: true, clientName: true } } },
    });

    const headers = ['Date', 'Description', 'Matter', 'Client', 'Hours', 'Rate', 'Billable', 'Category', 'Attorney', 'Created At'];
    const rows = entries.map((e) => [
      e.date instanceof Date ? e.date.toISOString().split('T')[0] : String(e.date),
      e.description,
      e.matter?.title ?? '',
      e.matter?.clientName ?? '',
      Number(e.hours).toFixed(2),
      Number(e.rate).toFixed(2),
      e.billable ? 'Yes' : 'No',
      e.category ?? '',
      e.attorneyName ?? '',
      e.createdAt instanceof Date ? e.createdAt.toISOString().split('T')[0] : String(e.createdAt),
    ]);

    const csv = buildCSV(headers, rows);
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="time-entries-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export time entries error:', error);
    if (error instanceof Error && error.message === 'Not authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}