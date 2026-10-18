'use client';

import { useRef, useState } from 'react';

interface Msg { role: 'user' | 'bot'; text: string }

export default function ChatWidget({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([{ role: 'bot', text: '¡Hola! Soy el asistente del evento. Preguntame por la grilla, los puestos de comida o los bonos 🎶🍔' }]);
  const end = useRef<HTMLDivElement>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    const history = msgs.slice(-6);
    setMsgs((m) => [...m, { role: 'user', text }]);
    setInput('');
    setBusy(true);
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug, message: text, history }) });
      const data = await res.json();
      setMsgs((m) => [...m, { role: 'bot', text: data.reply ?? 'No pude responder ahora, probá más tarde.' }]);
    } catch {
      setMsgs((m) => [...m, { role: 'bot', text: 'Sin conexión, probá de nuevo.' }]);
    } finally {
      setBusy(false);
      setTimeout(() => end.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }

  return (
    <>
      <button onClick={() => setOpen(!open)} aria-label="Abrir chat de ayuda" className="fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-2xl text-white shadow-lg hover:opacity-90">
        {open ? '✕' : '🤖'}
      </button>
      {open && (
        <div className="fixed inset-x-3 bottom-20 z-40 flex h-[28rem] max-h-[70vh] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl sm:inset-x-auto sm:right-4 sm:w-96" role="dialog" aria-label="Asistente del evento">
          <div className="bg-brand px-4 py-3 text-sm font-semibold text-white">Asistente del evento</div>
          <div className="flex-1 space-y-2 overflow-y-auto p-3 text-sm" aria-live="polite">
            {msgs.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex'}>
                {/* texto plano (React escapa): nunca se renderiza HTML del bot */}
                <p className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 ${m.role === 'user' ? 'bg-brand text-white' : 'bg-stone-100'}`}>{m.text}</p>
              </div>
            ))}
            {busy && <p className="text-xs text-stone-400">Escribiendo…</p>}
            <div ref={end} />
          </div>
          <form onSubmit={send} className="flex gap-2 border-t border-stone-200 p-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} maxLength={500} placeholder="Escribí tu consulta…" className="input" aria-label="Mensaje" />
            <button className="btn" disabled={busy}>Enviar</button>
          </form>
        </div>
      )}
    </>
  );
}
