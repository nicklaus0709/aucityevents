import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { loadEvent } from '@/lib/data';
import ContactForm from '@/components/public/ContactForm';
import PageHero from '@/components/public/PageHero';

export const revalidate = 60;
export const metadata: Metadata = { title: 'Contacto' };

export default async function ContactPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await loadEvent(slug);
  if (!event) notFound();
  return (
    <>
      <PageHero eyebrow={event.name} title="Contacto" subtitle="¿Querés participar como artista, tener un puesto gastronómico o publicitar tu comercio? Escribinos." image={event.hero_image} />
      <section className="section grid gap-8 lg:grid-cols-3">
        <aside className="space-y-4 lg:order-2">
          <div className="card space-y-3 text-sm">
            <h2 className="text-lg">Municipalidad de Capioví</h2>
            {event.phone && <p>📞 <a className="font-semibold hover:text-brand" href={`tel:${event.phone.replace(/[^\d+]/g, '')}`}>{event.phone}</a></p>}
            {event.email && <p>✉️ <a className="font-semibold hover:text-brand" href={`mailto:${event.email}`}>{event.email}</a></p>}
            {event.location && <p>📍 {event.location}</p>}
          </div>
          {event.whatsapp && (
            <a href={`https://wa.me/${event.whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn w-full !bg-[#25D366] !shadow-green-500/30">Escribir por WhatsApp</a>
          )}
        </aside>
        <div className="lg:order-1 lg:col-span-2"><ContactForm slug={slug} /></div>
      </section>
    </>
  );
}
