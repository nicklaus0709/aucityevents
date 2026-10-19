import { useState } from 'react';
import type { Field } from '@/lib/admin-config';
import { buildPayload } from '@/lib/form';
import FieldInput from './FieldInput';

const WIDE = ['textarea', 'lines', 'image', 'checkbox'];

/** Formulario genérico para una entidad: valida, sube imágenes y entrega el objeto a guardar. */
export default function EntityForm({ fields, initial, idPrefix, submitLabel = 'Guardar', onSubmit, children }: {
  fields: Field[];
  initial?: Record<string, unknown>;
  idPrefix: string;
  submitLabel?: string;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
  children?: React.ReactNode;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0); // fuerza el reseteo del formulario tras guardar

  async function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await onSubmit(await buildPayload(fields, new FormData(e.currentTarget)));
      setVersion((v) => v + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form key={version} onSubmit={handle} className="grid gap-4 sm:grid-cols-2">
      {fields.map((f) => (
        <div key={f.name} className={WIDE.includes(f.type) ? 'sm:col-span-2' : ''}>
          <FieldInput field={f} value={initial?.[f.name]} idPrefix={idPrefix} />
        </div>
      ))}
      {error && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 sm:col-span-2">{error}</p>}
      <div className="flex flex-wrap gap-3 sm:col-span-2">
        <button className="btn" disabled={busy}>{busy ? 'Guardando…' : submitLabel}</button>
        {children}
      </div>
    </form>
  );
}
