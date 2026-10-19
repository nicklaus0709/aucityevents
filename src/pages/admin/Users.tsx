import { useState } from 'react';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { base44 } from '@/lib/base44';
import Flash from '@/components/admin/Flash';

const schema = z.object({ email: z.string().trim().toLowerCase().email().max(150), role: z.enum(['admin', 'user']) });

/** Invitación de usuarios (usa el sistema de usuarios de Base44). Los cambios de rol o bajas se hacen en el panel de Base44. */
export default function Users() {
  const { user } = useAuth();
  const [flash, setFlash] = useState<{ ok?: string; error?: string }>({});
  const [busy, setBusy] = useState(false);

  async function invite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const parsed = schema.safeParse(Object.fromEntries(new FormData(form)));
    if (!parsed.success) return setFlash({ error: 'Revisá el email ingresado' });
    setBusy(true);
    setFlash({});
    try {
      await base44.auth.inviteUser(parsed.data.email, parsed.data.role);
      setFlash({ ok: `Invitación enviada a ${parsed.data.email}` });
      form.reset();
    } catch {
      setFlash({ error: 'No se pudo enviar la invitación (¿ya existe el usuario?)' });
    }
    setBusy(false);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div><Link to="/admin" className="text-sm text-stone-500 hover:underline">← Volver</Link><h1 className="text-2xl">Usuarios</h1></div>

      <form onSubmit={(e) => void invite(e)} className="card space-y-4">
        <h2 className="text-lg">Invitar a una persona</h2>
        <Flash error={flash.error} ok={flash.ok} />
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2"><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required maxLength={150} className="input" /></div>
          <div><label className="label" htmlFor="role">Rol</label><select id="role" name="role" className="input"><option value="admin">Administrador</option><option value="user">Usuario (solo lectura)</option></select></div>
        </div>
        <button className="btn" disabled={busy}>{busy ? 'Enviando…' : 'Enviar invitación'}</button>
      </form>

      <div className="card space-y-3 text-sm leading-relaxed text-stone-700">
        <p>Estás conectado como <strong>{user?.email}</strong> (rol: <strong>{user?.role}</strong>).</p>
        <p>Para cambiar el rol de alguien o quitarle el acceso, entrá a tu app en Base44 → <strong>Dashboard → Users</strong>. Solo los usuarios con rol <strong>admin</strong> pueden usar este panel.</p>
        <p className="rounded-lg bg-amber-50 p-3 text-amber-800">Por ahora todos los administradores pueden editar todos los eventos. Que alguien edite solo Navidad queda como mejora futura.</p>
      </div>
    </div>
  );
}
