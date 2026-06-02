import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { listMattersPrisma } from '../../../lib/data/matters.prisma';
import { prisma } from '../../../lib/prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { user } = await updateSession(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const matters = await listMattersPrisma(user.id);
    return NextResponse.json({ matters });
  } catch (error) {
    console.error('Failed to list matters:', error);
    return NextResponse.json({ error: 'Failed to list matters' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await updateSession(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = (await req.json()) as {
      matterCode: string;
      title: string;
      clientName: string;
      practiceArea: string;
      status?: 'Active' | 'Pending' | 'Closed';
      billableTargetHours?: number | null;
      leadAttorneyName?: string | null;
    };

    if (!body.title || !body.clientName || !body.practiceArea) {
      return NextResponse.json({ error: 'Title, client name, and practice area are required' }, { status: 400 });
    }

    const created = await prisma.matter.create({
      data: {
        userId: user.id,
        matterCode: body.matterCode,
        title: body.title,
        clientName: body.clientName,
        practiceArea: body.practiceArea,
        status: body.status ?? 'Active',
        billableTargetHours:
          body.billableTargetHours === undefined || body.billableTargetHours === null
            ? undefined
            : body.billableTargetHours,
        leadAttorneyName:
          body.leadAttorneyName === undefined || body.leadAttorneyName === null
            ? undefined
            : body.leadAttorneyName,
      },
    });

    return NextResponse.json({ matter: created }, { status: 201 });
  } catch (err) {
    console.error('Failed to create matter:', err);
    return NextResponse.json({ error: 'Failed to create matter' }, { status: 400 });
  }
}