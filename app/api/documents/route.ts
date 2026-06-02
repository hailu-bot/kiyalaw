import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { listDocuments, createDocument } from '../../actions/documentActions';

export async function GET(req: NextRequest) {
  try {
    const { user } = await updateSession(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const documents = await listDocuments();
    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Failed to list documents:', error);
    return NextResponse.json({ error: 'Failed to list documents' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await updateSession(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let body: { title: string; matterId?: string | null; body?: object | null };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ error: 'Document title is required' }, { status: 400 });
    }

    const result = await createDocument({
      title: body.title,
      matterId: body.matterId ?? null,
      body: body.body ?? null,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error('Failed to create document:', err);
    return NextResponse.json({ error: 'Failed to create document' }, { status: 400 });
  }
}