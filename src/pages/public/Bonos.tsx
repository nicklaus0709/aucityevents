import { Navigate } from 'react-router-dom';
import PageHero from '@/components/public/PageHero';
import { formatMoney } from '@/lib/utils';
import { useEventCtx } from './EventLayout';

/** La compra online con Mercado Pago se habilita en una etapa posterior; por ahora se muestran los bonos disponibles. */
export default function Bonos() {
  const { event, content } = useEventCtx();
  if (!event.bonos_enabled) return <Navigate to={`/e/${event.slug}`} replace />;
  return (
    <>
      <PageHero eyebrow={event.name} title="Bonos de colaboración" subtitle="Tu aporte ayuda a que el evento sea posible." image={event.hero_image} />
      <section className="section max-w-3xl">
        {content.bonos.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2">
            {content.bonos.map((b) => (
              <li key={b.id} className="card">
                <h2 className="text-lg">{b.name}</h2>
                {b.description && <p className="text-sm text-stone-600">{b.description}</p>}
                <p className="mt-2 text-2xl font-extrabold text-brand">{formatMoney(Number(b.amount))}</p>
              </li>
            ))}
          </ul>
        )}
        <div className="card mt-6 text-center">
          <h2 className="text-xl">Compra online: muy pronto</h2>
          <p className="mt-2 text-stone-600">Estamos habilitando el pago con Mercado Pago. Mientras tanto, podés adquirir tu bono en la Municipalidad{event.phone ? ` (${event.phone})` : ''}.</p>
        </div>
      </section>
    </>
  );
}
