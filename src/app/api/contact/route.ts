import { z } from 'zod';
import { DEMO } from '@/lib/demo-data';
import { prisma } from '@/lib/db';
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

  if (DEMO) return json({ error: 'Modo demo: el formulario está deshabilitado' }, 503);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: 'Revisá los datos del formulario' }, 400);
  const d = parsed.data;

  if (!(await rateLimit(`contact:${getClientIp(req.headers)}`, 5, 3600))) {
    return json({ error: 'Demasiados envíos. Probá de nuevo más tarde.' }, 429);
  }

  const event = await prisma.events.findFirst({ where: { slug: d.slug, is_published: true }, select: { id: true } });
  if (!event) return json({ error: 'Evento no encontrado' }, 404);

  try {
    await prisma.contact_messages.create({
      data: { event_id: event.id, name: d.name, email: d.email, phone: d.phone || null, type: d.type, message: d.message },
    });
  } catch {
    return json({ error: 'No pudimos enviar tu mensaje' }, 500);
  }
  return json({ ok: true });
}
