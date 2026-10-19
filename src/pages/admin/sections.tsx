import { useState } from 'react';
import { TABLES } from '@/lib/admin-config';
import { admin } from '@/lib/api';
import { formatDateTime, formatMoney, siteUrl } from '@/lib/utils';
import { useAsync } from '@/hooks/useAsync';
import type { EntityName } from '@/lib/types';
import CrudManager from '@/components/admin/CrudManager';
import EntityForm from '@/components/admin/EntityForm';
import Flash from '@/components/admin/Flash';
import PrintButton from '@/components/admin/PrintButton';
import Spinner from '@/components/Spinner';
import QRCode from 'qrcode';
import { useAdminEvent } from './EventAdmin';

/* ------------------------------ Resumen ------------------------------ */
export function Dashboard() {
  const { event } = useAdminEvent();
  const { data, loading } = useAsync(async () => {
    const q = { event_id: event.id };
    const [shows, stalls, ads, photos, msgs, sales] = await Promise.all([
      admin.list('ScheduleItem', q), admin.list('FoodStall', q), admin.list('Ad', q), admin.list('GalleryImage', q),
      admin.list('ContactMessage', q), admin.list('BonoPurchase', { ...q, status: 'approved' }),
    ]);
    return {
      shows: shows.length, stalls: stalls.length, ads: ads.length, photos: photos.length,
      newMsgs: msgs.filter((m) => m.status === 'nuevo').length, sold: sales.length,
      revenue: sales.reduce((a, s) => a + Number(s.amount), 0), redeemed: sales.filter((s) => s.redeemed_at).length,
    };
  }, [event.id]);

  if (loading || !data) return <Spinner />;
  const stats = [
    ['Shows en grilla', data.shows], ['Puestos gastronómicos', data.stalls], ['Publicidades', data.ads], ['Fotos', data.photos],
    ['Mensajes nuevos', data.newMsgs], ['Bonos vendidos', data.sold], ['Recaudado', formatMoney(data.revenue)], ['Bonos canjeados', data.redeemed],
  ];
  return (
    <div className="space-y-4">
      {!event.is_published && <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">Este sitio está en <strong>borrador</strong>: el público no lo ve. Activá “Sitio publicado” en la pestaña Contenido.</p>}
      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(([label, value]) => <div key={String(label)} className="card"><dt className="text-sm text-stone-500">{label}</dt><dd className="mt-1 text-2xl font-extrabold">{value}</dd></div>)}
      </dl>
    </div>
  );
}

/* ------------------------------ Contenido del evento ------------------------------ */
export function Config() {
  const { event, reload } = useAdminEvent();
  const [flash, setFlash] = useState<{ ok?: string; error?: string }>({});
  const cfg = TABLES.Event;

  async function save(payload: Record<string, unknown>) {
    if (payload.start_date && payload.end_date && String(payload.end_date) < String(payload.start_date)) throw new Error('La fecha de fin es anterior al inicio');
    await admin.update('Event', event.id, payload);
    setFlash({ ok: 'Guardado' });
    reload();
  }
  return (
    <div className="card space-y-4">
      <Flash error={flash.error} ok={flash.ok} />
      <EntityForm fields={cfg.fields} initial={event as unknown as Record<string, unknown>} idPrefix="ev" submitLabel="Guardar cambios" onSubmit={save} />
    </div>
  );
}

/* ------------------------------ ABM por entidad ------------------------------ */
const crud = (entity: Exclude<EntityName, 'Event'>, title: string) =>
  function Section() {
    const { event } = useAdminEvent();
    return <div className="space-y-4"><h2 className="text-xl">{title}</h2><CrudManager entity={entity} eventId={event.id} /></div>;
  };
export const Gallery = crud('GalleryImage', 'Galería de fotos');
export const Schedule = crud('ScheduleItem', 'Grilla de eventos');
export const Food = crud('FoodStall', 'Puestos gastronómicos');
export const Ads = crud('Ad', 'Publicidad de comercios');

/* ------------------------------ Mensajes de contacto ------------------------------ */
const TYPE_LABEL: Record<string, string> = { artista: 'Artista', gastronomico: 'Puesto gastronómico', comercio: 'Comercio / publicidad', consulta: 'Consulta', otro: 'Otro' };

