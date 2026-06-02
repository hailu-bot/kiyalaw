import { NextResponse } from 'next/server';
import { buildCSV } from '@/lib/csv-export';
import { CLIENT_CSV_COLUMNS, CLIENT_CSV_TEMPLATE } from '@/lib/csv-import';

export async function GET() {
  const headers = [...CLIENT_CSV_COLUMNS];
  const sampleRow = headers.map((h) => CLIENT_CSV_TEMPLATE[h] ?? '');
  const csv = buildCSV(headers, [sampleRow]);

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="client-import-template.csv"',
    },
  });
}
