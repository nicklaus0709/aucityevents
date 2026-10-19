import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

/** Los usuarios se administran en el panel de Base44 (invitaciones, roles, bajas). */
export default function Users() {
  const { user } = useAuth();
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div><Link to="/admin" className="text-sm text-stone-500 hover:underline">← Volver</Link><h1 className="text-2xl">Usuarios</h1></div>
      <div className="card space-y-3 text-sm leading-relaxed text-stone-700">
        <p>Estás conectado como <strong>{user?.email}</strong> (rol: <strong>{user?.role}</strong>).</p>
        <p>Los usuarios y sus roles se gestionan desde el panel de <strong>Base44</strong>:</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Entrá a tu app en Base44 → <strong>Dashboard → Users</strong>.</li>
          <li>Invitá a la persona por email (se le envía el acceso).</li>
          <li>Para que pueda usar este panel, asignale el rol <strong>admin</strong>. Los usuarios con rol <em>user</em> solo ven el sitio público.</li>
          <li>Para quitar el acceso, cambiá el rol a <em>user</em> o eliminá al usuario.</li>
        </ol>
        <p className="rounded-lg bg-amber-50 p-3 text-amber-800">Por ahora todos los administradores pueden editar todos los eventos. La restricción “este usuario solo edita Navidad” queda como mejora futura.</p>
      </div>
    </div>
  );
}
