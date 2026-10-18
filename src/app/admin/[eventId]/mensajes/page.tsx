import { requireEventAccess } from '@/lib/auth';
import { deleteMessage, setMessageStatus } from '../../actions';
import { formatDateTime } from '@/lib/utils';

const TYPE_LABEL: Record<string, string> = { artista: 'Artista', gastronomico: 'Puesto gastronómico', comercio: 'Comercio / publicidad', consulta: 'Consulta', otro: 'Otro' };

export default async function Messages({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const { supabase } = await requireEventAccess(eventId);
  const { data: msgs } = await supabase.from('contact_messages').select('*').eq('event_id', eventId).order('created_at', { ascending: false }).limit(200);

  return (
    <div className="space-y-4">
      <h2 className="text-xl">Mensajes de contacto</h2>
      {msgs?.length === 0 && <p className="text-stone-500">No hay mensajes.</p>}
      {msgs?.map((m) => {
        const digits = (m.phone ?? '').replace(/\D/g, '');
        return (
          <article key={m.id} className="card space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">{m.name} <span className="ml-2 rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium">{TYPE_LABEL[m.type]}</span></p>
              <time className="text-xs text-stone-500">{formatDateTime(m.created_at)}</time>
            </div>
            {/* Texto plano: React escapa el contenido enviado por el público */}
            <p className="whitespace-pre-line text-sm">{m.message}</p>
            <p className="text-sm text-stone-600">
              <a className="text-brand underline" href={`mailto:${encodeURIComponent(m.email)}`}>{m.email}</a>
              {digits.length >= 8 && <> · <a className="text-brand underline" href={`https://wa.me/${digits}`} target="_blank" rel="noopener noreferrer">{m.phone}</a></>}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <form action={setMessageStatus} className="flex gap-2">
                <input type="hidden" name="_eventId" value={eventId} /><input type="hidden" name="_id" value={m.id} />
                <select name="status" defaultValue={m.status} className="input !w-auto"><option value="nuevo">Nuevo</option><option value="en_proceso">En proceso</option><option value="resuelto">Resuelto</option></select>
                <button className="btn-secondary">Actualizar</button>
              </form>
              <form action={deleteMessage}>
                <input type="hidden" name="_eventId" value={eventId} /><input type="hidden" name="_id" value={m.id} />
                <button className="btn-danger">Eliminar</button>
              </form>
            </div>
          </article>
        );
      })}
    </div>
  );
}
