import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getEventContent, loadEvent } from '@/lib/data';
import { hexToRgbTriplet } from '@/lib/utils';
import SiteHeader from '@/components/public/SiteHeader';
import SiteFooter from '@/components/public/SiteFooter';
import AdRotator from '@/components/public/AdRotator';
import ChatWidget from '@/components/public/ChatWidget';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = await loadEvent(slug);
  if (!event) return {};
  return { title: event.name, description: event.tagline ?? undefined, openGraph: { title: event.name, images: event.hero_image ? [event.hero_image] : [] } };
}

export default async function EventLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await loadEvent(slug);
  if (!event) notFound();
  const { ads } = await getEventContent(event.id);

  return (
    <div style={{ ['--brand' as string]: hexToRgbTriplet(event.theme_color), ['--accent' as string]: hexToRgbTriplet(event.accent_color) }} className="flex min-h-screen flex-col">
      <SiteHeader slug={event.slug} name={event.name} showBonos={event.bonos_enabled} />
      <div className="flex-1">{children}</div>
      {ads.length > 0 && (
        <aside aria-label="Publicidad" className="border-t border-stone-200 bg-white">
          <AdRotator ads={ads} />
        </aside>
      )}
      <SiteFooter event={event} />
      {event.whatsapp && (
        <a
          href={`https://wa.me/${event.whatsapp}?text=${encodeURIComponent(`Hola! Consulta por ${event.name}`)}`}
          target="_blank" rel="noopener noreferrer" aria-label="Escribir por WhatsApp"
          className="fixed bottom-4 left-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition hover:scale-110"
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden="true"><path d="M12.04 2a9.9 9.9 0 0 0-8.4 15.1L2 22l5-1.6A9.9 9.9 0 1 0 12.04 2Zm5.8 14.1c-.25.7-1.4 1.3-1.95 1.35-.5.05-1.1.07-1.8-.12a14 14 0 0 1-5.4-3.4c-1.6-1.6-2.5-3.4-2.6-3.7-.1-.3-.7-1.9.1-2.8.3-.35.7-.45.9-.45h.6c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .6l-.4.6c-.15.2-.3.35-.15.65.15.3.7 1.2 1.5 1.9 1 .9 1.9 1.2 2.2 1.35.3.15.45.1.6-.1l.9-1.1c.2-.25.35-.2.6-.1l1.8.85c.25.1.4.2.5.35.05.15.05.75-.2 1.4Z" /></svg>
        </a>
      )}
      <ChatWidget slug={event.slug} />
    </div>
  );
}
