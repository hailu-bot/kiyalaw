import { tool } from 'ai';
import { z } from 'zod/v4';
import { prisma } from '@/lib/prisma/client';

export const queryDashboard = tool({
  description: 'Get firm-wide summary statistics including active matters, draft invoices, outstanding receivables, and recent activity.',
  inputSchema: z.object({}),
  execute: async () => {
    const [activeMatters, draftInvoices, allInvoices, recentActivity] = await Promise.all([
      prisma.matter.count({ where: { status: 'Active' } }),
      prisma.invoice.count({ where: { status: 'Draft' } }),
      prisma.invoice.findMany({ select: { amount: true, status: true } }),
      prisma.activity.findMany({ orderBy: { createdAt: 'desc' }, take: 10, include: { matter: { select: { title: true } } } }),
    ]);

    const outstanding = allInvoices
      .filter((inv) => inv.status === 'Draft' || inv.status === 'PendingApproval')
      .reduce((sum, inv) => sum + Number(inv.amount), 0);

    return {
      activeMatters,
      draftInvoices,
      outstandingReceivables: outstanding,
      recentActivity: recentActivity.map((a) => ({
        type: a.type,
        description: a.description,
        matter: a.matter.title,
        createdAt: a.createdAt.toISOString(),
      })),
    };
  },
});

