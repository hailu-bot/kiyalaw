import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export const maxDuration = 300;

export async function GET() {
  try {
    const users = await prisma.user.findMany({ select: { id: true } });
    let totalGenerated = 0;
    for (const user of users) {
      const { runBillingCycleForUser } = await import('@/app/actions/billingActions');
      const result = await runBillingCycleForUser(user.id);
      totalGenerated += result.generated;
    }
    return NextResponse.json({ ok: true, generated: totalGenerated });
  } catch (error) {
    console.error('Cron billing cycle error:', error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
