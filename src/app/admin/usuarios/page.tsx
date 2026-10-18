import Link from 'next/link';
import { requireSuperAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import Flash from '@/components/admin/Flash';
import { addMembership, createUser, deleteUser, removeMembership } from '../actions';

export default async function Users({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const { user } = await requireSuperAdmin();
  const sp = await searchParams;
  const db = createAdminClient(); // autorizado: requireSuperAdmin() ya validó el rol

  const [{ data: events }, { data: profiles }, { data: members }] = await Promise.all([
    db.from('events').select('id,name').order('name'),
    db.from('profiles').select('id,email,full_name,role,created_at').order('created_at'),
    db.from('event_members').select('user_id,event_id,role'),
  ]);

  return (
    <div className="space-y-8">
      <div><Link href="/admin" className="text-sm text-stone-500 hover:underline">← Volver</Link><h1 className="text-2xl">Usuarios</h1></div>
      <Flash error={sp.error} ok={sp.ok} />

      <details className="card">
        <summary className="cursor-pointer font-semibold text-brand">+ Crear usuario</summary>
        <form action={createUser} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="full_name">Nombre</label><input id="full_name" name="full_name" required minLength={2} maxLength={100} className="input" /></div>
          <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required className="input" /></div>
          <div><label className="label" htmlFor="password">Contraseña inicial (mín. 12)</label><input id="password" name="password" type="password" required minLength={12} autoComplete="new-password" className="input" /></div>
          <div><label className="label" htmlFor="role">Rol en los eventos</label><select id="role" name="role" className="input"><option value="editor">Editor</option><option value="admin">Administrador</option></select></div>
          <fieldset className="sm:col-span-2"><legend className="label">Eventos a los que accede</legend>
            <div className="flex flex-wrap gap-4">{events?.map((e) => <label key={e.id} className="flex items-center gap-2 text-sm"><input type="checkbox" name="events" value={e.id} />{e.name}</label>)}</div>
          </fieldset>
          <div className="sm:col-span-2"><button className="btn">Crear usuario</button></div>
        </form>
      </details>

      <ul className="space-y-3">
        {profiles?.map((p) => {
          const mine = members?.filter((m) => m.user_id === p.id) ?? [];
          const free = events?.filter((e) => !mine.some((m) => m.event_id === e.id)) ?? [];
          return (
            <li key={p.id} className="card space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div><p className="font-semibold">{p.full_name || p.email}{p.role === 'super_admin' && <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-800">Super admin</span>}</p><p className="text-sm text-stone-500">{p.email}</p></div>
                {p.id !== user.id && (
                  <form action={deleteUser}><input type="hidden" name="user_id" value={p.id} /><button className="btn-danger">Eliminar</button></form>
                )}
              </div>
              <ul className="flex flex-wrap gap-2">
                {mine.map((m) => (
                  <li key={m.event_id}>
                    <form action={removeMembership} className="flex items-center gap-1 rounded-full bg-stone-100 py-1 pl-3 pr-1 text-sm">
                      <input type="hidden" name="user_id" value={p.id} /><input type="hidden" name="event_id" value={m.event_id} />
                      {events?.find((e) => e.id === m.event_id)?.name} <span className="text-xs text-stone-500">({m.role})</span>
                      <button aria-label="Quitar acceso" className="rounded-full px-2 text-stone-500 hover:bg-stone-200">✕</button>
                    </form>
                  </li>
                ))}
              </ul>
              {free.length > 0 && p.role !== 'super_admin' && (
                <form action={addMembership} className="flex flex-wrap gap-2">
                  <input type="hidden" name="user_id" value={p.id} />
                  <select name="event_id" className="input !w-auto">{free.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select>
                  <select name="role" className="input !w-auto"><option value="editor">Editor</option><option value="admin">Administrador</option></select>
                  <button className="btn-secondary">Dar acceso</button>
                </form>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
