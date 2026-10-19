import { useState } from 'react';
import { Link, NavLink, Outlet, useOutletContext, useParams } from 'react-router-dom';
import { admin } from '@/lib/api';
import { useAsync } from '@/hooks/useAsync';
import type { EventRow } from '@/lib/types';
import Spinner from '@/components/Spinner';
import NotFound from '@/pages/NotFound';

export interface AdminEventCtx { event: EventRow; reload: () => void }
export const useAdminEvent = () => useOutletContext<AdminEventCtx>();

export default function EventAdmin() {
  const { eventId = '' } = useParams();
  const [version, setVersion] = useState(0);
  const { data: event, loading } = useAsync(async () => {
    try { return (await admin.get('Event', eventId)) as EventRow; } catch { return null; }
  }, [eventId, version]);

  if (loading && !event) return <Spinner />;
  if (!event) return <NotFound />;

  const base = `/admin/${eventId}`;
  const tabs = [
    { to: base, label: 'Resumen', end: true }, { to: `${base}/config`, label: 'Contenido' }, { to: `${base}/galeria`, label: 'Galería' },
    { to: `${base}/programacion`, label: 'Grilla' }, { to: `${base}/gastronomia`, label: 'Gastronomía' }, { to: `${base}/publicidad`, label: 'Publicidad' },
    { to: `${base}/mensajes`, label: 'Mensajes' }, { to: `${base}/bonos`, label: 'Bonos' }, { to: `${base}/qr`, label: 'QR' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Link to="/admin" className="text-sm text-stone-500 hover:underline">← Cambiar de evento</Link>
          <h1 className="text-2xl">{event.name}</h1>
        </div>
        {event.is_published && <Link to={`/e/${event.slug}`} target="_blank" className="btn-secondary">Ver sitio ↗</Link>}
      </div>
      <nav className="no-print -mx-4 flex gap-1 overflow-x-auto border-b border-stone-200 px-4 sm:mx-0 sm:px-0" aria-label="Secciones del evento">
        {tabs.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => `whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium ${isActive ? 'border-brand text-brand' : 'border-transparent text-stone-600 hover:text-stone-900'}`}>{t.label}</NavLink>
        ))}
      </nav>
      <div><Outlet context={{ event, reload: () => setVersion((n) => n + 1) } satisfies AdminEventCtx} /></div>
    </div>
  );
}
