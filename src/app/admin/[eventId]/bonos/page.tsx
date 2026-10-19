import Link from 'next/link';
import { requireEventAccess } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { formatDateTime, formatMoney } from '@/lib/utils';
import CrudManager from '@/components/admin/CrudManager';
import Flash from '@/components/admin/Flash';
import { redeemBono } from '../../actions';

const STATUS: Record<string, string> = { pending: 'Pendiente', approved: 'Aprobado', rejected: 'Rechazado', cancelled: 'Cancelado', refunded: 'Reembolsado' };
const COLOR: Record<string, string> = { pending: 'bg-amber-100 text-amber-800', approved: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-800', cancelled: 'bg-stone-200 text-stone-700', refunded: 'bg-purple-100 text-purple-800' };

export default async function Bonos({ params, searchParams }: { params: Promise<{ eventId: string }>; searchParams: Promise<{ error?: string; ok?: string }> }) {
  const { eventId } = await params;
  const sp = await searchParams;
  const { event } = await requireEventAccess(eventId);
  const purchases = await prisma.bono_purchases.findMany({
    where: { event_id: eventId }, orderBy: { created_at: 'desc' }, take: 500,
    include: { bono_type: { select: { name: true } } },
  });

  const approved = purchases.filter((p) => p.status === 'approved');
  const total = approved.reduce((a, p) => a + Number(p.amount), 0);

  return (
    <div className="space-y-8">
      {!event.bonos_enabled && <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">La venta de bonos está deshabilitada. Activala en la pestaña Contenido.</p>}

      <section className="space-y-3">
        <h2 className="text-xl">Validar / canjear bono</h2>
        <Flash error={sp.error} ok={sp.ok} />
        <form action={redeemBono} className="card flex flex-wrap items-end gap-3">
          <input type="hidden" name="_eventId" value={eventId} />
          <div className="min-w-0 flex-1"><label className="label" htmlFor="code">Código del bono</label><input id="code" name="code" required placeholder="ABCDE-FGHJK" maxLength={11} className="input font-mono uppercase" autoComplete="off" /></div>
          <button className="btn">Canjear</button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl">Tipos de bono</h2>
        <CrudManager table="bono_types" eventId={eventId} searchParams={{}} />
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl">Compras</h2>
          <Link href={`/admin/${eventId}/bonos/export`} className="btn-secondary">⬇ Exportar CSV</Link>
        </div>
        <p className="text-sm text-stone-600">Aprobadas: <strong>{approved.length}</strong> · Recaudado: <strong>{formatMoney(total)}</strong> · Canjeadas: <strong>{approved.filter((p) => p.redeemed_at).length}</strong></p>
        <div className="card overflow-x-auto !p-0">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase text-stone-500"><tr><th className="p-3">Fecha</th><th>Comprador</th><th>Bono</th><th>Cant.</th><th>Monto</th><th>Código</th><th>Estado</th><th>Canje</th></tr></thead>
            <tbody>
              {purchases.map((p) => (
                <tr key={p.id} className="border-t border-stone-100">
                  <td className="p-3 whitespace-nowrap">{formatDateTime(p.created_at.toISOString())}</td>
                  <td>{p.buyer_name}<br /><span className="text-xs text-stone-500">{p.buyer_email}</span></td>
                  <td>{p.bono_type?.name}</td>
                  <td>{p.quantity}</td><td>{formatMoney(Number(p.amount))}</td>
                  <td className="font-mono">{p.code}</td>
                  <td><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${COLOR[p.status]}`}>{STATUS[p.status]}</span></td>
                  <td>{p.redeemed_at ? '✔ ' + formatDateTime(p.redeemed_at.toISOString()) : '—'}</td>
                </tr>
              ))}
              {purchases.length === 0 && <tr><td colSpan={8} className="p-4 text-stone-500">Todavía no hay compras.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
