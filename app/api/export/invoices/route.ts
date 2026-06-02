import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getCurrentUserId } from '@/lib/supabase/get-current-user-role';
import { buildCSV } from '@/lib/csv-export';

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    const invoices = await prisma.invoice.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { matter: { select: { title: true } } },
    });

    const headers = ['Invoice #', 'Client Name', 'Matter', 'Amount', 'Status', 'Due Date', 'Created At'];
    const rows = invoices.map((inv) => [
      inv.invoiceNumber,
      inv.clientName,
      inv.matter?.title ?? '',
      Number(inv.amount).toFixed(2),
      inv.status,
      inv.dueDateLabel,
      inv.createdAt instanceof Date ? inv.createdAt.toISOString().split('T')[0] : String(inv.createdAt),
    ]);

    const csv = buildCSV(headers, rows);
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="invoices-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export invoices error:', error);
    if (error instanceof Error && error.message === 'Not authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}