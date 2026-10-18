import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getEventContent, loadEvent } from '@/lib/data';
import { formatDate, formatDateTime } from '@/lib/utils';

export const revalidate = 60;

export default async function EventHome({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await loadEvent(slug);
  if (!event) notFound();
  const { gallery, schedule } = await getEventContent(event.id);
  const upcoming = schedule.filter((s) => new Date(s.starts_at) >= new Date()).slice(0, 4);

  return (
    <>
      <section
        className="relative flex min-h-[60vh] items-center justify-center bg-brand bg-cover bg-center px-4 text-center text-white"
        style={event.hero_image ? { backgroundImage: `linear-gradient(rgb(0 0 0 / .55), rgb(0 0 0 / .55)), url(${JSON.stringify(event.hero_image)})` } : undefined}
      >
        <div className="max-w-2xl py-16">
          <h1 className="text-4xl font-extrabold !text-white sm:text-6xl">{event.name}</h1>
          {event.tagline && <p className="mt-4 text-lg sm:text-xl">{event.tagline}</p>}
          <p className="mt-3 text-sm opacity-90">
            {event.start_date && formatDate(event.start_date)}
            {event.end_date && event.end_date !== event.start_date && ` al ${formatDate(event.end_date)}`}
            {event.location && ` · ${event.location}`}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href={`/e/${slug}/eventos`} className="btn !bg-white !text-stone-900">Ver grilla</Link>
            <Link href={`/e/${slug}/gastronomia`} className="btn-secondary !bg-transparent !text-white !border-white/70 hover:!bg-white/10">Gastronomía</Link>
            {event.bonos_enabled && <Link href={`/e/${slug}/bonos`} className="btn-secondary !bg-transparent !text-white !border-white/70 hover:!bg-white/10">Comprar bono</Link>}
          </div>
        </div>
      </section>

      {upcoming.length > 0 && (
        <section className="section">
          <h2 className="text-2xl">Próximos shows</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {upcoming.map((s) => (
              <li key={s.id} className="card">
                <p className="text-xs font-semibold uppercase text-brand">{formatDateTime(s.starts_at)}</p>
                <p className="mt-1 text-lg font-bold">{s.artist}</p>
                {s.stage && <p className="text-sm text-stone-500">{s.stage}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {event.description && (
        <section id="nosotros" className="section">
          <h2 className="text-2xl">Nosotros</h2>
          <p className="mt-4 max-w-3xl whitespace-pre-line leading-relaxed text-stone-700">{event.description}</p>
        </section>
      )}

      {event.history && (
        <section id="historia" className="bg-white">
          <div className="section">
            <h2 className="text-2xl">Historia del evento</h2>
            <p className="mt-4 max-w-3xl whitespace-pre-line leading-relaxed text-stone-700">{event.history}</p>
          </div>
        </section>
      )}

      {gallery.length > 0 && (
        <section id="galeria" className="section">
          <h2 className="text-2xl">Galería</h2>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {gallery.map((g) => (
              <li key={g.id}>
                <a href={g.image_url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl">
                  <img src={g.image_url} alt={g.caption ?? `Foto de ${event.name}`} loading="lazy" className="aspect-square w-full object-cover transition hover:scale-105" />
                </a>
                {g.caption && <p className="mt-1 text-xs text-stone-500">{g.caption}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
