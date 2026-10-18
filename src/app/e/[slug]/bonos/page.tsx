import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getEventContent, loadEvent } from '@/lib/data';
import BonoForm from '@/components/public/BonoForm';
import PageHero from '@/components/public/PageHero';

export const revalidate = 60;
export const metadata: Metadata = { title: 'Bonos de colaboración' };

export default async function BonosPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await loadEvent(slug);
  if (!event || !event.bonos_enabled) notFound();
  const { bonos } = await getEventContent(event.id);

  return (
    <>
      <PageHero eyebrow={event.name} title="Bonos de colaboración" subtitle="Tu aporte ayuda a que el evento sea posible. Pagás con Mercado Pago y recibís un código QR." image={event.hero_image} />
      <section className="section max-w-3xl">
        {bonos.length === 0 ? <p className="text-stone-500">Por el momento no hay bonos disponibles.</p> : <BonoForm slug={slug} bonos={bonos} />}
      </section>
    </>
  );
}
