'use client';

import { useState } from 'react';
import type { BonoType } from '@/lib/types';
import { formatMoney } from '@/lib/utils';

export default function BonoForm({ slug, bonos }: { slug: string; bonos: BonoType[] }) {
  const [bonoId, setBonoId] = useState(bonos[0]?.id ?? '');
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const bono = bonos.find((b) => b.id === bonoId);
  const total = bono ? Number(bono.amount) * qty : 0;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch('/api/bonos/checkout', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...data, slug, bonoTypeId: bonoId, quantity: qty }) });
      const out = await res.json();
      if (!res.ok) throw new Error(out.error);
      window.location.href = out.url; // redirige al checkout de Mercado Pago
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar el pago');
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4">
      <fieldset className="grid gap-3 sm:grid-cols-2">
        <legend className="label">Elegí tu bono</legend>
        {bonos.map((b) => (
          <label key={b.id} className={`cursor-pointer rounded-xl border-2 p-4 ${bonoId === b.id ? 'border-brand bg-brand/5' : 'border-stone-200'}`}>
            <input type="radio" name="bono" className="sr-only" checked={bonoId === b.id} onChange={() => setBonoId(b.id)} />
            <span className="block font-bold">{b.name}</span>
            {b.description && <span className="block text-sm text-stone-600">{b.description}</span>}
            <span className="mt-1 block text-lg font-extrabold text-brand">{formatMoney(Number(b.amount))}</span>
          </label>
        ))}
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-3">
        <div><label className="label" htmlFor="qty">Cantidad</label><input id="qty" type="number" min={1} max={20} value={qty} onChange={(e) => setQty(Math.max(1, Math.min(20, Number(e.target.value) || 1)))} className="input" /></div>
        <div className="sm:col-span-2"><label className="label" htmlFor="name">Nombre y apellido</label><input id="name" name="name" className="input" required minLength={2} maxLength={100} autoComplete="name" /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label" htmlFor="email">Email (te enviamos el comprobante)</label><input id="email" name="email" type="email" className="input" required maxLength={150} autoComplete="email" /></div>
        <div><label className="label" htmlFor="phone">Teléfono (opcional)</label><input id="phone" name="phone" type="tel" className="input" maxLength={30} autoComplete="tel" /></div>
      </div>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 opacity-0" />
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 pt-4">
        <p className="text-lg">Total: <strong>{formatMoney(total)}</strong></p>
        <button className="btn" disabled={busy || !bono}>{busy ? 'Redirigiendo…' : 'Pagar con Mercado Pago'}</button>
      </div>
    </form>
  );
}
