import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { prisma } from '../../../lib/prisma/client';

export async function POST(req: NextRequest) {
  const { user } = await updateSession(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { name, description, body } = await req.json();

    if (!name || !name.trim() || !body) {
      return NextResponse.json({ error: 'Name and body are required' }, { status: 400 });
    }

    const template = await prisma.documentTemplate.create({
      data: {
        name,
        description,
        body,
      },
    });

    return NextResponse.json({ success: true, template }, { status: 201 });
  } catch (error) {
    console.error('Failed to create template:', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}
