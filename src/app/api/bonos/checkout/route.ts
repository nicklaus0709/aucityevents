import { z } from 'zod';
import { DEMO } from '@/lib/demo-data';
import { prisma } from '@/lib/db';
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
  if (DEMO) return json({ error: 'Modo demo: los pagos están deshabilitados' }, 503);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: 'Revisá los datos ingresados' }, 400);
  const d = parsed.data;

  if (!(await rateLimit(`checkout:${getClientIp(req.headers)}`, 10, 3600))) {
    return json({ error: 'Demasiados intentos. Probá más tarde.' }, 429);
  }
  // Base44 preview only: checkout simulado para poder probar el flujo completo sin
  // credenciales de Mercado Pago. Con el flag ausente o con otro valor, la
  // creación del bono sigue el flujo real (503 si no hay token configurado).
  const simulatePayment = process.env.BASE44_PREVIEW_MODE === '1' && !process.env.MP_ACCESS_TOKEN;
  if (!process.env.MP_ACCESS_TOKEN && !simulatePayment) return json({ error: 'Pagos no configurados' }, 503);

  const event = await prisma.events.findUnique({
    where: { slug: d.slug }, select: { id: true, name: true, slug: true, bonos_enabled: true, is_published: true },
  });
  if (!event?.bonos_enabled || !event.is_published) return json({ error: 'Bonos no disponibles' }, 404);

  // El precio SIEMPRE sale de la base de datos, nunca del cliente.
  const bono = await prisma.bono_types.findFirst({
    where: { id: d.bonoTypeId, event_id: event.id, is_active: true }, select: { id: true, name: true, amount: true },
  });
  if (!bono) return json({ error: 'Bono no disponible' }, 404);

  const amount = Number(bono.amount) * d.quantity;
  const purchase = await prisma.bono_purchases.create({
    data: {
      event_id: event.id, bono_type_id: bono.id, code: generateBonoCode(),
      buyer_name: d.name, buyer_email: d.email, buyer_phone: d.phone || null, quantity: d.quantity, amount,
    },
    select: { id: true },
  });

  const back = `${SITE_URL}/e/${event.slug}/bonos/resultado?ref=${purchase.id}`;

  if (simulatePayment) {
    // Pago simulado: se acredita directo (equivalente al webhook de MP aprobado).
    // URL relativa: sirve en cualquier origen (el preview no corre en localhost).
    await prisma.bono_purchases.update({ where: { id: purchase.id }, data: { status: 'approved', mp_payment_id: `simulado-${purchase.id}` } });
    return json({ url: new URL(back).pathname + new URL(back).search });
  }
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
    await prisma.bono_purchases.update({ where: { id: purchase.id }, data: { status: 'cancelled' } });
    return json({ error: 'No pudimos conectar con Mercado Pago' }, 502);
  }
  const pref = await mp.json();
  await prisma.bono_purchases.update({ where: { id: purchase.id }, data: { mp_preference_id: pref.id } });
  return json({ url: pref.init_point });
}
