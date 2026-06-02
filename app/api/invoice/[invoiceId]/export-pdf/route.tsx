import React from 'react';
import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { prisma } from '@/lib/prisma/client';
import { Document, Page, View, Text, Image, StyleSheet, renderToBuffer } from '@react-pdf/renderer';
import path from 'path';
import fs from 'fs';

interface PageStampConfig {
  active: boolean;
  right: number;
  bottom: number;
}

const styles = StyleSheet.create({
  page: {
    padding: 56,
    paddingTop: 40,
    fontFamily: 'Times-Roman',
    fontSize: 10,
    color: '#0b1c30',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'column',
    flex: 1,
  },
  headerLogo: {
    maxHeight: 60,
    maxWidth: 240,
    objectFit: 'contain',
    marginBottom: 4,
  },
  headerRight: {
    textAlign: 'right',
    maxWidth: '40%',
  },
  firmContact: {
    fontSize: 8,
    color: '#46464d',
    marginTop: 1,
    lineHeight: 1.5,
  },
  firmContactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  separator: {
    fontSize: 8,
    color: '#c6c6ce',
    marginHorizontal: 3,
  },
  headerDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#0b1c30',
    marginBottom: 20,
  },
  billTo: {
    marginBottom: 16,
  },
  billToLabel: {
    fontSize: 7,
    color: '#7c839f',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  billToName: {
    fontSize: 13,
    fontFamily: 'Times-Roman',
    fontWeight: 'bold',
    color: '#0b1c30',
    marginBottom: 2,
  },
  billToDetail: {
    fontSize: 9,
    color: '#46464d',
    marginBottom: 1,
    lineHeight: 1.5,
  },
  matterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: '#c6c6ce',
    paddingBottom: 10,
    marginBottom: 20,
  },
  matterBlock: {
    flexDirection: 'column',
  },
  matterDates: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  matterDateLine: {
    fontSize: 9,
    color: '#46464d',
    lineHeight: 1.6,
  },
  matterDateLabel: {
    fontSize: 9,
    color: '#7c839f',
  },
  label: {
    fontSize: 7,
    color: '#7c839f',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#0b1c30',
    paddingBottom: 5,
    marginBottom: 4,
  },
  tableHeaderCell: {
    fontSize: 7,
    color: '#7c839f',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#c6c6ce',
    paddingVertical: 4,
  },
  tableCell: {
    fontSize: 9,
    color: '#0b1c30',
  },
  colDesc: { width: '41.7%' },
  colHours: { width: '16.7%', textAlign: 'right' },
  colRate: { width: '16.7%', textAlign: 'right' },
  colTotal: { width: '25%', textAlign: 'right' },
  totals: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 2,
    width: '33%',
  },
  totalLabel: {
    fontSize: 9,
    color: '#46464d',
    width: '50%',
    textAlign: 'right',
    paddingRight: 10,
  },
  totalValue: {
    fontSize: 9,
    color: '#0b1c30',
    width: '50%',
    textAlign: 'right',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#0b1c30',
    paddingVertical: 4,
    width: '33%',
    marginTop: 2,
  },
  grandTotalLabel: {
    fontSize: 11,
    fontFamily: 'Times-Roman',
    fontWeight: 'bold',
    color: '#0b1c30',
    width: '50%',
    textAlign: 'right',
    paddingRight: 10,
  },
  grandTotalValue: {
    fontSize: 11,
    fontFamily: 'Times-Roman',
    fontWeight: 'bold',
    color: '#0b1c30',
    width: '50%',
    textAlign: 'right',
  },
  notes: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#f8f9ff',
    borderWidth: 1,
    borderColor: '#c6c6ce',
  },
  notesLabel: {
    fontSize: 7,
    color: '#7c839f',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 9,
    color: '#46464d',
    lineHeight: 1.5,
  },
  status: {
    fontSize: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderWidth: 1,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    alignSelf: 'flex-start',
  },
});

function PdfStamp({ uri, right, bottom }: { uri: string; right: number; bottom: number }) {
  return (
    <View style={{ position: 'absolute', width: 120, height: 120, right, bottom, transform: 'rotate(-12deg)' }}>
      <Image src={uri} style={{ width: '100%', height: '100%', opacity: 0.85 }} />
    </View>
  );
}

