import { useRef, useState } from 'react';
import { formatDateTime } from '@/lib/utils';
import type { EventContent, EventRow } from '@/lib/types';

interface Msg { role: 'user' | 'bot'; text: string }

/** Chatbot de consultas sobre el evento. Responde con los datos publicados (grilla, puestos, bonos), sin servicios externos. */
function reply(question: string, event: EventRow, c: EventContent): string {
  const m = question.toLowerCase();
  const has = (...w: string[]) => w.some((x) => m.includes(x));

  if (has('artista', 'grilla', 'horario', 'show', 'música', 'musica', 'programa', 'cuando', 'cuándo', 'escenario', 'actividad')) {
    if (!c.schedule.length) return 'Todavía no se cargó la programación. ¡Volvé pronto!';
    return 'Esta es la programación:\n' + c.schedule.slice(0, 12).map((s) => `• ${formatDateTime(s.starts_at)} hs: ${s.artist}${s.stage ? ` (${s.stage})` : ''}`).join('\n');
  }
  if (has('comida', 'gastro', 'puesto', 'comer', 'bebida', 'menu', 'menú', 'precio', 'hambre')) {
    if (!c.stalls.length) return 'Todavía no se cargaron los puestos gastronómicos.';
    const found = c.stalls.filter((s) => s.products.some((p) => m.split(/\s+/).some((w) => w.length > 3 && p.toLowerCase().includes(w))));
    const list = (found.length ? found : c.stalls).slice(0, 8);
    return (found.length ? 'Encontré estos puestos:\n' : 'Estos son los puestos gastronómicos:\n') + list.map((s) => `• Puesto ${s.number} · ${s.name}: ${s.products.slice(0, 4).join(', ')}`).join('\n');
  }
  if (has('bono', 'colabor', 'comprar', 'pagar', 'pago')) {
    return event.bonos_enabled ? 'Podés comprar tu bono de colaboración desde la sección "Bonos".' : 'La venta de bonos online todavía no está habilitada. Consultá en la Municipalidad.';
  }
  if (has('donde', 'dónde', 'lugar', 'direccion', 'dirección', 'ubicaci')) return event.location ? `El evento es en: ${event.location}.` : 'El lugar se confirmará pronto.';
  if (has('contacto', 'whatsapp', 'telefono', 'teléfono', 'municipalidad', 'participar', 'artista', 'puesto propio')) {
    return `Escribinos desde la sección Contacto${event.phone ? ` o llamá al ${event.phone}` : ''}.`;
  }
  return 'Puedo ayudarte con la programación, los puestos de comida, los bonos y el lugar. ¿Qué querés saber?';
}

export default function ChatWidget({ event, content }: { event: EventRow; content: EventContent }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([{ role: 'bot', text: '¡Hola! Soy el asistente del evento. Preguntame por la programación, los puestos de comida o los bonos 🎄' }]);
  const end = useRef<HTMLDivElement>(null);

  function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim().slice(0, 300);
    if (!text) return;
    setMsgs((m) => [...m, { role: 'user', text }, { role: 'bot', text: reply(text, event, content) }]);
    setInput('');
    setTimeout(() => end.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }

  return (
    <>
      <button onClick={() => setOpen(!open)} aria-label="Abrir chat de ayuda" className="fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-2xl text-white shadow-xl transition hover:scale-110">
        {open ? '✕' : '🤖'}
      </button>
      {open && (
        <div className="fixed inset-x-3 bottom-20 z-40 flex h-[28rem] max-h-[70vh] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl sm:inset-x-auto sm:right-4 sm:w-96" role="dialog" aria-label="Asistente del evento">
          <div className="bg-brand px-4 py-3 text-sm font-bold text-white">Asistente del evento</div>
          <div className="flex-1 space-y-2 overflow-y-auto p-3 text-sm" aria-live="polite">
            {msgs.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex'}>
                {/* texto plano: React escapa el contenido */}
                <p className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 ${m.role === 'user' ? 'bg-brand text-white' : 'bg-stone-100'}`}>{m.text}</p>
              </div>
            ))}
            <div ref={end} />
          </div>
          <form onSubmit={send} className="flex gap-2 border-t border-stone-200 p-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} maxLength={300} placeholder="Escribí tu consulta…" className="input" aria-label="Mensaje" />
            <button className="btn">Enviar</button>
          </form>
        </div>
      )}
    </>
  );
}
