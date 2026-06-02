import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import type { DocumentLabel } from '@prisma/client';
import { createClientDocumentRecord } from '@/app/actions/clientActions';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const { user } = await updateSession(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const clientId = formData.get('clientId') as string | null;
    const label = formData.get('label') as string | null;

    if (!file || !clientId || !label) {
      return NextResponse.json({ error: 'Missing required fields: file, clientId, label' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const filePath = `${clientId}/${fileName}`;

    const supabase = createSupabaseServerClient();
    const { error: uploadError } = await supabase.storage
      .from('ClientDocuments')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase storage upload failed:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file to storage.' }, { status: 500 });
    }

    const { data: urlData } = supabase.storage
      .from('ClientDocuments')
      .getPublicUrl(filePath);

    const result = await createClientDocumentRecord({
      clientId,
      fileName,
      originalName: file.name,
      mimeType: file.type,
      fileSize: file.size,
      label: label as DocumentLabel,
      fileUrl: urlData.publicUrl,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, fileUrl: urlData.publicUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Client document upload failed:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
