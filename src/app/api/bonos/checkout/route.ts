import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateBonoCode, getClientIp, isSameOrigin, json, rateLimit } from '@/lib/security';
import { SITE_URL } from '@/lib/utils';

const schema = z.object({
  slug: z.string().regex(/^[a-z0-9-]{1,60}$/),
  bonoTypeId: z.string().uuid(),
  quantity: z.coerce.number().int().min(1).max(20),
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(150),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  website: z.string().max(0).optional(), // honeypot
});

export async function POST(req: Request) {
  if (!isSameOrigin(req.headers)) return json({ error: 'Origen no permitido' }, 403);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: 'Revisá los datos ingresados' }, 400);
  const d = parsed.data;

  if (!(await rateLimit(`checkout:${getClientIp(req.headers)}`, 10, 3600))) {
    return json({ error: 'Demasiados intentos. Probá más tarde.' }, 429);
  }
  if (!process.env.MP_ACCESS_TOKEN) return json({ error: 'Pagos no configurados' }, 503);

  const db = createAdminClient();
  const { data: event } = await db.from('events').select('id,name,slug,bonos_enabled').eq('slug', d.slug).eq('is_published', true).maybeSingle();
  if (!event?.bonos_enabled) return json({ error: 'Bonos no disponibles' }, 404);

  // El precio SIEMPRE sale de la base de datos, nunca del cliente.
  const { data: bono } = await db.from('bono_types').select('id,name,amount').eq('id', d.bonoTypeId).eq('event_id', event.id).eq('is_active', true).maybeSingle();
  if (!bono) return json({ error: 'Bono no disponible' }, 404);

  const amount = Number(bono.amount) * d.quantity;
  const { data: purchase, error } = await db.from('bono_purchases').insert({
    event_id: event.id, bono_type_id: bono.id, code: generateBonoCode(),
    buyer_name: d.name, buyer_email: d.email, buyer_phone: d.phone || null, quantity: d.quantity, amount,
  }).select('id').single();
  if (error || !purchase) return json({ error: 'No pudimos iniciar la compra' }, 500);

  const back = `${SITE_URL}/e/${event.slug}/bonos/resultado?ref=${purchase.id}`;
  const mp = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: { 'content-type': 'application/json', Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`, 'X-Idempotency-Key': purchase.id },
    body: JSON.stringify({
      items: [{ id: bono.id, title: `${bono.name} - ${event.name}`, quantity: d.quantity, unit_price: Number(bono.amount), currency_id: 'ARS' }],
      payer: { name: d.name, email: d.email },
      external_reference: purchase.id,
      back_urls: { success: back, failure: back, pending: back },
      auto_return: 'approved',
      notification_url: `${SITE_URL}/api/bonos/webhook`,
      statement_descriptor: 'MUNI CAPIOVI',
    }),
    signal: AbortSignal.timeout(15000),
  }).catch(() => null);

  if (!mp?.ok) {
    await db.from('bono_purchases').update({ status: 'cancelled' }).eq('id', purchase.id);
    return json({ error: 'No pudimos conectar con Mercado Pago' }, 502);
  }
  const pref = await mp.json();
  await db.from('bono_purchases').update({ mp_preference_id: pref.id }).eq('id', purchase.id);
  return json({ url: pref.init_point });
}
