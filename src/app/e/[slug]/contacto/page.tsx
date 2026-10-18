import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { loadEvent } from '@/lib/data';
import ContactForm from '@/components/public/ContactForm';

export const revalidate = 60;
export const metadata: Metadata = { title: 'Contacto' };

export default async function ContactPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await loadEvent(slug);
  if (!event) notFound();
  return (
    <section className="section max-w-3xl">
      <h1 className="text-3xl">Contacto</h1>
      <p className="mt-2 mb-6 text-stone-600">
        ¿Querés participar como artista, tener un puesto gastronómico o publicitar tu comercio? Escribinos y la Municipalidad se comunica con vos.
      </p>
      <ContactForm slug={slug} />
    </section>
  );
}
