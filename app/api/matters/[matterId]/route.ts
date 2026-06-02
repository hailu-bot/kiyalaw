import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { getMatterByIdPrisma } from '../../../../lib/data/matters.prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ matterId: string }> }
) {
  try {
    const { user } = await updateSession(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const resolved = await params;
    const matterId = resolved.matterId;

    const result = await getMatterByIdPrisma(matterId, user.id);
    if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to get matter:', error);
    return NextResponse.json({ error: 'Failed to get matter' }, { status: 500 });
  }
}