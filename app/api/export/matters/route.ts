import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getCurrentUserId } from '@/lib/supabase/get-current-user-role';
import { buildCSV } from '@/lib/csv-export';

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    const matters = await prisma.matter.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { invoices: true, timeEntries: true } } },
    });

    const headers = ['Matter Code', 'Title', 'Client Name', 'Practice Area', 'Status', 'Lead Attorney', 'Billable Target Hours', 'Invoices', 'Time Entries', 'Created At'];
    const rows = matters.map((m) => [
      m.matterCode,
      m.title,
      m.clientName,
      m.practiceArea,
      m.status,
      m.leadAttorneyName ?? '',
      m.billableTargetHours ?? '',
      m._count.invoices,
      m._count.timeEntries,
      m.createdAt instanceof Date ? m.createdAt.toISOString().split('T')[0] : String(m.createdAt),
    ]);

    const csv = buildCSV(headers, rows);
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="matters-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export matters error:', error);
    if (error instanceof Error && error.message === 'Not authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}