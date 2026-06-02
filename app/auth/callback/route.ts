import { NextResponse } from 'next/server';
import { createAuthServerClient } from '@/lib/supabase/auth-server';
import { prisma } from '@/lib/prisma/client';
import { seedDemoData } from '@/lib/seed/seedDemoData';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createAuthServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.session?.user) {
      const user = data.session.user;
      
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email! },
      });

      if (!existingUser) {
        await prisma.user.create({
          data: {
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.full_name || undefined,
          },
        });
        await seedDemoData(user.id);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?message=Auth%20callback%20failed`);
}
