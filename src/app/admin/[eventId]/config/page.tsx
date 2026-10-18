import { requireEventAccess } from '@/lib/auth';
import { TABLES } from '@/lib/admin-config';
import { saveRow } from '../../actions';
import FieldInput from '@/components/admin/FieldInput';
import Flash from '@/components/admin/Flash';

export default async function ConfigPage({ params, searchParams }: { params: Promise<{ eventId: string }>; searchParams: Promise<{ error?: string; ok?: string }> }) {
  const { eventId } = await params;
  const sp = await searchParams;
  const { event } = await requireEventAccess(eventId);
  const cfg = TABLES.events;
  const path = `/admin/${eventId}/config`;

  return (
    <form action={saveRow} className="card grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="_table" value="events" />
      <input type="hidden" name="_eventId" value={eventId} />
      <input type="hidden" name="_path" value={path} />
      <div className="sm:col-span-2"><Flash error={sp.error} ok={sp.ok} /></div>
      {cfg.fields.map((f) => (
        <div key={f.name} className={['textarea', 'image', 'checkbox'].includes(f.type) ? 'sm:col-span-2' : ''}>
          <FieldInput field={f} value={(event as unknown as Record<string, unknown>)[f.name]} idPrefix="ev" />
        </div>
      ))}
      <div className="sm:col-span-2"><button className="btn">Guardar cambios</button></div>
    </form>
  );
}
