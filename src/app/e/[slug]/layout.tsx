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
    <div style={{ ['--brand' as string]: hexToRgbTriplet(event.theme_color) }} className="flex min-h-screen flex-col">
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
          className="fixed bottom-4 left-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-2xl shadow-lg hover:bg-green-600"
        >💬</a>
      )}
      <ChatWidget slug={event.slug} />
    </div>
  );
}
