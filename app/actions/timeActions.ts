'use server';

import { prisma } from '@/lib/prisma/client';
import { revalidatePath } from 'next/cache';
import { getCurrentUserId, requireRole } from '@/lib/supabase/get-current-user-role';

type TimeEntryInput = {
  matterId: string;
  description: string;
  date: string;
  hours: number;
  rate: number;
  billable?: boolean;
  category?: string;
  attorneyName?: string;
  notes?: string;
};

export async function getTimeEntries(filters?: {
  matterId?: string; search?: string; dateFrom?: string; dateTo?: string;
  sortBy?: string; sortDir?: string; page?: number;
}) {
  const userId = await getCurrentUserId();
  try {
    const where: Record<string, unknown> = { userId };
    if (filters?.matterId) where.matterId = filters.matterId;
    if (filters?.search) {
      where.description = { contains: filters.search, mode: 'insensitive' };
    }
    if (filters?.dateFrom || filters?.dateTo) {
      const dateFilter: Record<string, Date> = {};
      if (filters.dateFrom) dateFilter.gte = new Date(filters.dateFrom);
      if (filters.dateTo) dateFilter.lte = new Date(filters.dateTo + 'T23:59:59.999Z');
      where.date = dateFilter;
    }

    const pageSize = 20;
    const page = Math.max(1, filters?.page ?? 1);
    const skip = (page - 1) * pageSize;

    const sortFieldMap: Record<string, string> = { date: 'date', hours: 'hours', createdAt: 'createdAt', description: 'description' };
    const sortField = sortFieldMap[filters?.sortBy ?? ''] || 'date';
    const sortDir = filters?.sortDir === 'asc' ? 'asc' : 'desc';

    const [entries, totalCount] = await Promise.all([
      prisma.timeEntry.findMany({
        where,
        orderBy: { [sortField]: sortDir },
        skip,
        take: pageSize,
        include: { matter: { select: { title: true, clientName: true, matterCode: true, clientId: true } } },
      }),
      prisma.timeEntry.count({ where }),
    ]);

    return {
      entries: entries.map((e) => ({
        id: e.id,
        matterId: e.matterId,
        clientId: e.matter.clientId ?? null,
        description: e.description,
        date: e.date.toISOString(),
        hours: Number(e.hours),
        rate: Number(e.rate),
        billable: e.billable,
        category: e.category,
        attorneyName: e.attorneyName,
        notes: e.notes,
        createdAt: e.createdAt.toISOString(),
        matter: { title: e.matter.title, clientName: e.matter.clientName, matterCode: e.matter.matterCode },
      })),
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  } catch (error) {
    console.error('Failed to fetch time entries:', error);
    return { entries: [], totalCount: 0, page: 1, totalPages: 0 };
  }
}

export async function getTimeEntryById(id: string) {
  const userId = await getCurrentUserId();
  const row = await prisma.timeEntry.findFirst({
    where: { id, userId },
    include: { matter: { select: { title: true, clientName: true, clientId: true, matterCode: true } } },
  });

  if (!row) return null;

  return {
    id: row.id,
    matterId: row.matterId,
    clientId: row.matter.clientId ?? null,
    description: row.description,
    date: row.date.toISOString(),
    hours: Number(row.hours),
    rate: Number(row.rate),
    billable: row.billable,
    category: row.category,
    attorneyName: row.attorneyName,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    matter: { title: row.matter.title, clientName: row.matter.clientName, matterCode: row.matter.matterCode },
  };
}

export async function createTimeEntry(data: TimeEntryInput) {
  if (!await requireRole('PARTNER', 'ASSOCIATE', 'PARALEGAL')) return { success: false as const, error: 'FORBIDDEN', message: 'Forbidden' };
  const userId = await getCurrentUserId();
  try {
    const [entry] = await prisma.$transaction([
      prisma.timeEntry.create({
        data: {
          userId,
          matterId: data.matterId,
          description: data.description,
          date: new Date(data.date),
          hours: data.hours,
          rate: data.rate,
          billable: data.billable ?? true,
          category: data.category,
          attorneyName: data.attorneyName,
          notes: data.notes,
        },
      }),
      prisma.activity.create({
        data: {
          userId,
          id: `act_${crypto.randomUUID().slice(0, 16)}`,
          matterId: data.matterId,
          type: 'time',
          description: data.description,
        },
      }),
    ]);

    revalidatePath('/time');
    revalidatePath('/time/daily');
    revalidatePath('/time/ai-logger');
    revalidatePath(`/matters/${data.matterId}`);

    return {
      success: true as const,
      message: 'Time entry created successfully.',
      data: { id: entry.id },
    };
  } catch (error) {
    console.error('Failed to create time entry:', error);
    return { success: false as const, error: 'UNKNOWN', message: 'Failed to create time entry.' };
  }
}

export async function createQuickTimeEntry(formData: FormData) {
  if (!await requireRole('PARTNER', 'ASSOCIATE', 'PARALEGAL')) return { success: false as const, error: 'FORBIDDEN', message: 'Forbidden' };
  const matterId = String(formData.get('matterId') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const date = String(formData.get('date') ?? '').trim();
  const hoursRaw = parseFloat(String(formData.get('hours') ?? '0'));

  if (!matterId || !description || !date || !hoursRaw || isNaN(hoursRaw) || hoursRaw <= 0) {
    return { success: false as const, error: 'VALIDATION', message: 'Missing required fields or invalid hours' };
  }

  const { getEffectiveRate } = await import('@/app/actions/rateActions');
  const effectiveRate = await getEffectiveRate(matterId);

  return createTimeEntry({
    matterId,
    description,
    date,
    hours: hoursRaw,
    rate: effectiveRate,
    billable: true,
  });
}

export async function updateTimeEntry(id: string, data: Partial<TimeEntryInput>) {
  if (!await requireRole('PARTNER', 'ASSOCIATE', 'PARALEGAL')) return { success: false as const, error: 'FORBIDDEN', message: 'Forbidden' };
  const userId = await getCurrentUserId();
  try {
    const existing = await prisma.timeEntry.findFirst({ where: { id, userId } });
    if (!existing) return { success: false as const, error: 'NOT_FOUND', message: 'Time entry not found.' };
    const updateData: Record<string, unknown> = {};
    if (data.description !== undefined) updateData.description = data.description;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.hours !== undefined) updateData.hours = data.hours;
    if (data.rate !== undefined) updateData.rate = data.rate;
    if (data.billable !== undefined) updateData.billable = data.billable;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.attorneyName !== undefined) updateData.attorneyName = data.attorneyName;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const entry = await prisma.timeEntry.update({
      where: { id },
      data: updateData,
    });

    revalidatePath('/time');
    revalidatePath('/time/daily');
    revalidatePath('/time/ai-logger');
    revalidatePath(`/matters/${entry.matterId}`);

    return { success: true as const, message: 'Time entry updated successfully.' };
  } catch (error) {
    console.error('Failed to update time entry:', error);
    return { success: false as const, error: 'UNKNOWN', message: 'Failed to update time entry.' };
  }
}

