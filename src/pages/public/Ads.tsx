import { Link } from 'react-router-dom';
import PageHero from '@/components/public/PageHero';
import { useEventCtx } from './EventLayout';

function safeUrl(u: string | null) {
  try { return u && /^https?:$/.test(new URL(u).protocol) ? u : null; } catch { return null; }
}

export default function Ads() {
  const { event, content } = useEventCtx();
  return (
    <>
      <PageHero eyebrow={event.name} title="Comercios que acompañan" subtitle="Gracias a ellos este evento es posible. ¡Visitalos!" image={event.hero_image} />
      <section className="section">
        {content.ads.length === 0 && <p className="text-stone-500">Próximamente.</p>}
        <ul className="grid gap-6 sm:grid-cols-2">
          {content.ads.map((a) => {
            const href = safeUrl(a.link_url);
            const body = (
              <>
                <img src={a.image_url} alt={`Publicidad de ${a.business_name}`} loading="lazy" className="aspect-[3/1] w-full object-cover" />
                <div className="p-5"><h2 className="text-lg">{a.business_name}</h2>{a.description && <p className="text-sm text-stone-600">{a.description}</p>}</div>
              </>
            );
            return (
              <li key={a.id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200 transition hover:-translate-y-1 hover:shadow-xl">
                {href ? <a href={href} target="_blank" rel="noopener noreferrer sponsored" className="block">{body}</a> : body}
              </li>
            );
          })}
        </ul>
        <div className="mt-12 rounded-2xl bg-white p-8 text-center ring-1 ring-stone-200">
          <h2 className="text-2xl">¿Tenés un comercio?</h2>
          <p className="mt-2 text-stone-600">Sumá tu publicidad al evento y llegá a toda la comunidad.</p>
          <Link to={`/e/${event.slug}/contacto`} className="btn mt-5">Quiero publicitar</Link>
        </div>
      </section>
    </>
  );
}
