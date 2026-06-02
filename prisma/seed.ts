import { PrismaClient, ClientStatus, MatterStatus, InvoiceStatus, Role, DocStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting Supabase Prisma seed...');

  // 1. Create a primary user (Internal Test Partner Profile)
  const testUser = await prisma.user.upsert({
    where: { email: 'partner@kiyalaw.com' },
    update: {},
    create: {
      email: 'partner@kiyalaw.com',
      name: 'Kiya & Associates Law Office',
      role: Role.PARTNER,
    },
  });

  const userId = testUser.id;

  // 2. Clients
  const client1 = await prisma.client.create({
    data: {
      userId,
      name: 'Tonga Pharmaceuticals',
      contactName: 'Dr. Aster Kassa',
      status: ClientStatus.Active,
      phone: '+251 911 234 567',
      email: 'aster.kassa@tongapharma.com.et',
      registeredAddress: {
        street: 'Bole Atlas, Nexa Building, 5th Floor',
        city: 'Addis Ababa',
        country: 'Ethiopia'
      },
      businessType: 'Corporation',
      industry: 'Pharmaceuticals'
    }
  });

  const client2 = await prisma.client.create({
    data: {
      userId,
      name: 'Harenna Coffee Exporters',
      contactName: 'Dawit Abreha',
      status: ClientStatus.Active,
      phone: '+251 116 123 456',
      email: 'dawit@harennacoffee.com',
      registeredAddress: {
        street: 'Kirkos, Lancia Area, Coffee Building',
        city: 'Addis Ababa',
        country: 'Ethiopia'
      },
      businessType: 'LLC',
      industry: 'Agriculture/Export'
    }
  });

  const client3 = await prisma.client.create({
    data: {
      userId,
      name: 'Abebe Bikila (Individual)',
      contactName: 'Abebe Bikila',
      status: ClientStatus.Active,
      phone: '+251 922 345 678',
      email: 'abebe.b@gmail.com',
      registeredAddress: {
        street: 'Piazza, Arada',
        city: 'Addis Ababa',
        country: 'Ethiopia'
      },
      businessType: 'SoleProprietorship',
      industry: 'Real Estate'
    }
  });

  const client4 = await prisma.client.create({
    data: {
      userId,
      name: 'Lucy Tech Hub',
      contactName: 'Sara Yilma',
      status: ClientStatus.Active,
      phone: '+251 933 456 789',
      email: 'sara@lucytech.com',
      registeredAddress: {
        street: 'Megenagna, Zefmesh Grand Mall',
        city: 'Addis Ababa',
        country: 'Ethiopia'
      },
      businessType: 'LLC',
      industry: 'Technology'
    }
  });

  // 3. Matters
  const matter1 = await prisma.matter.create({
    data: {
      userId,
      clientId: client2.id,
      matterCode: 'KLA-2026-001',
      title: 'Intellectual Property & Trademark Registration',
      clientName: client2.name,
      practiceArea: 'Corporate/IP',
      status: MatterStatus.Active,
      description: 'Registration of new trademark for Harenna premium coffee blend.',
      leadAttorneyName: 'Kiya',
      billableTargetHours: 20
    }
  });

  const matter2 = await prisma.matter.create({
    data: {
      userId,
      clientId: client1.id,
      matterCode: 'KLA-2026-002',
      title: 'Wholesale Distribution Regulatory Compliance Review',
      clientName: client1.name,
      practiceArea: 'Regulatory',
      status: MatterStatus.Pending,
      description: 'Reviewing compliance requirements for nationwide wholesale drug distribution.',
      leadAttorneyName: 'Kiya',
      billableTargetHours: 50
    }
  });

  const matter3 = await prisma.matter.create({
    data: {
      userId,
      clientId: client3.id,
      matterCode: 'KLA-2026-003',
      title: 'Commercial Lease Agreement Dispute',
      clientName: client3.name,
      practiceArea: 'Litigation',
      status: MatterStatus.Active,
      description: 'Representing client in a dispute over a commercial lease in Piazza area.',
      leadAttorneyName: 'Kiya',
      billableTargetHours: 40
    }
  });

  const matter4 = await prisma.matter.create({
    data: {
      userId,
      clientId: client4.id,
      matterCode: 'KLA-2026-004',
      title: 'Seed Round Financing & Equity Structuring',
      clientName: client4.name,
      practiceArea: 'Corporate Finance',
      status: MatterStatus.Active,
      description: 'Drafting term sheets and equity agreements for seed round.',
      leadAttorneyName: 'Kiya',
      billableTargetHours: 35
    }
  });

  // 4. Invoices
  // Invoice 1 - Paid
  await prisma.invoice.create({
    data: {
      userId,
      matterId: matter1.id,
      invoiceNumber: 'INV-2026-001',
      clientName: matter1.clientName,
      amount: 2500.00,
      dueDateLabel: 'Net 30',
      status: InvoiceStatus.Paid,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      lineItems: {
        create: [
          { description: 'Retainer Fee - 15 Hours @ $120/hr', hours: 15, rate: 120, total: 1800 },
          { description: 'Document Drafting & Notary Filing Fee', hours: 0, rate: 700, total: 700 }
        ]
      }
    }
  });

  // Invoice 2 - Paid
  await prisma.invoice.create({
    data: {
      userId,
      matterId: matter2.id,
      invoiceNumber: 'INV-2026-002',
      clientName: matter2.clientName,
      amount: 1500.00,
      dueDateLabel: 'Due on Receipt',
      status: InvoiceStatus.Paid,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      lineItems: {
        create: [
          { description: 'Preliminary Regulatory Consultation', hours: 10, rate: 150, total: 1500 }
        ]
      }
    }
  });

  // Invoice 3 - Pending/Sent
  await prisma.invoice.create({
    data: {
      userId,
      matterId: matter4.id,
      invoiceNumber: 'INV-2026-003',
      clientName: matter4.clientName,
      amount: 3200.00,
      dueDateLabel: 'Net 15',
      status: InvoiceStatus.PendingApproval, // Treated as pending/sent
      createdAt: new Date(),
      lineItems: {
        create: [
          { description: 'Term Sheet Drafting', hours: 12, rate: 200, total: 2400 },
          { description: 'Telebirr Gateway Setup Consultation', hours: 4, rate: 200, total: 800 }
        ]
      }
    }
  });

  // Invoice 4 - Overdue
  await prisma.invoice.create({
    data: {
      userId,
      matterId: matter3.id,
      invoiceNumber: 'INV-2026-004',
      clientName: matter3.clientName,
      amount: 4500.00,
      dueDateLabel: 'Net 15',
      status: InvoiceStatus.Finalized,
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago, overdue for net 15
      lineItems: {
        create: [
          { description: 'Litigation Representation and Prep', hours: 25, rate: 180, total: 4500 }
        ]
      }
    }
  });

  // 5. Time Entries
  await prisma.timeEntry.createMany({
    data: [
      { userId, matterId: matter1.id, description: 'Client Strategy Session', date: new Date(), hours: 1.5, rate: 120 },
      { userId, matterId: matter3.id, description: 'Federal Court Hearing - Preliminary Objection', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), hours: 4.0, rate: 180 },
      { userId, matterId: matter2.id, description: 'Reviewing FDA-equivalent import guidelines', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), hours: 2.5, rate: 150 },
      { userId, matterId: matter4.id, description: 'Drafting Amended Statement of Claim', date: new Date(), hours: 0.75, rate: 200 },
      { userId, matterId: matter1.id, description: 'Filing trademark application with authority', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), hours: 1.0, rate: 120 }
    ]
  });

  // 6. Document Templates
  const templateBody = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'This is a standard legal template body placeholder.' }] }] };
  
  await prisma.documentTemplate.createMany({
    data: [
      { name: 'Standard Employment Contract (Ethiopian Labour Law Compliant)', description: 'A comprehensive employment agreement adhering to Proclamation No. 1156/2019. File size: ~245 KB PDF / DOCX. Category: Employment', body: templateBody },
      { name: 'Non-Disclosure Agreement (NDA) for Startups & Tech Agencies', description: 'Standard mutual non-disclosure agreement for intellectual property protection. File size: ~180 KB DOCX. Category: Corporate', body: templateBody },
      { name: 'Shareholders\' Agreement & Articles of Association Template', description: 'Corporate governance document template for new company formations. File size: ~320 KB DOCX. Category: Corporate', body: templateBody },
      { name: 'Commercial Property Lease & Rental Agreement', description: 'Lease agreement for commercial spaces in Addis Ababa. File size: ~210 KB DOCX. Category: Real Estate/Litigation', body: templateBody }
    ]
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
