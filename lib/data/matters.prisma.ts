import { prisma } from '../prisma/client';
import type { Activity, ID, Matter } from '../domain/types';

type MatterRow = {
  id: string;
  matterCode: string;

  title: string;
  clientName: string;
  practiceArea: string;
  status: Matter['status'];
  billableTargetHours: number | null;
  leadAttorneyName: string | null;
  createdAt: Date | string;
};

type ActivityRow = {
  id: unknown;
  matterId: string;
  type: Activity['type'];
  description: string;
  createdAt: Date | string;
};

function mapMatter(row: MatterRow): Matter {
  return {
    id: String(row.id),
    matterCode: row.matterCode,
    title: row.title,
    clientName: row.clientName,
    practiceArea: row.practiceArea,
    status: row.status,
    billableTargetHours: row.billableTargetHours ?? undefined,
    leadAttorneyName: row.leadAttorneyName ?? undefined,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
  };
}

function mapActivity(row: ActivityRow): Activity {
  return {
    id: String(row.id),
    matterId: String(row.matterId),
    type: row.type,
    description: row.description,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
  };
}


export async function listMattersPrisma(userId?: string): Promise<Matter[]> {
  const rows = await prisma.matter.findMany({
    where: userId ? { userId } : undefined,
    orderBy: { createdAt: 'desc' },
    include: { activities: false },
  });

  return rows.map(mapMatter);
}


export async function getMatterByIdPrisma(matterId: ID, userId?: string): Promise<{ matter: Matter; activities: Activity[] } | null> {
  const row = await prisma.matter.findFirst({
    where: { id: matterId, ...(userId ? { userId } : {}) },
    include: {
      activities: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!row) return null;

  return {
    matter: mapMatter(row),
    activities: row.activities.map(mapActivity),
  };
}

