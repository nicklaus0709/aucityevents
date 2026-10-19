import { Outlet, useOutletContext, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { getEventBySlug, getEventContent } from '@/lib/api';
import { hexToRgbTriplet } from '@/lib/utils';
import type { EventContent, EventRow } from '@/lib/types';
import { useAsync } from '@/hooks/useAsync';
import SiteHeader from '@/components/public/SiteHeader';
import SiteFooter from '@/components/public/SiteFooter';
import AdRotator from '@/components/public/AdRotator';
import ChatWidget from '@/components/public/ChatWidget';
import Spinner from '@/components/Spinner';
import NotFound from '@/pages/NotFound';

export interface EventCtx { event: EventRow; content: EventContent }
export const useEventCtx = () => useOutletContext<EventCtx>();

export default function EventLayout() {
  const { slug = '' } = useParams();
  const { data, error, loading } = useAsync(async () => {
    const event = await getEventBySlug(slug);
    return event ? { event, content: await getEventContent(event.id) } : null;
  }, [slug]);

  useEffect(() => {
    if (data) document.title = data.event.name;
    window.scrollTo(0, 0);
  }, [data, slug]);

  if (loading) return <Spinner />;
  if (error) return <div className="section text-center"><h1 className="text-2xl">No pudimos cargar el evento</h1><p className="mt-2 text-stone-600">Probá de nuevo en unos minutos.</p></div>;
  if (!data) return <NotFound />;
  const { event, content } = data;

  return (
    <div style={{ ['--brand' as string]: hexToRgbTriplet(event.theme_color), ['--accent' as string]: hexToRgbTriplet(event.accent_color) }} className="flex min-h-screen flex-col">
      <SiteHeader slug={event.slug} name={event.name} showBonos={event.bonos_enabled} />
      <div className="flex-1"><Outlet context={{ event, content } satisfies EventCtx} /></div>
      {content.ads.length > 0 && (
        <aside aria-label="Publicidad" className="border-t border-stone-200 bg-white"><AdRotator ads={content.ads} /></aside>
      )}
      <SiteFooter event={event} />
      <ChatWidget event={event} content={content} />
    </div>
  );
}
