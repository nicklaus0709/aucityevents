import { requireSuperAdmin } from '@/lib/auth';
import Flash from '@/components/admin/Flash';
import { createEvent } from '../actions';

export default async function NewEvent({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireSuperAdmin();
  const { error } = await searchParams;
  return (
    <form action={createEvent} className="card mx-auto max-w-lg space-y-4">
      <h1 className="text-2xl">Nuevo evento</h1>
      <Flash error={error} />
      <div><label className="label" htmlFor="name">Nombre</label><input id="name" name="name" required minLength={2} maxLength={120} className="input" placeholder="Fiesta Rural" /></div>
      <div>
        <label className="label" htmlFor="slug">Dirección web</label>
        <input id="slug" name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={60} className="input" placeholder="fiesta-rural" />
        <p className="mt-1 text-xs text-stone-500">Se publicará en /e/<em>direccion</em>. Solo minúsculas, números y guiones. No se puede cambiar después (rompería los QR impresos).</p>
      </div>
      <button className="btn">Crear evento</button>
    </form>
  );
}
