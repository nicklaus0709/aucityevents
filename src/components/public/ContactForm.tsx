import { useState } from 'react';
import { z } from 'zod';
import { sendContactMessage } from '@/lib/api';

const TYPES = [
  { v: 'artista', l: 'Quiero participar como artista' },
  { v: 'gastronomico', l: 'Quiero un puesto gastronómico' },
  { v: 'comercio', l: 'Quiero publicitar mi comercio' },
  { v: 'consulta', l: 'Consulta general' },
  { v: 'otro', l: 'Otro' },
];

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(150),
  phone: z.string().trim().max(30).optional(),
  type: z.enum(['artista', 'gastronomico', 'comercio', 'consulta', 'otro']),
  message: z.string().trim().min(10).max(2000),
  website: z.string().max(0).optional(), // honeypot: los bots lo completan
});

export default function ContactForm({ eventId }: { eventId: string }) {
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const parsed = schema.safeParse(Object.fromEntries(new FormData(form)));
    if (!parsed.success) { setError('Revisá los datos del formulario'); setState('error'); return; }
    if (parsed.data.website) { setState('ok'); return; } // bot: se descarta en silencio
    setState('sending');
    try {
      const { website: _w, ...data } = parsed.data;
      await sendContactMessage({ ...data, event_id: eventId });
      form.reset();
      setState('ok');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos enviar tu mensaje');
      setState('error');
    }
  }

  if (state === 'ok') return <div className="card border-green-300 bg-green-50 text-green-800">¡Gracias! Recibimos tu mensaje y la Municipalidad se va a comunicar con vos.</div>;

  return (
    <form onSubmit={onSubmit} className="card space-y-4 !p-6">
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
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 opacity-0" />
      {state === 'error' && <p className="text-sm text-red-600" role="alert">{error}</p>}
      <button className="btn w-full sm:w-auto" disabled={state === 'sending'}>{state === 'sending' ? 'Enviando…' : 'Enviar mensaje'}</button>
    </form>
  );
}
