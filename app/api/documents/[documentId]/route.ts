import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { getDocument, updateDocumentTitle } from '../../../actions/documentActions';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { user } = await updateSession(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { documentId } = await params;
    const doc = await getDocument(documentId);
    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    return NextResponse.json({ document: doc });
  } catch (error) {
    console.error('Failed to get document:', error);
    return NextResponse.json({ error: 'Failed to get document' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { user } = await updateSession(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { documentId } = await params;

    let body: { title?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (body.title && typeof body.title === 'string') {
      const result = await updateDocumentTitle(documentId, body.title);
      if (!result.success) {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to update document:', err);
    return NextResponse.json({ error: 'Failed to update document' }, { status: 400 });
  }
}