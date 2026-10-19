import { base44, DEMO } from '@/lib/base44';
import { demo } from '@/lib/demo-data';
import type { EntityName, EventContent, EventRow } from '@/lib/types';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

/** Acceso tipado a una entidad de Base44. Si el nombre de una entidad cambia, se corrige acá. */
const entity = (name: EntityName) => (base44.entities as any)[name] as {
  list: (sort?: string, limit?: number, skip?: number) => Promise<Row[]>;
  filter: (query: Row, sort?: string, limit?: number, skip?: number) => Promise<Row[]>;
  get: (id: string) => Promise<Row>;
  create: (data: Row) => Promise<Row>;
  update: (id: string, data: Row) => Promise<Row>;
  delete: (id: string) => Promise<unknown>;
  bulkCreate: (data: Row[]) => Promise<Row[]>;
};

const today = () => new Date().toISOString().slice(0, 10);
const nullify = <T extends Row>(r: T): T => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v === undefined ? null : v])) as T;

/* ---------------- Lectura pública ---------------- */

export async function getEventBySlug(slug: string): Promise<EventRow | null> {
  if (DEMO) return demo.events.find((e) => e.slug === slug) ?? null;
  const rows = await entity('Event').filter({ slug, is_published: true }, '-created_date', 1);
  return rows[0] ? (nullify(rows[0]) as EventRow) : null;
}

export async function listPublishedEvents(): Promise<EventRow[]> {
  if (DEMO) return demo.events;
  const rows = await entity('Event').filter({ is_published: true }, 'start_date');
  return rows.map((r) => nullify(r) as EventRow);
}

export async function getEventContent(eventId: string): Promise<EventContent> {
  if (DEMO) return demo.content[eventId] ?? { gallery: [], schedule: [], stalls: [], ads: [], bonos: [] };
  const q = { event_id: eventId };
  const [gallery, schedule, stalls, ads, bonos] = await Promise.all([
    entity('GalleryImage').filter(q, 'sort_order'),
    entity('ScheduleItem').filter(q, 'starts_at'),
    entity('FoodStall').filter(q, 'number'),
    entity('Ad').filter(q, 'sort_order'),
    entity('BonoType').filter({ ...q, is_active: true }, 'amount'),
  ]);
  const t = today();
  return {
    gallery: gallery.map(nullify) as any,
    schedule: schedule.map(nullify) as any,
    stalls: stalls.map((s) => ({ ...nullify(s), products: s.products ?? [] })) as any,
    // La vigencia de la publicidad se aplica acá (activa y dentro de fechas)
    ads: ads.filter((a) => a.is_active !== false && (!a.starts_on || a.starts_on <= t) && (!a.ends_on || a.ends_on >= t)).map(nullify) as any,
    bonos: bonos.map(nullify) as any,
  };
}

export async function sendContactMessage(msg: { event_id: string; name: string; email: string; phone?: string; type: string; message: string }) {
  if (DEMO) throw new Error('Modo demo: el formulario está deshabilitado');
  await entity('ContactMessage').create({ ...msg, status: 'nuevo' });
}

/* ---------------- Panel de administración (requiere rol admin) ---------------- */

export const admin = {
  list: (name: EntityName, query: Row = {}, sort = '-created_date', limit = 500) => entity(name).filter(query, sort, limit),
  get: (name: EntityName, id: string) => entity(name).get(id),
  create: (name: EntityName, data: Row) => entity(name).create(data),
  update: (name: EntityName, id: string, data: Row) => entity(name).update(id, data),
  remove: (name: EntityName, id: string) => entity(name).delete(id),
  async uploadImage(file: File): Promise<string> {
    const { file_url } = await (base44.integrations as any).Core.UploadFile({ file });
    return file_url as string;
  },
  /** Carga los eventos de ejemplo (los mismos del modo demo) en la base de Base44. */
  async seedDemo() {
    for (const ev of demo.events) {
      const { id, ...evData } = ev;
      const created = await entity('Event').create({ ...evData, bonos_enabled: false });
      const c = demo.content[id];
      const withEvent = (rows: Row[]) => rows.map(({ id: _id, ...r }) => ({ ...r, event_id: created.id }));
      if (c.schedule.length) await entity('ScheduleItem').bulkCreate(withEvent(c.schedule));
      if (c.stalls.length) await entity('FoodStall').bulkCreate(withEvent(c.stalls));
      if (c.ads.length) await entity('Ad').bulkCreate(withEvent(c.ads).map((a, i) => ({ ...a, sort_order: i })));
      if (c.gallery.length) await entity('GalleryImage').bulkCreate(withEvent(c.gallery).map((g, i) => ({ ...g, sort_order: i })));
      if (c.bonos.length) await entity('BonoType').bulkCreate(withEvent(c.bonos));
    }
  },
};
