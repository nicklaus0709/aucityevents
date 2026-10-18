import { requireEventAccess } from '@/lib/auth';
import { formatMoney } from '@/lib/utils';

export default async function Dashboard({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const { supabase, event } = await requireEventAccess(eventId);

  const count = async (table: string, extra?: (q: any) => any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    let q = supabase.from(table).select('id', { count: 'exact', head: true }).eq('event_id', eventId);
    if (extra) q = extra(q);
    return (await q).count ?? 0;
  };
  const [shows, stalls, ads, photos, newMsgs] = await Promise.all([
    count('schedule_items'), count('food_stalls'), count('ads'), count('gallery_images'),
    count('contact_messages', (q) => q.eq('status', 'nuevo')),
  ]);
  const { data: sales } = await supabase.from('bono_purchases').select('amount,quantity,redeemed_at').eq('event_id', eventId).eq('status', 'approved');
  const revenue = (sales ?? []).reduce((a, s) => a + Number(s.amount), 0);

  const stats = [
    { label: 'Shows en grilla', value: shows }, { label: 'Puestos gastronómicos', value: stalls },
    { label: 'Publicidades', value: ads }, { label: 'Fotos', value: photos },
    { label: 'Mensajes nuevos', value: newMsgs }, { label: 'Bonos vendidos', value: sales?.length ?? 0 },
    { label: 'Recaudado', value: formatMoney(revenue) }, { label: 'Bonos canjeados', value: (sales ?? []).filter((s) => s.redeemed_at).length },
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
