import { TABLES } from '@/lib/admin-config';
import { MODELS } from '@/lib/db';
import { requireEventAccess } from '@/lib/auth';
import { deleteRow, saveRow } from '@/app/admin/actions';
import FieldInput from './FieldInput';
import Flash from './Flash';

function Hidden({ table, eventId, path, id }: { table: string; eventId: string; path: string; id?: string }) {
  return (
    <>
      <input type="hidden" name="_table" value={table} />
      <input type="hidden" name="_eventId" value={eventId} />
      <input type="hidden" name="_path" value={path} />
      {id && <input type="hidden" name="_id" value={id} />}
    </>
  );
}

/** ABM genérico: lista, alta, edición y baja de cualquier tabla registrada en admin-config. */
export default async function CrudManager({ table, eventId, searchParams }: { table: string; eventId: string; searchParams: { error?: string; ok?: string } }) {
  const cfg = TABLES[table];
  const path = `/admin/${eventId}/${{ gallery_images: 'galeria', schedule_items: 'programacion', food_stalls: 'gastronomia', ads: 'publicidad', bono_types: 'bonos' }[table]}`;
  await requireEventAccess(eventId);
  const rows: Record<string, unknown>[] = await MODELS[table].findMany({
    where: { event_id: eventId },
    orderBy: { [cfg.order.column]: cfg.order.ascending ? 'asc' : 'desc' },
  });

  return (
    <div className="space-y-4">
      <Flash error={searchParams.error} ok={searchParams.ok} />

      <details className="card" open={rows.length === 0}>
        <summary className="cursor-pointer font-semibold text-brand">+ Agregar {cfg.singular}</summary>
        <form action={saveRow} className="mt-4 grid gap-4 sm:grid-cols-2">
          <Hidden table={table} eventId={eventId} path={path} />
          {cfg.fields.map((f) => (
            <div key={f.name} className={f.type === 'textarea' || f.type === 'lines' || f.type === 'image' ? 'sm:col-span-2' : ''}>
              <FieldInput field={f} value={undefined} idPrefix={`new-${table}`} />
            </div>
          ))}
          <div className="sm:col-span-2"><button className="btn">Guardar</button></div>
        </form>
      </details>

      <ul className="space-y-3">
        {rows.map((row) => (
          <li key={row.id}>
            <details className="card">
              <summary className="cursor-pointer font-medium">{cfg.title(row)}</summary>
              <form action={saveRow} className="mt-4 grid gap-4 sm:grid-cols-2">
                <Hidden table={table} eventId={eventId} path={path} id={row.id} />
                {cfg.fields.map((f) => (
                  <div key={f.name} className={f.type === 'textarea' || f.type === 'lines' || f.type === 'image' ? 'sm:col-span-2' : ''}>
                    <FieldInput field={f} value={row[f.name]} idPrefix={row.id} />
                  </div>
                ))}
                <div className="sm:col-span-2"><button className="btn">Guardar cambios</button></div>
              </form>
              <form action={deleteRow} className="mt-3 border-t border-stone-200 pt-3">
                <Hidden table={table} eventId={eventId} path={path} id={row.id} />
                <button className="btn-danger">Eliminar</button>
              </form>
            </details>
          </li>
        ))}
        {rows.length === 0 && <li className="text-sm text-stone-500">Todavía no hay registros.</li>}
      </ul>
    </div>
  );
}