function InvoicePDF({ invoice, lineItems, firm, logoUri, stampUri, pageStamps }: {
  invoice: { invoiceNumber: string; clientName: string; matterTitle: string; amount: number; dueDateLabel: string; createdAt: Date; status: string; notes: string | null; clientEmail: string | null; clientPhone: string | null; clientAddress: string };
  lineItems: { description: string; hours: number; rate: number; total: number }[];
  firm: { name: string; address: string | null; phone: string | null; email: string | null; website: string | null };
  logoUri: string | null;
  stampUri: string;
  pageStamps: Record<number, PageStampConfig>;
}) {
  const subtotal = lineItems.reduce((sum, li) => sum + li.total, 0);
  const total = invoice.amount;

  const firmContactParts = [firm.address].filter(Boolean);
  const firmContactInline = [firm.phone, firm.email, firm.website].filter(Boolean);

  const clientDetails = [
    invoice.clientAddress,
    ...(invoice.clientEmail || invoice.clientPhone
      ? [`${invoice.clientEmail || ''}${invoice.clientEmail && invoice.clientPhone ? '  |  ' : ''}${invoice.clientPhone || ''}`]
      : []),
  ].filter(Boolean);

  const dateStr = new Date(invoice.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const dueStr = invoice.dueDateLabel || 'Upon Receipt';

  const statusColors: Record<string, string> = {
    Draft: '#46464d',
    Pending: '#e65100',
    Approved: '#2e7d32',
    Paid: '#2e7d32',
  };

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {(logoUri) && (
              <Image style={styles.headerLogo} src={logoUri} />
            )}
            {firmContactParts.map((line, i) => (
              <Text key={i} style={styles.firmContact}>{line}</Text>
            ))}
            {firmContactInline.length > 0 && (
              <View style={styles.firmContactRow}>
                {firmContactInline.map((item, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <Text style={styles.separator}>|</Text>}
                    <Text style={styles.firmContact}>{item}</Text>
                  </React.Fragment>
                ))}
              </View>
            )}
          </View>
          <View style={styles.headerRight}>
            <Text style={{ fontSize: 8, color: '#7c839f', letterSpacing: 2, fontWeight: 'bold', marginBottom: 2 }}>Invoice</Text>
            <Text style={{ fontSize: 16, fontFamily: 'Times-Roman', fontWeight: 'bold', color: '#0b1c30' }}>{invoice.invoiceNumber}</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.headerDivider} />

        {/* Bill To */}
        <View style={styles.billTo}>
          <Text style={styles.billToLabel}>Bill To</Text>
          <Text style={styles.billToName}>{invoice.clientName}</Text>
          {clientDetails.map((line, i) => (
            <Text key={i} style={styles.billToDetail}>{line}</Text>
          ))}
        </View>

        {/* Matter + Dates */}
        <View style={styles.matterRow}>
          <View style={styles.matterBlock}>
            <Text style={styles.label}>Matter</Text>
            <Text style={{ fontSize: 10, color: '#0b1c30' }}>{invoice.matterTitle}</Text>
          </View>
          <View style={styles.matterDates}>
            <Text style={styles.matterDateLine}>
              <Text style={styles.matterDateLabel}>Date: </Text>{dateStr}
            </Text>
            <Text style={styles.matterDateLine}>
              <Text style={styles.matterDateLabel}>Due: </Text>{dueStr}
            </Text>
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={{ ...styles.tableHeaderCell, ...styles.colDesc }}>Description</Text>
            <Text style={{ ...styles.tableHeaderCell, ...styles.colHours }}>Hours</Text>
            <Text style={{ ...styles.tableHeaderCell, ...styles.colRate }}>Rate</Text>
            <Text style={{ ...styles.tableHeaderCell, ...styles.colTotal }}>Total</Text>
          </View>
          {lineItems.length === 0 ? (
            <View style={styles.tableRow}>
              <Text style={{ ...styles.tableCell, ...styles.colDesc }}>Legal services</Text>
              <Text style={{ ...styles.tableCell, ...styles.colHours }}>—</Text>
              <Text style={{ ...styles.tableCell, ...styles.colRate }}>—</Text>
              <Text style={{ ...styles.tableCell, ...styles.colTotal }}>${total.toFixed(2)}</Text>
            </View>
          ) : (
            lineItems.map((li, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={{ ...styles.tableCell, ...styles.colDesc }}>{li.description}</Text>
                <Text style={{ ...styles.tableCell, ...styles.colHours }}>{li.hours.toFixed(1)}</Text>
                <Text style={{ ...styles.tableCell, ...styles.colRate }}>${li.rate.toFixed(2)}</Text>
                <Text style={{ ...styles.tableCell, ...styles.colTotal }}>${li.total.toFixed(2)}</Text>
              </View>
            ))
          )}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          {lineItems.length > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {/* Status */}
        <Text style={{ ...styles.status, color: statusColors[invoice.status] || '#46464d', borderColor: statusColors[invoice.status] || '#c6c6ce' }}>
          {invoice.status}
        </Text>

        {/* Stamp */}
        {stampUri && pageStamps[0]?.active && (
          <PdfStamp uri={stampUri} right={pageStamps[0].right} bottom={pageStamps[0].bottom} />
        )}
      </Page>
    </Document>
  );
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ invoiceId: string }> }) {
  const { user } = await updateSession(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { invoiceId } = await params;

    let pageStamps: Record<number, PageStampConfig> = {};
    try {
      const body = await request.json();
      pageStamps = body.pageStamps ?? {};
    } catch {
      // no body or invalid JSON — use empty stamps
    }

    const [invoice, firmProfile] = await Promise.all([
      prisma.invoice.findFirst({
        where: { id: invoiceId, userId: user.id },
        include: {
          lineItems: true,
          matter: {
            select: {
              title: true,
              client: { select: { email: true, phone: true, billingAddress: true } },
            },
          },
        },
      }),
      prisma.firmProfile.findFirst({ orderBy: { createdAt: 'asc' } }),
    ]);

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const firm = {
      name: firmProfile?.firmName || 'Kiya Law',
      address: firmProfile?.address || null,
      phone: firmProfile?.phone || null,
      email: firmProfile?.email || null,
      website: firmProfile?.website || null,
    };

    let logoUri: string | null = null;

    if (firmProfile?.logoUrl) {
      try {
        const resp = await fetch(firmProfile.logoUrl);
        if (resp.ok) {
          const buf = await resp.arrayBuffer();
          const contentType = resp.headers.get('content-type') || 'image/png';
          logoUri = `data:${contentType};base64,${Buffer.from(buf).toString('base64')}`;
        }
      } catch {
        // fall through to local file
      }
    }

    if (!logoUri) {
      const localLogoPath = path.join(process.cwd(), 'public', 'Asset 1.png');
      if (fs.existsSync(localLogoPath)) {
        const buf = fs.readFileSync(localLogoPath);
        const ext = path.extname(localLogoPath).slice(1);
        logoUri = `data:image/${ext};base64,${buf.toString('base64')}`;
      }
    }

    let stampUri = '';
    try {
      const stampPath = path.join(process.cwd(), 'public', 'kiya-stamp.png');
      if (fs.existsSync(stampPath)) {
        stampUri = `data:image/png;base64,${fs.readFileSync(stampPath).toString('base64')}`;
      }
    } catch {
      // stamp not available
    }

    const clientBillingAddress = invoice.matter.client?.billingAddress as Record<string, string> | null | undefined;
    const clientAddressStr = clientBillingAddress
      ? (typeof clientBillingAddress === 'string'
          ? clientBillingAddress
          : [clientBillingAddress.street, clientBillingAddress.city, clientBillingAddress.state, clientBillingAddress.zip, clientBillingAddress.country]
              .filter(Boolean)
              .join(', '))
      : '';

    const lineItems = invoice.lineItems.map(li => ({
      description: li.description,
      hours: Number(li.hours),
      rate: Number(li.rate),
      total: Number(li.total),
    }));

    const buffer = await renderToBuffer(
      <InvoicePDF
        invoice={{
          invoiceNumber: invoice.invoiceNumber,
          clientName: invoice.clientName,
          matterTitle: invoice.matter.title,
          amount: Number(invoice.amount),
          dueDateLabel: invoice.dueDateLabel,
          createdAt: invoice.createdAt,
          status: invoice.status,
          notes: invoice.notes,
          clientEmail: invoice.matter.client?.email ?? null,
          clientPhone: invoice.matter.client?.phone ?? null,
          clientAddress: clientAddressStr,
        }}
        lineItems={lineItems}
        firm={firm}
        logoUri={logoUri}
        stampUri={stampUri}
        pageStamps={pageStamps}
      />
    );

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Invoice-${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Invoice PDF export error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