export const queryClient = tool({
  description: 'Get detailed information about a specific client by name or ID, including matters, documents, and invoice totals.',
  inputSchema: z.object({
    query: z.string().describe('Client name or ID to search for'),
  }),
  execute: async ({ query }) => {
    const client = await prisma.client.findFirst({
      where: {
        OR: [
          { id: query },
          { name: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        _count: { select: { matters: true, clientDocuments: true } },
        matters: {
          select: { id: true, title: true, status: true, practiceArea: true },
          take: 20,
        },
        clientDocuments: {
          select: { id: true, originalName: true, label: true, uploadedAt: true },
          take: 20,
        },
      },
    });

    if (!client) return { error: `Client not found: ${query}` };

    return {
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      industry: client.industry,
      status: client.status,
      matterCount: client._count.matters,
      documentCount: client._count.clientDocuments,
      matters: client.matters,
      documents: client.clientDocuments,
    };
  },
});

export const queryMatter = tool({
  description: 'Get detailed information about a specific matter by ID or title, including invoices, time entries, and activity.',
  inputSchema: z.object({
    query: z.string().describe('Matter ID, code, or title to search for'),
  }),
  execute: async ({ query }) => {
    const matter = await prisma.matter.findFirst({
      where: {
        OR: [
          { id: query },
          { matterCode: { contains: query, mode: 'insensitive' } },
          { title: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        client: { select: { name: true } },
        _count: { select: { invoices: true, timeEntries: true, activities: true } },
        invoices: { select: { invoiceNumber: true, amount: true, status: true }, take: 10 },
        timeEntries: { select: { description: true, hours: true, date: true }, take: 10 },
      },
    });

    if (!matter) return { error: `Matter not found: ${query}` };

    return {
      id: matter.id,
      matterCode: matter.matterCode,
      title: matter.title,
      clientName: matter.client?.name || matter.clientName,
      practiceArea: matter.practiceArea,
      status: matter.status,
      invoiceCount: matter._count.invoices,
      timeEntryCount: matter._count.timeEntries,
      activityCount: matter._count.activities,
      invoices: matter.invoices,
      timeEntries: matter.timeEntries,
    };
  },
});

export const listRecentActivity = tool({
  description: 'List the most recent activities across all matters, with optional limit.',
  inputSchema: z.object({
    limit: z.number().optional().default(10).describe('Number of recent activities to return (max 50)'),
  }),
  execute: async ({ limit }) => {
    const activities = await prisma.activity.findMany({
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit || 10, 50),
      include: { matter: { select: { title: true, matterCode: true } } },
    });

    return activities.map((a) => ({
      id: a.id,
      type: a.type,
      description: a.description,
      matterTitle: a.matter.title,
      matterCode: a.matter.matterCode,
      createdAt: a.createdAt.toISOString(),
    }));
  },
});

export const suggestActions = tool({
  description: 'Analyze firm data and suggest proactive actions. Returns a list of suggestions with priority levels.',
  inputSchema: z.object({}),
  execute: async () => {
    const suggestions: Array<{ priority: 'high' | 'medium' | 'low'; category: string; message: string }> = [];

    const [overdueInvoices, clientsWithoutDocs, unbilledTime] = await Promise.all([
      prisma.invoice.findMany({
        where: { status: 'Draft', createdAt: { lte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        select: { invoiceNumber: true, clientName: true, amount: true },
        take: 5,
      }),
      prisma.client.findMany({
        where: { clientDocuments: { none: {} } },
        select: { id: true, name: true },
        take: 10,
      }),
      prisma.timeEntry.findMany({
        where: { billable: true },
        select: { id: true, description: true, hours: true, matter: { select: { title: true, clientName: true } } },
        take: 10,
      }),
    ]);

    if (overdueInvoices.length > 0) {
      const total = overdueInvoices.reduce((s, i) => s + Number(i.amount), 0);
      suggestions.push({
        priority: 'high' as const,
        category: 'Billing',
        message: `${overdueInvoices.length} draft invoices older than 30 days totaling $${total.toLocaleString()} need attention (${overdueInvoices.map(i => i.invoiceNumber).join(', ')}).`,
      });
    }

    if (clientsWithoutDocs.length > 0) {
      suggestions.push({
        priority: 'medium' as const,
        category: 'Compliance',
        message: `${clientsWithoutDocs.length} client(s) have no uploaded documents: ${clientsWithoutDocs.map(c => c.name).join(', ')}. Consider requesting onboarding documents.`,
      });
    }

    if (unbilledTime.length > 0) {
      const totalHours = unbilledTime.reduce((s, t) => s + Number(t.hours), 0);
      suggestions.push({
        priority: 'medium' as const,
        category: 'Time Tracking',
        message: `${unbilledTime.length} unbilled time entries totaling ${totalHours} hours exist. Consider generating invoices.`,
      });
    }

    if (suggestions.length === 0) {
      suggestions.push({
        priority: 'low' as const,
        category: 'General',
        message: 'All metrics look healthy. No action items detected.',
      });
    }

    return suggestions;
  },
});

export const auditCompliance = tool({
  description: 'Run a compliance audit checking for missing required documents, overdue invoices, and inactive matters.',
  inputSchema: z.object({}),
  execute: async () => {
    const [clients, activeMatters, invoices] = await Promise.all([
      prisma.client.findMany({
        select: { id: true, name: true, _count: { select: { clientDocuments: true, matters: true } } },
      }),
      prisma.matter.count({ where: { status: 'Active' } }),
      prisma.invoice.findMany({
        where: { status: { in: ['Draft', 'PendingApproval'] } },
        select: { invoiceNumber: true, clientName: true, amount: true, status: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    const clientsMissingDocs = clients.filter((c) => c._count.clientDocuments === 0);
    const totalOutstanding = invoices.reduce((s, i) => s + Number(i.amount), 0);

    return {
      totalClients: clients.length,
      activeMatters,
      clientsWithNoDocuments: clientsMissingDocs.length,
      clientsMissingDocsList: clientsMissingDocs.map((c) => ({ id: c.id, name: c.name })),
      overdueInvoices: invoices.length,
      outstandingTotal: totalOutstanding,
      invoiceDetail: invoices.map((i) => ({
        number: i.invoiceNumber,
        client: i.clientName,
        amount: Number(i.amount),
        status: i.status,
        age: Math.floor((Date.now() - i.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
      })),
    };
  },
});

export const allTools = {
  queryDashboard,
  queryClient,
  queryMatter,
  listRecentActivity,
  suggestActions,
  auditCompliance,
};
