import { useState } from 'react';
import { TABLES } from '@/lib/admin-config';
import { admin } from '@/lib/api';
import type { EntityName } from '@/lib/types';
import { useAsync } from '@/hooks/useAsync';
import EntityForm from './EntityForm';
import Flash from './Flash';
import Spinner from '@/components/Spinner';

/** ABM genérico: lista, alta, edición y baja de cualquier entidad registrada en admin-config. */
export default function CrudManager({ entity, eventId }: { entity: Exclude<EntityName, 'Event'>; eventId: string }) {
  const cfg = TABLES[entity];
  const [reload, setReload] = useState(0);
  const [flash, setFlash] = useState<{ ok?: string; error?: string }>({});
  const { data: rows, loading, error } = useAsync(
    () => admin.list(entity, { event_id: eventId }, cfg.order.ascending ? cfg.order.column : `-${cfg.order.column}`),
    [entity, eventId, reload],
  );

  async function save(id: string | null, payload: Record<string, unknown>) {
    if (entity === 'FoodStall') {
      const dup = (rows ?? []).some((r) => r.number === payload.number && r.id !== id); // Base44 no tiene restricciones únicas
      if (dup) throw new Error('Ya existe un puesto con ese número');
    }
    if (id) await admin.update(entity, id, payload);
    else await admin.create(entity, { ...payload, event_id: eventId });
    setFlash({ ok: 'Guardado' });
    setReload((n) => n + 1);
  }

  async function remove(id: string) {
    if (!window.confirm(`¿Eliminar ${cfg.singular}? Esta acción no se puede deshacer.`)) return;
    try {
      await admin.remove(entity, id);
      setFlash({ ok: 'Eliminado' });
      setReload((n) => n + 1);
    } catch { setFlash({ error: 'No se pudo eliminar' }); }
  }

  return (
    <div className="space-y-4">
      <Flash error={flash.error} ok={flash.ok} />
      <details className="card" open={!loading && !rows?.length}>
        <summary className="cursor-pointer font-semibold text-brand">+ Agregar {cfg.singular}</summary>
        <div className="mt-4"><EntityForm fields={cfg.fields} idPrefix={`new-${entity}`} onSubmit={(p) => save(null, p)} /></div>
      </details>

      {loading && !rows ? <Spinner /> : error ? <Flash error="No se pudo cargar la lista" /> : (
        <ul className="space-y-3">
          {rows?.map((row) => (
            <li key={row.id}>
              <details className="card">
                <summary className="cursor-pointer font-medium">{cfg.title(row)}</summary>
                <div className="mt-4">
                  <EntityForm fields={cfg.fields} initial={row} idPrefix={row.id} submitLabel="Guardar cambios" onSubmit={(p) => save(row.id, p)}>
                    <button type="button" className="btn-danger" onClick={() => remove(row.id)}>Eliminar</button>
                  </EntityForm>
                </div>
              </details>
            </li>
          ))}
          {rows?.length === 0 && <li className="text-sm text-stone-500">Todavía no hay registros.</li>}
        </ul>
      )}
    </div>
  );
}
