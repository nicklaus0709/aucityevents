import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getEventContent, loadEvent } from '@/lib/data';
import BonoForm from '@/components/public/BonoForm';

export const revalidate = 60;
export const metadata: Metadata = { title: 'Bonos de colaboración' };

export default async function BonosPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await loadEvent(slug);
  if (!event || !event.bonos_enabled) notFound();
  const { bonos } = await getEventContent(event.id);

  return (
    <section className="section max-w-3xl">
      <h1 className="text-3xl">Bonos de colaboración</h1>
      <p className="mt-2 mb-6 text-stone-600">Tu aporte ayuda a que el evento sea posible. Pagás de forma segura con Mercado Pago y recibís un código QR para presentar.</p>
      {bonos.length === 0 ? <p className="text-stone-500">Por el momento no hay bonos disponibles.</p> : <BonoForm slug={slug} bonos={bonos} />}
    </section>
  );
}
