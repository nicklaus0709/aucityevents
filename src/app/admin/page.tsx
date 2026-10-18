import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import type { EventRow } from '@/lib/types';

export default async function SelectEvent() {
  const { supabase, user, isSuper, profile } = await requireUser();

  let events: EventRow[] = [];
  if (isSuper) {
    const { data } = await supabase.from('events').select('*').order('created_at');
    events = (data as EventRow[]) ?? [];
  } else {
    const { data } = await supabase.from('event_members').select('events(*)').eq('user_id', user.id);
    events = (data ?? []).map((m) => m.events as unknown as EventRow).filter(Boolean);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl">Seleccioná un evento</h1>
          <p className="text-sm text-stone-600">Hola {profile?.full_name || user.email}. Elegí qué sitio querés administrar.</p>
        </div>
        {isSuper && (
          <div className="flex gap-2">
            <Link href="/admin/usuarios" className="btn-secondary">Usuarios</Link>
            <Link href="/admin/nuevo" className="btn">+ Nuevo evento</Link>
          </div>
        )}
      </div>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((e) => (
          <li key={e.id}>
            <Link href={`/admin/${e.id}`} className="card block transition hover:shadow-md" style={{ borderTop: `4px solid ${e.theme_color}` }}>
              <h2 className="text-xl">{e.name}</h2>
              <p className="mt-1 text-sm text-stone-500">/e/{e.slug}</p>
              <span className={`mt-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${e.is_published ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                {e.is_published ? 'Publicado' : 'Borrador'}
              </span>
            </Link>
          </li>
        ))}
        {events.length === 0 && <li className="text-stone-500">No tenés eventos asignados. Pedile acceso al administrador.</li>}
      </ul>
    </div>
  );
}
