import { createClient } from '@supabase/supabase-js';

/** Cliente anónimo sin cookies: permite cachear (ISR) las páginas públicas. Solo lee lo que RLS permite. */
export function createPublicClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
