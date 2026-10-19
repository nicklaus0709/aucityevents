import { requireEventAccess } from '@/lib/auth';
import { prisma } from '@/lib/db';

/** Evita inyección de fórmulas al abrir el CSV en Excel/Sheets. */
function cell(v: unknown) {
  let s = String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(_req: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const { event } = await requireEventAccess(eventId);
  const data = await prisma.bono_purchases.findMany({
    where: { event_id: eventId }, orderBy: { created_at: 'asc' },
    include: { bono_type: { select: { name: true } } },
  });

  const header = ['Fecha', 'Código', 'Comprador', 'Email', 'Teléfono', 'Bono', 'Cantidad', 'Monto', 'Estado', 'Canjeado', 'Pago MP'];
  const rows = data.map((p) => [
    p.created_at.toISOString(), p.code, p.buyer_name, p.buyer_email, p.buyer_phone, p.bono_type?.name,
    p.quantity, Number(p.amount), p.status, p.redeemed_at?.toISOString() ?? '', p.mp_payment_id,
  ].map(cell).join(','));

  return new Response('﻿' + [header.map(cell).join(','), ...rows].join('\r\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="bonos-${event.slug}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
