import { createClient } from '@base44/sdk';
import { DEMO } from '@/lib/demo-data';

/**
 * Cliente de Base44. El App ID sale de VITE_BASE44_APP_ID (lo inyecta `base44 build`).
 * Si no está definido, la app corre en modo demo y NO se hace ninguna llamada a Base44.
 */
export const base44 = createClient({ appId: import.meta.env.VITE_BASE44_APP_ID || 'demo' });

export { DEMO };
