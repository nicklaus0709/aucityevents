import { cache } from 'react';
import { DEMO, demo } from '@/lib/demo-data';
import { createPublicClient } from '@/lib/supabase/public';
import type { Ad, BonoType, EventRow, FoodStall, GalleryImage, ScheduleItem } from '@/lib/types';

/** Lectura pública (RLS: solo eventos publicados). Nunca rompe el render si falla. */
export async function getEventBySlug(slug: string): Promise<EventRow | null> {
  if (DEMO) return demo.events.find((e) => e.slug === slug) ?? null;
  try {
    const { data } = await createPublicClient().from('events').select('*').eq('slug', slug).eq('is_published', true).maybeSingle();
    return (data as EventRow) ?? null;
  } catch { return null; }
}

/** Versión con caché por request (layout + páginas comparten la consulta). */
export const loadEvent = cache(getEventBySlug);

export async function listPublishedEvents(): Promise<EventRow[]> {
  if (DEMO) return demo.events;
  try {
    const { data } = await createPublicClient().from('events').select('*').eq('is_published', true).order('start_date', { ascending: true });
    return (data as EventRow[]) ?? [];
  } catch { return []; }
}

export async function getEventContent(eventId: string) {
  if (DEMO) return demo.content[eventId] ?? { gallery: [], schedule: [], stalls: [], ads: [], bonos: [] };
  const db = createPublicClient();
  const [gallery, schedule, stalls, ads, bonos] = await Promise.all([
    db.from('gallery_images').select('id,image_url,caption').eq('event_id', eventId).order('sort_order').order('created_at'),
    db.from('schedule_items').select('*').eq('event_id', eventId).order('starts_at'),
    db.from('food_stalls').select('*').eq('event_id', eventId).order('number'),
    db.from('ads').select('id,business_name,image_url,link_url,description').eq('event_id', eventId).order('sort_order'),
    db.from('bono_types').select('id,name,description,amount').eq('event_id', eventId).order('amount'),
  ]);
  return {
    gallery: (gallery.data ?? []) as GalleryImage[],
    schedule: (schedule.data ?? []) as ScheduleItem[],
    stalls: (stalls.data ?? []) as FoodStall[],
    ads: (ads.data ?? []) as Ad[],
    bonos: (bonos.data ?? []) as BonoType[],
  };
}
