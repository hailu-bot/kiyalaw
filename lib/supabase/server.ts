import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) throw new Error('Missing SUPABASE_URL');
if (!serviceRoleKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');

// Server-side supabase client (service role) for now.
export function createSupabaseServerClient() {
  // TS: env values are validated above, so they are safe to treat as strings.
  return createClient(supabaseUrl as string, serviceRoleKey as string, {
    auth: { persistSession: false },
  });
}



