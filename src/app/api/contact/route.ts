import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { getClientIp, isSameOrigin, json, rateLimit } from '@/lib/security';

const schema = z.object({
  slug: z.string().regex(/^[a-z0-9-]{1,60}$/),
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(150),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  type: z.enum(['artista', 'gastronomico', 'comercio', 'consulta', 'otro']),
  message: z.string().trim().min(10).max(2000),
  website: z.string().max(0).optional(), // honeypot: los bots lo completan
});

export async function POST(req: Request) {
  if (!isSameOrigin(req.headers)) return json({ error: 'Origen no permitido' }, 403);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: 'Revisá los datos del formulario' }, 400);
  const d = parsed.data;

  if (!(await rateLimit(`contact:${getClientIp(req.headers)}`, 5, 3600))) {
    return json({ error: 'Demasiados envíos. Probá de nuevo más tarde.' }, 429);
  }

  const db = createAdminClient();
  const { data: event } = await db.from('events').select('id').eq('slug', d.slug).eq('is_published', true).maybeSingle();
  if (!event) return json({ error: 'Evento no encontrado' }, 404);

  const { error } = await db.from('contact_messages').insert({
    event_id: event.id, name: d.name, email: d.email, phone: d.phone || null, type: d.type, message: d.message,
  });
  if (error) return json({ error: 'No pudimos enviar tu mensaje' }, 500);
  return json({ ok: true });
}
