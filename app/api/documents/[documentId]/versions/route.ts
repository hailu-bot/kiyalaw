import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { saveDocumentVersion } from '../../../../actions/documentActions';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { user } = await updateSession(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { documentId } = await params;

    let body: { body?: object };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!body.body) {
      return NextResponse.json({ error: 'body field is required' }, { status: 400 });
    }

    const result = await saveDocumentVersion(documentId, body.body);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error('Failed to save version:', err);
    return NextResponse.json({ error: 'Failed to save version' }, { status: 400 });
  }
}