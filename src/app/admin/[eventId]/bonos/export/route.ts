import { requireEventAccess } from '@/lib/auth';

/** Evita inyección de fórmulas al abrir el CSV en Excel/Sheets. */
function cell(v: unknown) {
  let s = String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(_req: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const { supabase, event } = await requireEventAccess(eventId);
  const { data } = await supabase
    .from('bono_purchases').select('created_at,code,buyer_name,buyer_email,buyer_phone,quantity,amount,status,redeemed_at,mp_payment_id,bono_types(name)')
    .eq('event_id', eventId).order('created_at');

  const header = ['Fecha', 'Código', 'Comprador', 'Email', 'Teléfono', 'Bono', 'Cantidad', 'Monto', 'Estado', 'Canjeado', 'Pago MP'];
  const rows = (data ?? []).map((p) => [
    p.created_at, p.code, p.buyer_name, p.buyer_email, p.buyer_phone, (p.bono_types as unknown as { name: string } | null)?.name,
    p.quantity, p.amount, p.status, p.redeemed_at, p.mp_payment_id,
  ].map(cell).join(','));

  return new Response('﻿' + [header.map(cell).join(','), ...rows].join('\r\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="bonos-${event.slug}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
