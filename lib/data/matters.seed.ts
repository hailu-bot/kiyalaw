import { prisma } from '../prisma/client';

export async function seedMattersIfEmpty(userId?: string) {
  if (!userId) return { created: [], clients: [] };

  const unlinkedCount = await prisma.matter.count({ where: { clientId: null } });
  if (unlinkedCount > 0) {
    const stark = await prisma.client.findFirst({ where: { name: 'Stark Industries Global', userId } });
    const wayne = await prisma.client.findFirst({ where: { name: 'Wayne Enterprises', userId } });
    if (stark) await prisma.matter.updateMany({ where: { clientName: 'Stark Industries Global', clientId: null, userId }, data: { clientId: stark.id } });
    if (wayne) await prisma.matter.updateMany({ where: { clientName: 'Wayne Enterprises', clientId: null, userId }, data: { clientId: wayne.id } });
  }

  const existingClients = await prisma.client.count({ where: { userId } });
  if (existingClients > 0) return { created: [], clients: [] };

  const stark = await prisma.client.create({
    data: {
      userId,
      name: 'Stark Industries Global',
      contactName: 'Tony Stark',
      contactTitle: 'CEO',
      email: 'tony@starkindustries.com',
      phone: '+1 (212) 555-0147',
      industry: 'Technology & Defense',
      status: 'Active',
    },
  });

  const wayne = await prisma.client.create({
    data: {
      userId,
      name: 'Wayne Enterprises',
      contactName: 'Bruce Wayne',
      contactTitle: 'Founder & Chairman',
      email: 'bruce@wayne.com',
      phone: '+1 (312) 555-0198',
      industry: 'Conglomerate',
      status: 'Active',
    },
  });

  await prisma.matter.updateMany({
    where: { clientName: 'Stark Industries Global', clientId: null, userId },
    data: { clientId: stark.id },
  });

  await prisma.matter.updateMany({
    where: { clientName: 'Wayne Enterprises', clientId: null, userId },
    data: { clientId: wayne.id },
  });

  const existingTimeEntries = await prisma.timeEntry.count({ where: { userId } });
  if (existingTimeEntries === 0) {
    const activeMatters = await prisma.matter.findMany({ where: { userId, status: 'Active' }, take: 2 });
    if (activeMatters.length > 0) {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      await prisma.timeEntry.createMany({
        data: activeMatters.flatMap((m) => [
          {
            userId,
            matterId: m.id,
            description: 'Client consultation regarding case strategy',
            date: today,
            hours: 2.5,
            rate: 850,
            billable: true,
            category: 'Client Consultation',
            attorneyName: 'Robert Harrison',
          },
          {
            userId,
            matterId: m.id,
            description: 'Legal research for upcoming motion',
            date: yesterday,
            hours: 3.0,
            rate: 850,
            billable: true,
            category: 'Legal Research',
            attorneyName: 'Robert Harrison',
          },
        ]),
      });
    }
  }

  const existingMatter1 = await prisma.matter.findUnique({ where: { matterCode: 'MAT-2023-089' } });
  const existingMatter2 = await prisma.matter.findUnique({ where: { matterCode: 'MAT-2023-102' } });

  const matterIds: string[] = [];
  if (!existingMatter1) {
    const m = await prisma.matter.create({
      data: {
        userId,
        matterCode: 'MAT-2023-089',
        title: 'Stark Industries Restructuring',
        clientName: 'Stark Industries Global',
        clientId: stark.id,
        practiceArea: 'Corporate',
        status: 'Active',
        billableTargetHours: 200,
        leadAttorneyName: 'Robert Harrison',
        activities: {
          create: [
            { userId, id: 'act-seed-1', type: 'communication', description: 'Initial kickoff call with client stakeholders; collected restructuring timeline and key constraints.' },
            { userId, id: 'act-seed-2', type: 'document', description: 'Drafted initial restructuring memo and proposed governance changes.' },
          ],
        },
      },
    });
    matterIds.push(m.id);
  }

  if (!existingMatter2) {
    const m = await prisma.matter.create({
      data: {
        userId,
        matterCode: 'MAT-2023-102',
        title: 'Wayne Enterprises vs. Cobblepot Logistics',
        clientName: 'Wayne Enterprises',
        clientId: wayne.id,
        practiceArea: 'Litigation',
        status: 'Pending',
        billableTargetHours: 300,
        leadAttorneyName: 'Sarah Jenkins',
        activities: {
          create: [
            { userId, id: 'act-seed-3', type: 'communication', description: 'Case strategy planning session with litigation team and client counsel.' },
            { userId, id: 'act-seed-4', type: 'time', description: 'Discovery review and issue-spotting for upcoming motion practice.' },
          ],
        },
      },
    });
    matterIds.push(m.id);
  }

  const invoicesWithoutItems = await prisma.invoice.findMany({
    where: { userId, lineItems: { none: {} } },
    take: 5,
  });
  for (const inv of invoicesWithoutItems) {
    await prisma.invoiceLineItem.createMany({
      data: [
        { invoiceId: inv.id, description: 'Legal consultation', hours: 4.5, rate: 850, total: 3825 },
        { invoiceId: inv.id, description: 'Document review', hours: 2.0, rate: 650, total: 1300 },
      ],
    });
  }

  return { created: matterIds, clients: [stark.id, wayne.id] };
}
