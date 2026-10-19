import PageHero from '@/components/public/PageHero';
import { useEventCtx } from './EventLayout';

/** "Choripán $3500" -> { name: "Choripán", price: "$3500" } */
function splitPrice(line: string) {
  const m = /^(.*?)\s+(\$\s?[\d.,]+)$/.exec(line);
  return m ? { name: m[1], price: m[2] } : { name: line, price: null };
}

export default function Food() {
  const { event, content } = useEventCtx();
  return (
    <>
      <PageHero eyebrow={event.name} title="Patio gastronómico" subtitle="Encontrá tu puesto por número y mirá qué sirve cada uno." image={event.hero_image} />
      <section className="section">
        {content.stalls.length === 0 && <p className="text-stone-500">Pronto vas a ver acá los puestos gastronómicos.</p>}
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {content.stalls.map((s) => (
            <li key={s.id} className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200 transition hover:-translate-y-1 hover:shadow-xl">
              {s.image_url && <img src={s.image_url} alt="" loading="lazy" className="h-40 w-full object-cover" />}
              <div className="flex items-center gap-4 border-b border-stone-100 p-5">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand text-2xl font-extrabold text-white shadow-md shadow-brand/30" aria-label={`Puesto ${s.number}`}>{s.number}</span>
                <div className="min-w-0">
                  <h2 className="text-lg leading-tight">{s.name}</h2>
                  {s.owner && <p className="text-sm text-stone-500">{s.owner}</p>}
                </div>
              </div>
              {s.products.length > 0 && (
                <ul className="flex-1 divide-y divide-dashed divide-stone-200 px-5 py-2 text-sm">
                  {s.products.map((p, i) => {
                    const { name, price } = splitPrice(p);
                    return (
                      <li key={i} className="flex items-baseline justify-between gap-3 py-2">
                        <span>{name}</span>{price && <span className="shrink-0 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-bold text-accent">{price}</span>}
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
