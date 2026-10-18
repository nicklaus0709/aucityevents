import Link from 'next/link';
import { listPublishedEvents } from '@/lib/data';
import PoweredBy from '@/components/public/PoweredBy';
import { formatDate, hexToRgbTriplet } from '@/lib/utils';

export const revalidate = 60;

export default async function Home() {
  const events = await listPublishedEvents();
  return (
    <main className="min-h-screen">
      <header className="relative isolate overflow-hidden bg-gradient-to-br from-stone-900 via-stone-900 to-red-950 px-4 py-24 text-center text-white sm:py-32">
        {events[0]?.hero_image && <img src={events[0].hero_image} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-30" />}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 to-transparent" />
        <p className="animate-fade-up text-xs font-bold uppercase tracking-[0.3em] text-white/70">Municipalidad de Capioví · Misiones</p>
        <h1 className="animate-fade-up mx-auto mt-4 max-w-3xl text-balance font-display text-5xl !text-white sm:text-7xl">Eventos de nuestra comunidad</h1>
        <p className="animate-fade-up mx-auto mt-5 max-w-xl text-lg text-white/85">Elegí un evento para ver la programación, la gastronomía y todo lo que tenemos preparado.</p>
        <a href="#eventos" className="btn-light mt-9">Ver eventos</a>
      </header>

      <section id="eventos" className="section">
        {events.length === 0 ? (
          <p className="text-center text-stone-500">Pronto vamos a publicar los próximos eventos.</p>
        ) : (
          <ul className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => (
              <li key={e.id} style={{ ['--brand' as string]: hexToRgbTriplet(e.theme_color), ['--accent' as string]: hexToRgbTriplet(e.accent_color) }}>
                <Link href={`/e/${e.slug}`} className="group block overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-stone-200 transition hover:-translate-y-1.5 hover:shadow-2xl">
                  <div className="relative aspect-[16/10] overflow-hidden bg-deep">
                    {e.hero_image && <img src={e.hero_image} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {e.start_date && <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-bold text-brand shadow">{formatDate(e.start_date)}</span>}
                  </div>
                  <div className="p-6">
                    <h2 className="text-2xl">{e.name}</h2>
                    {e.tagline && <p className="mt-2 line-clamp-2 text-sm text-stone-600">{e.tagline}</p>}
                    <span className="mt-4 inline-block text-sm font-bold text-brand">Entrar al evento →</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <footer className="space-y-4 border-t border-stone-200 px-4 py-8 text-center text-sm text-stone-500">
        <p>© {new Date().getFullYear()} Municipalidad de Capioví. Todos los derechos reservados. · <Link href="/admin" className="hover:underline">Acceso administración</Link></p>
        <PoweredBy dark={false} />
      </footer>
    </main>
  );
}
