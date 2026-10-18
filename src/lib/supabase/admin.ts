import 'server-only';
import { createClient } from '@supabase/supabase-js';

/**
 * Cliente con service_role: IGNORA RLS. Usar solo en el servidor, después de validar
 * y autorizar la operación manualmente (formulario público, webhook, gestión de usuarios).
 */
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
