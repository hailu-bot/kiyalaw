import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { getDocument } from '../../../../actions/documentActions';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const { user } = await updateSession(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { documentId } = await params;
  const { searchParams } = new URL(req.url);
  const format = searchParams.get('format') ?? 'html';
  let doc;
  try {
    doc = await getDocument(documentId);
  } catch {
    return NextResponse.json({ error: 'Failed to retrieve document' }, { status: 500 });
  }
  if (!doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  const body = doc.headVersion?.body ?? null;
  let bodyHtml = '';
  if (typeof body === 'string') {
    bodyHtml = body;
  } else if (body && typeof body === 'object' && !Array.isArray(body)) {
    // body can be { html: '...' } (TipTap stored HTML) or a TipTap JSON doc
    if ('html' in body && typeof (body as Record<string, unknown>).html === 'string') {
      bodyHtml = (body as { html: string }).html;
    }
    // If body is a TipTap JSON document, fall back to empty content
  }

  const plainText = bodyHtml.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

  if (format === 'txt') {
    return new NextResponse(plainText || 'Document content is empty.', {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt"`,
      },
    });
  }

  const exportDate = new Date().toLocaleDateString();
  const safeTitle = doc.title.replace(/[^a-zA-Z0-9]/g, '_');

  const sharedHead = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${doc.title}</title>
  <style>
    @page { margin: 20mm; size: A4; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', 'Georgia', 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #0A1128;
      max-width: 210mm;
      margin: 0 auto;
      padding: 25.4mm;
    }
    h1, h2, h3 { font-family: 'Playfair Display', 'Georgia', 'Times New Roman', serif; }
    p { margin-bottom: 1em; }
    strong { font-weight: 600; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { background: #0A1128; color: white; font-weight: 600; font-size: 10pt; padding: 8px 16px; text-align: left; border: 1px solid #0A1128; }
    td { border: 1px solid #c6c6ce; padding: 8px 16px; font-size: 10pt; color: #0A1128; }
    .header {
      display: flex; justify-content: space-between; align-items: flex-end;
      padding-bottom: 24px; border-bottom: 3px solid #0b1c30;
      margin-bottom: 40px; position: relative;
    }
    .header::after {
      content: ''; position: absolute; bottom: -3px; left: 0;
      width: 120px; height: 3px; background: #D4AF37;
    }
    .header-left { display: flex; gap: 16px; align-items: center; }
    .header-icon {
      width: 56px; height: 56px; background: #f8f9ff;
      border: 1px solid #c6c6ce; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .header-icon svg { width: 24px; height: 24px; fill: #D4AF37; }
    .firm-name { font-family: 'Georgia', 'Times New Roman', serif; font-size: 28px; font-weight: 700; color: #0b1c30; line-height: 1; }
    .firm-tagline { font-size: 11px; font-weight: 600; color: #D4AF37; text-transform: uppercase; letter-spacing: 0.2em; margin-top: 4px; }
    .header-address { text-align: right; }
    .header-address p { font-size: 10px; font-weight: 500; color: #46464d; text-transform: uppercase; letter-spacing: 0.05em; margin: 0; line-height: 1.6; }
    .header-address a { font-weight: 600; color: #0b1c30; text-decoration: none; }
    .footer {
      margin-top: 60px; padding-top: 20px; border-top: 1px solid #c6c6ce;
      display: flex; justify-content: space-between; font-size: 9pt; color: #7c839f;
    }
    .footer span { font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-left">
      <div class="header-icon">
        <svg viewBox="0 0 24 24"><path d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22v-3h20v3H2zm18-12v7h3v-7h-3zM11 2L2 6v2h20V6l-9-4zm-1 0h2z"/></svg>
      </div>
      <div>
        <div class="firm-name">Kiya &amp; Associates Law</div>
        <div class="firm-tagline">Elite Corporate Counsel</div>
      </div>
    </div>
    <div class="header-address">
      <p>General Abebe Damtew Av., AN Business Center, 6th Floor</p>
      <p>Addis Ababa, Ethiopia</p>
      <p><a>kiyalaw.com</a> | kiya@kiyalaw.com | +251 11 555 0198</p>
    </div>
  </div>
  <div>
    ${bodyHtml || '<p style="color:#7c839f;font-style:italic;">Document content is empty.</p>'}
  </div>
  <div class="footer">
    <span>Confidential &amp; Privileged</span>
    <span>Page 1 of 1</span>
    <span>Generated: ${exportDate}</span>
  </div>
</body>
</html>`;

  if (format === 'doc') {
    return new NextResponse(sharedHead, {
      headers: {
        'Content-Type': 'application/msword; charset=utf-8',
        'Content-Disposition': `attachment; filename="${safeTitle}.doc"`,
      },
    });
  }

  // Default: HTML export
  return new NextResponse(sharedHead, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `attachment; filename="${safeTitle}.html"`,
    },
  });
}
