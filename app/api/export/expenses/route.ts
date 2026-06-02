import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getCurrentUserId } from '@/lib/supabase/get-current-user-role';
import { buildCSV } from '@/lib/csv-export';

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    const expenses = await prisma.expense.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      include: { matter: { select: { title: true, clientName: true } } },
    });

    const headers = ['Date', 'Description', 'Category', 'Amount', 'Billable', 'Matter', 'Client', 'Notes', 'Created At'];
    const rows = expenses.map((e) => [
      e.date instanceof Date ? e.date.toISOString().split('T')[0] : String(e.date),
      e.description,
      e.category,
      Number(e.amount).toFixed(2),
      e.billable ? 'Yes' : 'No',
      e.matter?.title ?? '',
      e.matter?.clientName ?? '',
      e.notes ?? '',
      e.createdAt instanceof Date ? e.createdAt.toISOString().split('T')[0] : String(e.createdAt),
    ]);

    const csv = buildCSV(headers, rows);
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="expenses-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export expenses error:', error);
    if (error instanceof Error && error.message === 'Not authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}