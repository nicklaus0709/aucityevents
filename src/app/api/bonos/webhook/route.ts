import { createHmac, timingSafeEqual } from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Webhook de Mercado Pago. Seguridad:
 *  1) Verifica la firma HMAC (x-signature) con MP_WEBHOOK_SECRET.
 *  2) NO confía en el cuerpo: consulta el pago directamente a la API de MP.
 *  3) Valida que el monto cobrado coincida con la compra.
 *  4) Es idempotente.
 */
const STATUS_MAP: Record<string, string> = {
  approved: 'approved', rejected: 'rejected', cancelled: 'cancelled', refunded: 'refunded', charged_back: 'refunded',
};

function validSignature(req: Request, dataId: string) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  const sig = req.headers.get('x-signature');
  const requestId = req.headers.get('x-request-id') ?? '';
  if (!secret || !sig) return false;
  const parts = Object.fromEntries(sig.split(',').map((p) => p.trim().split('=') as [string, string]));
  if (!parts.ts || !parts.v1) return false;
  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${parts.ts};`;
  const expected = createHmac('sha256', secret).update(manifest).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(parts.v1);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const body = await req.json().catch(() => ({}));
  const type = url.searchParams.get('type') ?? url.searchParams.get('topic') ?? body?.type;
  const dataId = url.searchParams.get('data.id') ?? body?.data?.id?.toString();

  if (type !== 'payment' || !dataId || !/^\d{3,20}$/.test(dataId)) return new Response('ignored', { status: 200 });
  if (!validSignature(req, dataId)) return new Response('invalid signature', { status: 401 });

  const res = await fetch(`https://api.mercadopago.com/v1/payments/${dataId}`, {
    headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
    signal: AbortSignal.timeout(15000),
  }).catch(() => null);
  if (!res?.ok) return new Response('retry', { status: 502 }); // MP reintenta
  const payment = await res.json();

  const db = createAdminClient();
  const { data: purchase } = await db.from('bono_purchases').select('id,amount,status').eq('id', payment.external_reference).maybeSingle();
  if (!purchase) return new Response('unknown reference', { status: 200 });

  let status = STATUS_MAP[payment.status] ?? 'pending';
  if (status === 'approved' && (Number(payment.transaction_amount) !== Number(purchase.amount) || payment.currency_id !== 'ARS')) {
    status = 'rejected'; // monto inconsistente: no se acredita
  }
  // Un pago aprobado nunca vuelve a pendiente por una notificación tardía
  if (purchase.status === 'approved' && status === 'pending') return new Response('ok', { status: 200 });

  await db.from('bono_purchases').update({ status, mp_payment_id: String(payment.id) }).eq('id', purchase.id);
  return new Response('ok', { status: 200 });
}
