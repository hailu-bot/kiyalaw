import { createAuthServerClient } from './auth-server';

export async function getCurrentUserId(): Promise<string> {
  const supabase = await createAuthServerClient();
  let user;
  try {
    const result = await supabase.auth.getUser();
    user = result.data?.user ?? null;
  } catch {
    throw new Error('Not authenticated');
  }
  if (!user) throw new Error('Not authenticated');
  return user.id;
}
