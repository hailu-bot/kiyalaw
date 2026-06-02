import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import React from 'react';
import fs from 'fs';
import path from 'path';
import { Document, Page, View, Text, Image, StyleSheet, renderToBuffer, Font } from '@react-pdf/renderer';
import { Html } from 'react-pdf-html';

interface PageStampConfig {
  active: boolean;
  right: number;
  bottom: number;
}

const MARGIN = 72;

const styles = StyleSheet.create({
  page: {
    padding: MARGIN,
    paddingTop: 110,
    paddingBottom: 60,
    fontFamily: 'Inter', // Use Inter for body text as per design system
    fontSize: 11,
    lineHeight: 1.5,
    color: '#0A1128',
  },
  header: {
    position: 'absolute',
    top: 36,
    left: MARGIN,
    right: MARGIN,
    borderBottom: '2 solid #0b1c30',
    paddingBottom: 6,
  },
  footer: {
    position: 'absolute',
    bottom: 28,
    left: MARGIN,
    right: MARGIN,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: '1 solid #c6c6ce',
    paddingTop: 6,
    fontSize: 8,
    color: '#7c839f',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  stampContainer: {
    position: 'absolute',
    width: 120,
    height: 120,
  },
});

function splitHtmlAtPageBreaks(html: string): string[] {
  const marker = '<div data-type="page-break"';
  if (!html.includes(marker)) return [html];
  const segments: string[] = [];
  let remaining = html;
  while (remaining.length > 0) {
    const idx = remaining.indexOf(marker);
    if (idx === -1) { segments.push(remaining); break; }
    const before = remaining.slice(0, idx);
    if (before.trim()) segments.push(before);
    const restStart = remaining.indexOf('</div>', idx);
    remaining = restStart !== -1 ? remaining.slice(restStart + 6) : '';
    if (!segments.length && !remaining.trim()) segments.push('');
  }
  if (!segments.length) segments.push('');
  return segments;
}

function PdfHeader({ uri }: { uri: string }) {
  return (
    <View style={styles.header} fixed>
      <Image src={uri} style={{ width: 468, height: 55 }} />
    </View>
  );
}

function PdfFooter({ pageNum, totalPages, refNum }: { pageNum: number; totalPages: number; refNum: string }) {
  return (
    <View style={styles.footer} fixed>
      <Text>Confidential & Privileged Work Product</Text>
      <Text>Ref: KL-{refNum}</Text>
      <Text>Page {pageNum} of {totalPages}</Text>
    </View>
  );
}

function PdfStamp({ uri, right, bottom }: { uri: string; right: number; bottom: number }) {
  return (
    <View style={[styles.stampContainer, { right, bottom, transform: 'rotate(-12deg)' }]}>
      <Image src={uri} style={{ width: '100%', height: '100%', opacity: 0.85 }} />
    </View>
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const { user: _ } = await updateSession(req);
  if (!_) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { documentId } = await params;
  let body: { html?: string; pageStamps?: Record<number, PageStampConfig> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const html = body.html?.trim();
  if (!html) {
    return NextResponse.json({ error: 'html field is required' }, { status: 400 });
  }

  // Register custom fonts for PDF rendering
Font.register({
  family: 'Inter',
  fonts: [
    { src: '/Fonts/Inter-Regular.otf' },
    { src: '/Fonts/Inter-Bold.otf', fontWeight: 700 },
  ],
});

Font.register({
  family: 'Playfair Display',
  fonts: [
    { src: '/Fonts/PlayfairDisplay-Regular.ttf' },
    { src: '/Fonts/PlayfairDisplay-Italic.ttf', fontStyle: 'italic' },
  ],
});
  // Keep original HTML styling (fonts are already registered)
  const sanitizedHtml = html;

  const pageStamps: Record<number, PageStampConfig> = body.pageStamps ?? {};

  let stampUri = '';
  let headerUri = '';
  try {
    const stampPath = path.join(process.cwd(), 'public', 'kiya-stamp.png');
    if (fs.existsSync(stampPath)) {
      stampUri = `data:image/png;base64,${fs.readFileSync(stampPath).toString('base64')}`;
    }
    const headerPath = path.join(process.cwd(), 'public', 'Header.png');
    if (fs.existsSync(headerPath)) {
      headerUri = `data:image/png;base64,${fs.readFileSync(headerPath).toString('base64')}`;
    }
  } catch (e) {
    console.error('[PDF Export] Failed to read image assets:', e);
  }

  const segments = splitHtmlAtPageBreaks(sanitizedHtml);
  const totalPages = segments.length;
  const refNum = documentId.slice(-6).toUpperCase();

  const PdfDocument = () => (
    <Document>
      {segments.map((segment, i) => {
        const stamp = pageStamps[i];
        const showStamp = stamp?.active;
        return (
          <Page key={i} size="LETTER" style={styles.page} wrap>
            <PdfHeader uri={headerUri} />
            <View style={{ flex: 1 }}>
              <Html style={{ fontFamily: 'Inter' }}>{segment}</Html>
            </View>
            <PdfFooter pageNum={i + 1} totalPages={totalPages} refNum={refNum} />
            {showStamp && (
              <PdfStamp uri={stampUri} right={stamp.right} bottom={stamp.bottom} />
            )}
          </Page>
        );
      })}
    </Document>
  );

  try {
    const buffer = await renderToBuffer(<PdfDocument />);
    const uint8 = new Uint8Array(buffer);
    return new NextResponse(uint8, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="document-${refNum}.pdf"`,
      },
    });
  } catch (err) {
    console.error('[PDF Export] Error:', err);
    return NextResponse.json(
      { error: 'PDF generation failed', details: String(err) },
      { status: 500 }
    );
  }
}
