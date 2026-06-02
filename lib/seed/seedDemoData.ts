import { prisma } from '@/lib/prisma/client';
import { Prisma } from '@prisma/client';

export async function seedDemoData(userId: string) {
  let codeCounter = 1;

  function uniqueMatterCode(): string {
    return `MAT-${String(codeCounter++).padStart(6, '0')}`;
  }

  // ── Clients (3) ──────────────────────────────────────────
  const clientData = [
    {
      name: 'NovaTech Solutions Inc.',
      contactName: 'Sarah Chen',
      contactTitle: 'General Counsel',
      email: 'sarah.chen@novatech.io',
      phone: '+1 (302) 555-0142',
      industry: 'Software',
      registrationNumber: 'DEL-2024-08921',
      taxId: '47-2891462',
      vatNumber: 'DE329874521',
      businessType: 'LLC' as const,
      dateOfIncorporation: new Date('2019-03-15'),
      jurisdiction: 'Delaware',
      website: 'https://novatech.io',
      annualRevenueRange: '$50M - $100M',
      employeeCount: 340,
      billingTerms: 'Net30' as const,
      creditLimit: new Prisma.Decimal(250000),
      tags: ['tech', 'saas', 'ipo-track'],
    },
    {
      name: 'HealthPlus Medical Group',
      contactName: 'Dr. Marcus Williams',
      contactTitle: 'Chief Medical Officer',
      email: 'm.williams@healthplus.org',
      phone: '+1 (212) 555-0387',
      industry: 'Healthcare',
      registrationNumber: 'NY-2017-45213',
      taxId: '13-3987654',
      vatNumber: 'US874512398',
      businessType: 'Corporation' as const,
      dateOfIncorporation: new Date('2015-11-01'),
      jurisdiction: 'New York',
      website: 'https://healthplus.org',
      annualRevenueRange: '$200M - $500M',
      employeeCount: 1200,
      billingTerms: 'Net45' as const,
      creditLimit: new Prisma.Decimal(500000),
      tags: ['healthcare', 'hipaa', 'merger'],
    },
    {
      name: 'Vertex Capital Partners',
      contactName: 'Jonathan Park',
      contactTitle: 'Managing Partner',
      email: 'jpark@vertexcap.com',
      phone: '+1 (302) 555-0912',
      industry: 'Financial Services',
      registrationNumber: 'DEL-2022-33418',
      taxId: '81-5632147',
      vatNumber: 'DE741258963',
      businessType: 'LLC' as const,
      dateOfIncorporation: new Date('2018-09-10'),
      jurisdiction: 'Delaware',
      website: 'https://vertexcapital.com',
      annualRevenueRange: '$25M - $50M',
      employeeCount: 45,
      billingTerms: 'Net30' as const,
      creditLimit: new Prisma.Decimal(150000),
      tags: ['finance', 'investment', 'sec'],
    },
  ];

  const createdClients: Array<{ id: string; name: string }> = [];

  for (const c of clientData) {
    const client = await prisma.client.create({ data: { userId, ...c } });
    createdClients.push({ id: client.id, name: client.name });

    await prisma.documentFolder.create({
      data: { authorId: userId, name: client.name },
    });
  }

  // ── Matters (6 — 2 per client: 1 Active, 1 Pending) ──────
  const mattersData = [
    { clientIdx: 0, title: 'Series A Funding Round', practiceArea: 'Corporate', status: 'Active' as const, leadAttorneyName: 'Elena Vasquez' },
    { clientIdx: 0, title: 'Patent Portfolio Review', practiceArea: 'Intellectual Property', status: 'Pending' as const, leadAttorneyName: 'James Okafor' },
    { clientIdx: 1, title: 'HIPAA Compliance Audit', practiceArea: 'Healthcare', status: 'Active' as const, leadAttorneyName: 'Amara Singh' },
    { clientIdx: 1, title: 'Merger with MedSync Labs', practiceArea: 'Corporate', status: 'Pending' as const, leadAttorneyName: 'David Kim' },
    { clientIdx: 2, title: 'Fund Formation (Fund III)', practiceArea: 'Corporate', status: 'Active' as const, leadAttorneyName: 'David Kim' },
    { clientIdx: 2, title: 'SEC Filing Advisory', practiceArea: 'Securities', status: 'Pending' as const, leadAttorneyName: 'Elena Vasquez' },
  ];

  const createdMatters: Array<{ id: string; title: string; clientName: string }> = [];

  for (const m of mattersData) {
    const client = createdClients[m.clientIdx];
    const matter = await prisma.matter.create({
      data: {
        userId,
        matterCode: uniqueMatterCode(),
        title: m.title,
        clientName: client.name,
        practiceArea: m.practiceArea,
        status: m.status,
        leadAttorneyName: m.leadAttorneyName,
        billableTargetHours: 120,
        clientId: client.id,
        description: `${m.title} — legal services for ${client.name}`,
      },
    });
    createdMatters.push({ id: matter.id, title: matter.title, clientName: matter.clientName });
  }

  // ── Time Entries (4 — on Active matters) ──────────────────
  const timeEntryData = [
    { matterIdx: 0, description: 'Drafting term sheet for Series A round', hours: 3.5, date: new Date('2026-05-20') },
    { matterIdx: 0, description: 'Investor due diligence review', hours: 5.0, date: new Date('2026-05-21') },
    { matterIdx: 2, description: 'HIPAA gap analysis — initial findings', hours: 6.0, date: new Date('2026-05-22') },
    { matterIdx: 4, description: 'Fund III PPM drafting and review', hours: 7.0, date: new Date('2026-05-22') },
  ];

  for (const t of timeEntryData) {
    const matter = createdMatters[t.matterIdx];
    await prisma.timeEntry.create({
      data: {
        userId,
        matterId: matter.id,
        description: t.description,
        date: t.date,
        hours: new Prisma.Decimal(t.hours),
        rate: new Prisma.Decimal(850),
        billable: true,
        category: 'General',
        attorneyName: 'You',
      },
    });

    await prisma.activity.create({
      data: {
        userId,
        id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        matterId: matter.id,
        type: 'time',
        description: `${t.description} (${t.hours}h)`,
        createdAt: t.date,
      },
    });
  }

  // ── Invoices (2 — 1 Draft, 1 PendingApproval) ────────────
  const invoiceData = [
    { matterIdx: 0, invoiceNumber: 'INV-2026-001', amount: 42500, status: 'Draft' as const, dueDateLabel: 'Net 30' },
    { matterIdx: 2, invoiceNumber: 'INV-2026-002', amount: 32000, status: 'PendingApproval' as const, dueDateLabel: 'Net 45' },
  ];

  for (const inv of invoiceData) {
    const matter = createdMatters[inv.matterIdx];
    const created = await prisma.invoice.create({
      data: {
        userId,
        invoiceNumber: inv.invoiceNumber,
        matterId: matter.id,
        clientName: matter.clientName,
        amount: new Prisma.Decimal(inv.amount),
        dueDateLabel: inv.dueDateLabel,
        status: inv.status,
        lineItems: {
          create: [
            { description: 'Legal consultation & strategy', hours: new Prisma.Decimal(10), rate: new Prisma.Decimal(850), total: new Prisma.Decimal(8500) },
            { description: 'Document review & drafting', hours: new Prisma.Decimal(25), rate: new Prisma.Decimal(850), total: new Prisma.Decimal(21250) },
            { description: 'Research & analysis', hours: new Prisma.Decimal(15), rate: new Prisma.Decimal(850), total: new Prisma.Decimal(12750) },
          ],
        },
      },
    });

    if (inv.status === 'PendingApproval') {
      await prisma.invoiceApproval.create({
        data: {
          invoiceId: created.id,
          approverName: 'You',
          decision: 'approved',
        },
      });
    }
  }

  // ── Documents (2) ─────────────────────────────────────────
  const documentData = [
    { title: 'Engagement Letter — NovaTech', bodyText: 'This Engagement Letter confirms the terms of our legal representation of NovaTech Solutions Inc. in connection with their Series A Funding Round.' },
    { title: 'Mutual Non-Disclosure Agreement', bodyText: 'This Mutual Non-Disclosure Agreement is entered into between Kiya Law and the receiving party for the purpose of evaluating potential business relationships.' },
  ];

  for (const d of documentData) {
    const doc = await prisma.document.create({
      data: { title: d.title, authorId: userId, status: 'Draft' },
    });
    await prisma.documentVersion.create({
      data: {
        documentId: doc.id,
        authorId: userId,
        body: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: d.bodyText }] }] },
        bodyText: d.bodyText,
        versionNumber: 1,
      },
    });
    await prisma.document.update({
      where: { id: doc.id },
      data: { headVersionId: (await prisma.documentVersion.findFirst({ where: { documentId: doc.id }, orderBy: { versionNumber: 'desc' } }))!.id },
    });
  }

  // ── Demo Folders ─────────────────────────────────────────
  const folderNames = ['Contracts', 'Client Documents'];
  for (const name of folderNames) {
    await prisma.documentFolder.create({ data: { authorId: userId, name } });
  }
}
