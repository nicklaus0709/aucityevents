import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { admin } from '@/lib/api';
import Flash from '@/components/admin/Flash';

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(60),
});

export default function NewEvent() {
  const nav = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = schema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) { setError('Nombre o dirección inválidos (solo minúsculas, números y guiones)'); return; }
    setBusy(true);
    setError('');
    try {
      // Base44 no tiene claves únicas: se comprueba a mano
      const dup = await admin.list('Event', { slug: parsed.data.slug }, '-created_date', 1);
      if (dup.length) { setError('Esa dirección ya existe'); setBusy(false); return; }
      const created = await admin.create('Event', { ...parsed.data, is_published: false, bonos_enabled: false, theme_color: '#b91c1c', accent_color: '#166534' });
      nav(`/admin/${created.id}/config`);
    } catch {
      setError('No se pudo crear el evento');
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card mx-auto max-w-lg space-y-4">
      <h1 className="text-2xl">Nuevo evento</h1>
      <Flash error={error} />
      <div><label className="label" htmlFor="name">Nombre</label><input id="name" name="name" required minLength={2} maxLength={120} className="input" placeholder="Fiesta Rural" /></div>
      <div>
        <label className="label" htmlFor="slug">Dirección web</label>
        <input id="slug" name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={60} className="input" placeholder="fiesta-rural" />
        <p className="mt-1 text-xs text-stone-500">Se publicará en /e/<em>direccion</em>. Solo minúsculas, números y guiones. No la cambies después (rompería los QR impresos).</p>
      </div>
      <button className="btn" disabled={busy}>{busy ? 'Creando…' : 'Crear evento'}</button>
    </form>
  );
}
