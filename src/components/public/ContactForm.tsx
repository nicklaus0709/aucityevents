'use client';

import { useState } from 'react';

const TYPES = [
  { v: 'artista', l: 'Quiero participar como artista' },
  { v: 'gastronomico', l: 'Quiero un puesto gastronómico' },
  { v: 'comercio', l: 'Quiero publicitar mi comercio' },
  { v: 'consulta', l: 'Consulta general' },
  { v: 'otro', l: 'Otro' },
];

export default function ContactForm({ slug }: { slug: string }) {
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('sending');
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...data, slug }) });
      const out = await res.json();
      if (!res.ok) throw new Error(out.error);
      form.reset();
      setState('ok');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar');
      setState('error');
    }
  }

  if (state === 'ok') return <div className="card border-green-300 bg-green-50 text-green-800">¡Gracias! Recibimos tu mensaje y la Municipalidad se va a comunicar con vos.</div>;

  return (
    <form onSubmit={onSubmit} className="card space-y-4">
      <div>
        <label className="label" htmlFor="type">Motivo</label>
        <select id="type" name="type" className="input" required>{TYPES.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}</select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label" htmlFor="name">Nombre y apellido</label><input id="name" name="name" className="input" required minLength={2} maxLength={100} autoComplete="name" /></div>
        <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" className="input" required maxLength={150} autoComplete="email" /></div>
      </div>
      <div><label className="label" htmlFor="phone">Teléfono / WhatsApp (opcional)</label><input id="phone" name="phone" type="tel" className="input" maxLength={30} autoComplete="tel" /></div>
      <div><label className="label" htmlFor="message">Mensaje</label><textarea id="message" name="message" rows={5} className="input" required minLength={10} maxLength={2000} /></div>
      {/* Honeypot anti-bots: oculto para personas */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 opacity-0" />
      {state === 'error' && <p className="text-sm text-red-600" role="alert">{error}</p>}
      <button className="btn w-full sm:w-auto" disabled={state === 'sending'}>{state === 'sending' ? 'Enviando…' : 'Enviar mensaje'}</button>
    </form>
  );
}