export async function deleteTimeEntry(id: string) {
  if (!await requireRole('PARTNER', 'ASSOCIATE', 'PARALEGAL')) return { success: false as const, error: 'FORBIDDEN', message: 'Forbidden' };
  const userId = await getCurrentUserId();
  try {
    const existing = await prisma.timeEntry.findFirst({ where: { id, userId } });
    if (!existing) return { success: false as const, error: 'NOT_FOUND', message: 'Time entry not found.' };
    const entry = await prisma.timeEntry.delete({ where: { id } });

    revalidatePath('/time');
    revalidatePath('/time/daily');
    revalidatePath('/time/ai-logger');
    revalidatePath(`/matters/${entry.matterId}`);

    return { success: true as const, message: 'Time entry deleted.' };
  } catch (error) {
    console.error('Failed to delete time entry:', error);
    return { success: false as const, error: 'UNKNOWN', message: 'Failed to delete time entry.' };
  }
}

export async function getDailyMetrics(date?: string) {
  const userId = await getCurrentUserId();
  try {
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const startOfWeek = new Date(targetDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const dayEntries = await prisma.timeEntry.findMany({
      where: { userId, date: { gte: startOfDay, lte: endOfDay } },
    });

    const weekEntries = await prisma.timeEntry.findMany({
      where: { userId, date: { gte: startOfWeek, lte: endOfWeek } },
    });

    const dayTotal = dayEntries.reduce((sum, e) => sum + Number(e.hours), 0);
    const billableTotal = dayEntries.filter((e) => e.billable).reduce((sum, e) => sum + Number(e.hours), 0);
    const weekTotal = weekEntries.reduce((sum, e) => sum + Number(e.hours), 0);

    const dayOfWeek = targetDate.getDay();
    const weekDays: { day: string; date: string; hours: number; today: boolean }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      const dayEntriesForDate = weekEntries.filter(
        (e) => e.date.toDateString() === d.toDateString()
      );
      const hours = dayEntriesForDate.reduce((sum, e) => sum + Number(e.hours), 0);
      weekDays.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        hours,
        today: i === dayOfWeek,
      });
    }

    const activeMatters = await prisma.matter.count({ where: { userId, status: 'Active' } });

    return {
      dayTotal,
      billableTotal,
      nonBillableTotal: dayTotal - billableTotal,
      weekTotal,
      weekDays,
      entryCount: dayEntries.length,
      activeMatters,
      currentDate: targetDate.toISOString().split('T')[0],
    };
  } catch (error) {
    console.error('Failed to get daily metrics:', error);
    return {
      dayTotal: 0,
      billableTotal: 0,
      nonBillableTotal: 0,
      weekTotal: 0,
      weekDays: [],
      entryCount: 0,
      activeMatters: 0,
      currentDate: new Date().toISOString().split('T')[0],
    };
  }
}

