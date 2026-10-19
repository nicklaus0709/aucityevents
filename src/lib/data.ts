import { cache } from 'react';
import { DEMO, demo } from '@/lib/demo-data';
import { prisma } from '@/lib/db';
import type { Ad, BonoType, EventRow, FoodStall, GalleryImage, ScheduleItem } from '@/lib/types';

type EventRecord = {
  id: string; slug: string; name: string; tagline: string | null; description: string | null; history: string | null;
  location: string | null; start_date: Date | null; end_date: Date | null; hero_image: string | null;
  theme_color: string; accent_color: string; logo_url: string | null; phone: string | null; email: string | null;
  youtube_url: string | null; instagram_url: string | null; facebook_url: string | null; whatsapp: string | null;
  bonos_enabled: boolean; is_published: boolean;
};

/** Las columnas de fecha son Date en Prisma; las interfaces públicas usan strings. */
export function toEventRow(e: EventRecord): EventRow {
  return {
    ...e,
    start_date: e.start_date ? e.start_date.toISOString().slice(0, 10) : null,
    end_date: e.end_date ? e.end_date.toISOString().slice(0, 10) : null,
  };
}

/** Lectura pública (solo eventos publicados). Nunca rompe el render si falla. */
export async function getEventBySlug(slug: string): Promise<EventRow | null> {
  if (DEMO) return demo.events.find((e) => e.slug === slug) ?? null;
  try {
    const e = await prisma.events.findFirst({ where: { slug, is_published: true } });
    return e ? toEventRow(e) : null;
  } catch { return null; }
}

/** Versión con caché por request (layout + páginas comparten la consulta). */
export const loadEvent = cache(getEventBySlug);

export async function listPublishedEvents(): Promise<EventRow[]> {
  if (DEMO) return demo.events;
  try {
    const events = await prisma.events.findMany({ where: { is_published: true }, orderBy: { start_date: 'asc' } });
    return events.map(toEventRow);
  } catch { return []; }
}

export async function getEventContent(eventId: string) {
  if (DEMO) return demo.content[eventId] ?? { gallery: [], schedule: [], stalls: [], ads: [], bonos: [] };
  const [gallery, schedule, stalls, ads, bonos] = await Promise.all([
    prisma.gallery_images.findMany({
      where: { event_id: eventId }, orderBy: [{ sort_order: 'asc' }, { created_at: 'asc' }],
      select: { id: true, image_url: true, caption: true },
    }),
    prisma.schedule_items.findMany({ where: { event_id: eventId }, orderBy: { starts_at: 'asc' } }),
    prisma.food_stalls.findMany({ where: { event_id: eventId }, orderBy: { number: 'asc' } }),
    prisma.ads.findMany({
      where: { event_id: eventId }, orderBy: { sort_order: 'asc' },
      select: { id: true, business_name: true, image_url: true, link_url: true, description: true },
    }),
    prisma.bono_types.findMany({ where: { event_id: eventId }, orderBy: { amount: 'asc' } }),
  ]);
  return {
    gallery: gallery as GalleryImage[],
    schedule: schedule.map((s) => ({
      ...s, starts_at: s.starts_at.toISOString(), ends_at: s.ends_at ? s.ends_at.toISOString() : null,
    })) as ScheduleItem[],
    stalls: stalls as FoodStall[],
    ads: ads as Ad[],
    bonos: bonos.map((b) => ({ ...b, amount: Number(b.amount) })) as BonoType[],
  };
}
