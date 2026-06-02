import { prisma } from '@/lib/prisma/client';
import { getCurrentUserId } from './get-current-user';
import { createAuthServerClient } from './auth-server';
import type { Role } from '@prisma/client';

export { getCurrentUserId };

export async function getCurrentUserRole(): Promise<Role | null> {
  try {
    const userId = await getCurrentUserId();
    let user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (!user) {
      const supabase = await createAuthServerClient();
      const { data } = await supabase.auth.getUser();
      const email = data.user?.email;
      if (!email) return null;
      user = await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: { id: userId, email },
        select: { role: true },
      });
    }
    return user.role;
  } catch {
    return null;
  }
}

export async function requireRole(...allowedRoles: Role[]): Promise<boolean> {
  try {
    const role = await getCurrentUserRole();
    if (!role || !allowedRoles.includes(role)) {
      console.error(`Access denied: required [${allowedRoles.join(', ')}], user has ${role ?? 'none'}`);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
