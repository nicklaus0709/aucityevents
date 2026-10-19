import { useState } from 'react';
import { Link } from 'react-router-dom';
import { admin } from '@/lib/api';
import { useAsync } from '@/hooks/useAsync';
import type { EventRow } from '@/lib/types';
import Spinner from '@/components/Spinner';
import Flash from '@/components/admin/Flash';

export default function EventsList() {
  const [reload, setReload] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { data: events, loading } = useAsync(() => admin.list('Event', {}, 'created_date') as Promise<EventRow[]>, [reload]);

  async function seed() {
    if (!window.confirm('Se van a cargar 3 eventos de ejemplo (Navidad, Pascuas y Fiesta Rural). ¿Continuar?')) return;
    setBusy(true);
    setError('');
    try {
      await admin.seedDemo();
      setReload((n) => n + 1);
    } catch {
      setError('No se pudieron cargar los datos de ejemplo');
    }
    setBusy(false);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl">Seleccioná un evento</h1><p className="text-sm text-stone-600">Elegí qué sitio querés administrar.</p></div>
        <div className="flex gap-2"><Link to="/admin/usuarios" className="btn-secondary">Usuarios</Link><Link to="/admin/nuevo" className="btn">+ Nuevo evento</Link></div>
      </div>
      <div className="mt-4"><Flash error={error} /></div>
      {loading ? <Spinner /> : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events?.map((e) => (
            <li key={e.id}>
              <Link to={`/admin/${e.id}`} className="card block transition hover:shadow-md" style={{ borderTop: `4px solid ${e.theme_color}` }}>
                <h2 className="text-xl">{e.name}</h2>
                <p className="mt-1 text-sm text-stone-500">/e/{e.slug}</p>
                <span className={`mt-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${e.is_published ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>{e.is_published ? 'Publicado' : 'Borrador'}</span>
              </Link>
            </li>
          ))}
          {events?.length === 0 && (
            <li className="card col-span-full text-center">
              <p className="text-stone-600">Todavía no hay eventos.</p>
              <button className="btn mt-4" onClick={seed} disabled={busy}>{busy ? 'Cargando…' : 'Cargar datos de ejemplo'}</button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
