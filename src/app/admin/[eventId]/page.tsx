import { requireEventAccess } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { formatMoney } from '@/lib/utils';

export default async function Dashboard({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const { event } = await requireEventAccess(eventId);

  const [shows, stalls, ads, photos, newMsgs, sales] = await Promise.all([
    prisma.schedule_items.count({ where: { event_id: eventId } }),
    prisma.food_stalls.count({ where: { event_id: eventId } }),
    prisma.ads.count({ where: { event_id: eventId } }),
    prisma.gallery_images.count({ where: { event_id: eventId } }),
    prisma.contact_messages.count({ where: { event_id: eventId, status: 'nuevo' } }),
    prisma.bono_purchases.findMany({ where: { event_id: eventId, status: 'approved' }, select: { amount: true, redeemed_at: true } }),
  ]);
  const revenue = sales.reduce((a, s) => a + Number(s.amount), 0);

  const stats = [
    { label: 'Shows en grilla', value: shows }, { label: 'Puestos gastronómicos', value: stalls },
    { label: 'Publicidades', value: ads }, { label: 'Fotos', value: photos },
    { label: 'Mensajes nuevos', value: newMsgs }, { label: 'Bonos vendidos', value: sales.length },
    { label: 'Recaudado', value: formatMoney(revenue) }, { label: 'Bonos canjeados', value: sales.filter((s) => s.redeemed_at).length },
  ];
  return (
    <div className="space-y-4">
      {!event.is_published && <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">Este sitio está en <strong>borrador</strong>: el público no lo ve. Activá “Sitio publicado” en la pestaña Contenido.</p>}
      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card"><dt className="text-sm text-stone-500">{s.label}</dt><dd className="mt-1 text-2xl font-extrabold">{s.value}</dd></div>
        ))}
      </dl>
    </div>
  );
}
