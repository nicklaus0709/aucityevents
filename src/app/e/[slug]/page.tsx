import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getEventContent, loadEvent } from '@/lib/data';
import { formatDate, formatTime, parseHistory, TZ } from '@/lib/utils';
import Gallery from '@/components/public/Gallery';

export const revalidate = 60;

const dayParts = (iso: string) => {
  const d = new Date(iso);
  return {
    day: new Intl.DateTimeFormat('es-AR', { timeZone: TZ, day: 'numeric' }).format(d),
    month: new Intl.DateTimeFormat('es-AR', { timeZone: TZ, month: 'short' }).format(d).replace('.', ''),
    weekday: new Intl.DateTimeFormat('es-AR', { timeZone: TZ, weekday: 'long' }).format(d),
  };
};

export default async function EventHome({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await loadEvent(slug);
  if (!event) notFound();
  const { gallery, schedule, stalls } = await getEventContent(event.id);
  const upcoming = schedule.filter((s) => new Date(s.starts_at) >= new Date()).slice(0, 3);
  const featured = upcoming.length ? upcoming : schedule.slice(0, 3);
  const history = event.history ? parseHistory(event.history) : null;
  const dates = event.start_date
    ? `${formatDate(event.start_date)}${event.end_date && event.end_date !== event.start_date ? ` — ${formatDate(event.end_date)}` : ''}`
    : null;

  return (
    <>
      {/* HERO */}
      <section className="relative isolate flex h-[78vh] min-h-[34rem] max-h-[52rem] items-end overflow-hidden bg-deep text-white">
        {event.hero_image && <img src={event.hero_image} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/35 to-black/20" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/50 to-transparent" />
        <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-24 sm:px-6 sm:pb-32">
          {event.logo_url && <div className="animate-fade-up mb-6 inline-block rounded-2xl bg-white p-2 shadow-2xl"><img src={event.logo_url} alt={event.name} className="h-20 w-auto sm:h-24" /></div>}
          <p className="animate-fade-up mb-3 text-xs font-bold uppercase tracking-[0.3em] text-white/80">Capioví · Misiones · Argentina</p>
          <h1 className="animate-fade-up max-w-3xl text-balance font-display text-5xl !text-white sm:text-7xl">{event.name}</h1>
          {event.tagline && <p className="animate-fade-up mt-5 max-w-2xl text-lg text-white/90 sm:text-xl">{event.tagline}</p>}
          <div className="animate-fade-up mt-8 flex flex-wrap gap-3">
            <Link href={`/e/${slug}/eventos`} className="btn-light">Ver programación</Link>
            <Link href={`/e/${slug}/gastronomia`} className="btn-ghost">Gastronomía</Link>
            {event.bonos_enabled && <Link href={`/e/${slug}/bonos`} className="btn !px-6 !py-3">Comprar bono</Link>}
          </div>
        </div>
      </section>

      {/* BARRA DE INFO */}
      {(dates || event.location) && (
        <div className="relative z-10 mx-auto -mt-14 max-w-5xl px-4 sm:px-6">
          <dl className="grid gap-px overflow-hidden rounded-2xl bg-stone-200 shadow-xl sm:grid-cols-3">
            {dates && <div className="bg-white p-5"><dt className="text-xs font-bold uppercase tracking-widest text-brand">Cuándo</dt><dd className="mt-1 font-bold text-stone-900">{dates}</dd></div>}
            {event.location && <div className="bg-white p-5"><dt className="text-xs font-bold uppercase tracking-widest text-brand">Dónde</dt><dd className="mt-1 font-bold text-stone-900">{event.location}</dd></div>}
            <div className="bg-white p-5"><dt className="text-xs font-bold uppercase tracking-widest text-brand">Más info</dt><dd className="mt-1 font-bold text-stone-900">{event.phone ?? <Link href={`/e/${slug}/contacto`} className="underline">Escribinos</Link>}</dd></div>
          </dl>
        </div>
      )}

      {/* PRÓXIMOS SHOWS */}
      {featured.length > 0 && (
        <section className="section">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="eyebrow">Agenda</p><h2 className="text-3xl sm:text-4xl">Próximas actividades</h2></div>
            <Link href={`/e/${slug}/eventos`} className="text-sm font-bold text-brand hover:underline">Ver toda la programación →</Link>
          </div>
          <ul className="mt-8 grid gap-5 md:grid-cols-3">
            {featured.map((s) => {
              const p = dayParts(s.starts_at);
              return (
                <li key={s.id} className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200 transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative h-40 bg-deep">
                    {s.image_url && <img src={s.image_url} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
                    <div className="absolute left-4 top-4 rounded-xl bg-white px-3 py-2 text-center leading-none shadow-lg">
                      <span className="block text-2xl font-extrabold text-brand">{p.day}</span>
                      <span className="text-xs font-bold uppercase text-stone-600">{p.month}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-stone-500"><span className="capitalize">{p.weekday}</span> · {formatTime(s.starts_at)} hs</p>
                    <h3 className="mt-1 text-lg leading-snug">{s.artist}</h3>
                    {s.stage && <p className="mt-1 text-sm text-stone-500">{s.stage}</p>}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* NOSOTROS */}
      {event.description && (
        <section id="nosotros" className="bg-white">
          <div className="section grid items-center gap-10 md:grid-cols-2">
            <div>
              <p className="eyebrow">Nosotros</p>
              <h2 className="text-3xl sm:text-4xl">Una celebración de toda la comunidad</h2>
              <div className="mt-5 space-y-4 leading-relaxed text-stone-700">{event.description.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}</div>
              <div className="mt-6 flex flex-wrap gap-3">
                {stalls.length > 0 && <Link href={`/e/${slug}/gastronomia`} className="btn">Ver gastronomía</Link>}
                <Link href={`/e/${slug}/contacto`} className="btn-secondary">Quiero participar</Link>
              </div>
            </div>
            {gallery[0] && (
              <div className="relative">
                <img src={gallery[0].image_url} alt={gallery[0].caption ?? event.name} loading="lazy" className="aspect-[4/3] w-full rounded-3xl object-cover shadow-2xl" />
                {gallery[1] && <img src={gallery[1].image_url} alt="" loading="lazy" className="absolute -bottom-6 -left-4 hidden aspect-square w-40 rounded-2xl border-4 border-white object-cover shadow-xl sm:block" />}
              </div>
            )}
          </div>
        </section>
      )}

      {/* HISTORIA */}
      {history && (
        <section id="historia" className="bg-deep bg-festive text-white">
          <div className="section">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-white/70">Historia</p>
            <h2 className="text-3xl !text-white sm:text-4xl">Cómo llegamos hasta acá</h2>
            {history.intro.map((p, i) => <p key={i} className="mt-5 max-w-3xl leading-relaxed text-white/85">{p}</p>)}
            {history.items.length > 0 && (
              <ol className="relative mt-12 space-y-8 border-l-2 border-white/25 pl-8 sm:ml-4">
                {history.items.map((it) => (
                  <li key={it.title} className="relative">
                    <span className="absolute -left-[2.6rem] top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand ring-4 ring-white/20" />
                    <h3 className="font-display text-2xl !text-white">{it.title}</h3>
                    <div className="mt-2 max-w-3xl space-y-3 leading-relaxed text-white/80">{it.body.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}</div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>
      )}

      {/* GALERÍA */}
      {gallery.length > 0 && (
        <section id="galeria" className="section">
          <p className="eyebrow">Galería</p>
          <h2 className="mb-8 text-3xl sm:text-4xl">Momentos que se quedan en el corazón</h2>
          <Gallery images={gallery} alt={`Foto de ${event.name}`} />
        </section>
      )}

      {/* CTA BONOS */}
      {event.bonos_enabled && (
        <section className="px-4 pb-16 sm:px-6">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-brand to-accent p-8 text-white shadow-2xl sm:p-14">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/80">Bonos de colaboración</p>
            <h2 className="mt-2 max-w-xl text-3xl !text-white sm:text-4xl">Sumate: tu aporte hace posible el evento</h2>
            <p className="mt-3 max-w-xl text-white/90">Pagá de forma segura con Mercado Pago y recibí tu código QR al instante.</p>
            <Link href={`/e/${slug}/bonos`} className="btn-light mt-7">Comprar mi bono</Link>
          </div>
        </section>
      )}
    </>
  );
}