export async function generateTimeSuggestions(matterId?: string) {
  const userId = await getCurrentUserId();
  try {
    const matters = matterId
      ? await prisma.matter.findMany({ where: { id: matterId, userId }, take: 1 })
      : await prisma.matter.findMany({ where: { userId, status: 'Active' }, orderBy: { createdAt: 'desc' }, take: 5 });

    if (matters.length === 0) return [];

    const mattersContext = matters.map(m => `- "${m.title}" (client: ${m.clientName}, area: ${m.practiceArea})`).join('\n');

    const { generateText } = await import('ai');
    const { createGroq } = await import('@ai-sdk/groq');
    const groq = createGroq({ apiKey: process.env.GROQ_API_KEY ?? '' });

    const { text } = await generateText({
      model: groq('llama-3.1-8b-instant'),
      prompt: `You are a legal time tracking assistant. Based on these active matters:
${mattersContext}

Suggest 3 realistic time entries a lawyer might work on. For each, reference the exact matter title from the list above.
Return ONLY a JSON array with no markdown formatting or code blocks. Each entry: { "matterTitle": string (exact match from list), "description": string, "hours": number, "confidence": number (0-100) }`,
    });

    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean) as Array<{ matterTitle: string; description: string; hours: number; confidence: number }>;

    return parsed.map(s => {
      const matched = matters.find(m => m.title.toLowerCase().trim() === s.matterTitle.toLowerCase().trim());
      return {
        matterId: matched?.id ?? '',
        client: matched?.clientName ?? '',
        matter: s.matterTitle,
        description: s.description,
        hours: s.hours,
        confidence: s.confidence,
      };
    });
  } catch (error) {
    console.error('Failed to generate time suggestions:', error);
    return [];
  }
}

export async function refineTimeDescription(description: string, tone: string) {
  await getCurrentUserId();
  try {
    const { generateText } = await import('ai');
    const { createGroq } = await import('@ai-sdk/groq');
    const groq = createGroq({ apiKey: process.env.GROQ_API_KEY ?? '' });

    const toneInstructions: Record<string, string> = {
      formal: 'Use formal legal language with precise terminology. Suitable for billing.',
      concise: 'Short, billable-optimized descriptions. Keep under 80 characters.',
      detailed: 'Expanded narrative with full context. Include scope and purpose.',
    };

    const { text } = await generateText({
      model: groq('llama-3.1-8b-instant'),
      prompt: `Refine this time entry description using "${tone}" style: ${toneInstructions[tone] || toneInstructions.formal}

Original: "${description}"

Return ONLY the refined description, no quotes, no extra text.`,
    });

    return text.trim();
  } catch (error) {
    console.error('Failed to refine description:', error);
    return description;
  }
}

export async function parseNaturalLanguageTime(input: string) {
  const userId = await getCurrentUserId();
  try {
    const matters = await prisma.matter.findMany({
      where: { userId, status: 'Active' },
      select: { id: true, title: true, clientName: true },
      take: 20,
    });
    const mattersContext = matters.map(m => `"${m.title}" (client: ${m.clientName})`).join('\n');

    const { generateText } = await import('ai');
    const { createGroq } = await import('@ai-sdk/groq');
    const groq = createGroq({ apiKey: process.env.GROQ_API_KEY ?? '' });

    const { text } = await generateText({
      model: groq('llama-3.1-8b-instant'),
      prompt: `Parse this time entry description into structured fields. Today is ${new Date().toLocaleDateString()}.

Available matters:
${mattersContext}

User input: "${input}"

Return ONLY valid JSON with no markdown:
{
  "description": "professional billing description",
  "hours": 0.0,
  "matterTitle": "exact matter title from list or empty string",
  "date": "YYYY-MM-DD"
}
If the input mentions a client or matter name, match it to the closest available matter title; if no match, set matterTitle to "". Default date to today if not specified.`,
    });

    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean) as { description: string; hours: number; matterTitle: string; date: string };
    const matched = matters.find(m => m.title.toLowerCase().trim() === parsed.matterTitle.toLowerCase().trim());

    return {
      description: parsed.description || input,
      hours: parsed.hours || 0,
      matterId: matched?.id ?? '',
      matterTitle: matched?.title ?? parsed.matterTitle,
      clientName: matched?.clientName ?? '',
      date: parsed.date || new Date().toISOString().split('T')[0],
    };
  } catch {
    return {
      description: input,
      hours: 0,
      matterId: '',
      matterTitle: '',
      clientName: '',
      date: new Date().toISOString().split('T')[0],
    };
  }
}