export function Messages() {
  const { event } = useAdminEvent();
  const [reload, setReload] = useState(0);
  const { data: msgs, loading } = useAsync(() => admin.list('ContactMessage', { event_id: event.id }, '-created_date', 200), [event.id, reload]);

  async function setStatus(id: string, status: string) { await admin.update('ContactMessage', id, { status }); setReload((n) => n + 1); }
  async function remove(id: string) {
    if (!window.confirm('¿Eliminar este mensaje?')) return;
    await admin.remove('ContactMessage', id);
    setReload((n) => n + 1);
  }

  if (loading && !msgs) return <Spinner />;
  return (
    <div className="space-y-4">
      <h2 className="text-xl">Mensajes de contacto</h2>
      {msgs?.length === 0 && <p className="text-stone-500">No hay mensajes.</p>}
      {msgs?.map((m) => {
        const digits = String(m.phone ?? '').replace(/\D/g, '');
        return (
          <article key={m.id} className="card space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">{m.name} <span className="ml-2 rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium">{TYPE_LABEL[m.type] ?? m.type}</span></p>
              <time className="text-xs text-stone-500">{formatDateTime(m.created_date)}</time>
            </div>
            {/* Texto plano: React escapa el contenido enviado por el público */}
            <p className="whitespace-pre-line text-sm">{m.message}</p>
            <p className="text-sm text-stone-600">
              <a className="text-brand underline" href={`mailto:${encodeURIComponent(m.email)}`}>{m.email}</a>
              {digits.length >= 8 && <> · <a className="text-brand underline" href={`https://wa.me/${digits}`} target="_blank" rel="noopener noreferrer">{m.phone}</a></>}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <select value={m.status} onChange={(e) => void setStatus(m.id, e.target.value)} className="input !w-auto" aria-label="Estado">
                <option value="nuevo">Nuevo</option><option value="en_proceso">En proceso</option><option value="resuelto">Resuelto</option>
              </select>
              <button className="btn-danger" onClick={() => void remove(m.id)}>Eliminar</button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

/* ------------------------------ Bonos ------------------------------ */
const STATUS: Record<string, string> = { pending: 'Pendiente', approved: 'Aprobado', rejected: 'Rechazado', cancelled: 'Cancelado', refunded: 'Reembolsado' };

/** CSV seguro: evita la inyección de fórmulas al abrirlo en Excel/Sheets. */
function csvCell(v: unknown) {
  let s = String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export function Bonos() {
  const { event } = useAdminEvent();
  const [reload, setReload] = useState(0);
  const [flash, setFlash] = useState<{ ok?: string; error?: string }>({});
  const { data: purchases, loading } = useAsync(() => admin.list('BonoPurchase', { event_id: event.id }, '-created_date', 500), [event.id, reload]);
  const { data: types } = useAsync(() => admin.list('BonoType', { event_id: event.id }), [event.id]);

  async function redeem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const code = String(new FormData(e.currentTarget).get('code') ?? '').trim().toUpperCase();
    if (!/^[A-Z0-9]{5}-[A-Z0-9]{5}$/.test(code)) return setFlash({ error: 'Código con formato inválido' });
    const [found] = await admin.list('BonoPurchase', { event_id: event.id, code }, '-created_date', 1);
    if (!found) return setFlash({ error: 'Código inexistente' });
    if (found.status !== 'approved') return setFlash({ error: `La compra no está aprobada (estado: ${STATUS[found.status] ?? found.status})` });
    if (found.redeemed_at) return setFlash({ error: `Este bono ya fue canjeado el ${formatDateTime(found.redeemed_at)}` });
    await admin.update('BonoPurchase', found.id, { redeemed_at: new Date().toISOString() });
    setFlash({ ok: `✔ Bono válido de ${found.buyer_name} (${found.quantity} unidad/es) canjeado` });
    setReload((n) => n + 1);
  }

  function exportCsv() {
    const head = ['Fecha', 'Código', 'Comprador', 'Email', 'Teléfono', 'Cantidad', 'Monto', 'Estado', 'Canjeado'];
    const rows = (purchases ?? []).map((p) => [p.created_date, p.code, p.buyer_name, p.buyer_email, p.buyer_phone, p.quantity, p.amount, p.status, p.redeemed_at].map(csvCell).join(','));
    const blob = new Blob(['﻿' + [head.map(csvCell).join(','), ...rows].join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `bonos-${event.slug}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const approved = (purchases ?? []).filter((p) => p.status === 'approved');
  const typeName = (id: string) => types?.find((t) => t.id === id)?.name ?? '—';

  return (
    <div className="space-y-8">
      {!event.bonos_enabled && <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">La sección de bonos está oculta en el sitio. Activala en la pestaña Contenido.</p>}

      <section className="space-y-3">
        <h2 className="text-xl">Validar / canjear bono</h2>
        <Flash error={flash.error} ok={flash.ok} />
        <form onSubmit={(e) => void redeem(e)} className="card flex flex-wrap items-end gap-3">
          <div className="min-w-0 flex-1"><label className="label" htmlFor="code">Código del bono</label><input id="code" name="code" required placeholder="ABCDE-FGHJK" maxLength={11} className="input font-mono uppercase" autoComplete="off" /></div>
          <button className="btn">Canjear</button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl">Tipos de bono</h2>
        <CrudManager entity="BonoType" eventId={event.id} />
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl">Compras</h2>
          <button className="btn-secondary" onClick={exportCsv}>⬇ Exportar CSV</button>
        </div>
        <p className="text-sm text-stone-600">Aprobadas: <strong>{approved.length}</strong> · Recaudado: <strong>{formatMoney(approved.reduce((a, p) => a + Number(p.amount), 0))}</strong> · Canjeadas: <strong>{approved.filter((p) => p.redeemed_at).length}</strong></p>
        {loading && !purchases ? <Spinner /> : (
          <div className="card overflow-x-auto !p-0">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-stone-50 text-xs uppercase text-stone-500"><tr><th className="p-3">Fecha</th><th>Comprador</th><th>Bono</th><th>Cant.</th><th>Monto</th><th>Código</th><th>Estado</th><th>Canje</th></tr></thead>
              <tbody>
                {purchases?.map((p) => (
                  <tr key={p.id} className="border-t border-stone-100">
                    <td className="whitespace-nowrap p-3">{formatDateTime(p.created_date)}</td>
                    <td>{p.buyer_name}<br /><span className="text-xs text-stone-500">{p.buyer_email}</span></td>
                    <td>{typeName(p.bono_type_id)}</td><td>{p.quantity}</td><td>{formatMoney(Number(p.amount))}</td>
                    <td className="font-mono">{p.code}</td><td>{STATUS[p.status] ?? p.status}</td>
                    <td>{p.redeemed_at ? '✔ ' + formatDateTime(p.redeemed_at) : '—'}</td>
                  </tr>
                ))}
                {purchases?.length === 0 && <tr><td colSpan={8} className="p-4 text-stone-500">Todavía no hay compras.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

/* ------------------------------ QR imprimibles ------------------------------ */
export function Qr() {
  const { event } = useAdminEvent();
  const base = siteUrl();
  const items = [
    { title: 'Programación', hint: 'Escaneá para ver artistas y horarios', url: `${base}/e/${event.slug}/eventos` },
    { title: 'Gastronomía', hint: 'Escaneá para ver los puestos y productos', url: `${base}/e/${event.slug}/gastronomia` },
    { title: 'Sitio del evento', hint: 'Toda la información en un solo lugar', url: `${base}/e/${event.slug}` },
    ...(event.bonos_enabled ? [{ title: 'Bonos de colaboración', hint: 'Escaneá y mirá cómo colaborar', url: `${base}/e/${event.slug}/bonos` }] : []),
  ];
  const { data: qrs, loading } = useAsync(
    () => Promise.all(items.map((i) => QRCode.toDataURL(i.url, { width: 700, margin: 2, errorCorrectionLevel: 'H' }))),
    [event.slug, event.bonos_enabled, base],
  );

  return (
    <div className="space-y-4">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-xl">Códigos QR para imprimir</h2><p className="text-sm text-stone-600">Cada QR abre la sección del sitio. Imprimilos y pegalos en la comunidad (una hoja A4 por QR).</p></div>
        <PrintButton />
      </div>
      {/localhost|127\.0\.0\.1/.test(base) && <p className="no-print rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">⚠ Estás en un entorno local: los QR apuntan a {base}. Generá e imprimí los QR desde el sitio publicado.</p>}
      {loading || !qrs ? <Spinner /> : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((it, i) => (
            <figure key={it.url} className="print-page card flex flex-col items-center text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-brand">{event.name}</p>
              <h3 className="mt-1 text-3xl">{it.title}</h3>
              <img src={qrs[i]} alt={`QR de ${it.title}`} className="my-4 w-full max-w-sm" />
              <figcaption className="text-lg font-medium">{it.hint}</figcaption>
              <p className="mt-1 break-all text-xs text-stone-500">{it.url}</p>
              <a href={qrs[i]} download={`qr-${event.slug}-${i + 1}.png`} className="btn-secondary no-print mt-3">Descargar PNG</a>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
