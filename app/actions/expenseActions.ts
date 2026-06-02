'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma/client';
import { Prisma } from '@prisma/client';
import { getCurrentUserId, requireRole } from '@/lib/supabase/get-current-user-role';

export async function getExpenses(params?: {
  matterId?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
}) {
  const userId = await getCurrentUserId();
  const where: Record<string, unknown> = { userId };

  if (params?.matterId) where.matterId = params.matterId;
  if (params?.category) where.category = params.category;
  if (params?.dateFrom || params?.dateTo) {
    const dateFilter: Record<string, Date> = {};
    if (params.dateFrom) dateFilter.gte = new Date(params.dateFrom);
    if (params.dateTo) dateFilter.lte = new Date(params.dateTo);
    where.date = dateFilter;
  }

  const pageSize = 20;
  const page = Math.max(1, params?.page ?? 1);
  const skip = (page - 1) * pageSize;

  const [rows, totalCount] = await Promise.all([
    prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' },
      skip,
      take: pageSize,
      include: {
        matter: { select: { id: true, title: true, clientName: true } },
      },
    }),
    prisma.expense.count({ where }),
  ]);

  return {
    expenses: rows.map((e) => ({
      id: e.id,
      matterId: e.matterId,
      matterTitle: e.matter?.title ?? null,
      clientName: e.matter?.clientName ?? null,
      description: e.description,
      amount: Number(e.amount),
      category: e.category,
      date: e.date instanceof Date ? e.date.toISOString() : String(e.date),
      billable: e.billable,
      receiptUrl: e.receiptUrl,
      notes: e.notes,
      createdAt: e.createdAt instanceof Date ? e.createdAt.toISOString() : String(e.createdAt),
    })),
    totalCount,
    page,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}

export async function createExpense(data: {
  matterId?: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  billable?: boolean;
  notes?: string;
}) {
  if (!await requireRole('PARTNER', 'ASSOCIATE')) return { success: false as const, message: 'Forbidden' };
  const userId = await getCurrentUserId();

  if (!data.description || !data.amount || !data.date) {
    return { success: false as const, message: 'Description, amount, and date are required.' };
  }

  try {
    await prisma.expense.create({
      data: {
        userId,
        matterId: data.matterId || null,
        description: data.description,
        amount: new Prisma.Decimal(data.amount),
        category: data.category || 'Other',
        date: new Date(data.date),
        billable: data.billable ?? true,
        notes: data.notes || null,
      },
    });

    revalidatePath('/expenses');
    if (data.matterId) revalidatePath(`/matters/${data.matterId}`);
    return { success: true as const, message: 'Expense recorded successfully.' };
  } catch (error) {
    console.error('Failed to create expense:', error);
    return { success: false as const, message: 'Failed to record expense.' };
  }
}

export async function deleteExpense(id: string) {
  if (!await requireRole('PARTNER')) return { success: false as const, message: 'Forbidden' };
  try {
    const userId = await getCurrentUserId();
    const expense = await prisma.expense.findFirst({ where: { id, userId } });
    if (!expense) return { success: false as const, message: 'Expense not found.' };

    await prisma.expense.delete({ where: { id } });
    revalidatePath('/expenses');
    if (expense.matterId) revalidatePath(`/matters/${expense.matterId}`);
    return { success: true as const, message: 'Expense deleted.' };
  } catch {
    return { success: false as const, message: 'Failed to delete expense.' };
  }
}
