import Link from 'next/link';
import { listPublishedEvents } from '@/lib/data';
import { formatDate } from '@/lib/utils';

export const revalidate = 60;

export default async function Home() {
  const events = await listPublishedEvents();
  return (
    <main className="min-h-screen">
      <header className="bg-gradient-to-br from-orange-700 to-amber-500 px-4 py-16 text-center text-white">
        <p className="text-sm font-semibold uppercase tracking-widest opacity-90">Municipalidad de Capioví · Misiones</p>
        <h1 className="mt-3 text-4xl font-extrabold !text-white sm:text-5xl">Eventos de la comunidad</h1>
        <p className="mx-auto mt-4 max-w-xl opacity-95">Elegí un evento para ver la grilla de artistas, la gastronomía y más.</p>
      </header>
      <section className="section">
        {events.length === 0 ? (
          <p className="text-center text-stone-500">Pronto vamos a publicar los próximos eventos.</p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => (
              <li key={e.id}>
                <Link href={`/e/${e.slug}`} className="card block h-full transition hover:shadow-md">
                  {e.hero_image && <img src={e.hero_image} alt="" loading="lazy" className="-mx-5 -mt-5 mb-4 h-40 w-[calc(100%+2.5rem)] rounded-t-xl object-cover" />}
                  <h2 className="text-xl">{e.name}</h2>
                  {e.tagline && <p className="mt-1 text-sm text-stone-600">{e.tagline}</p>}
                  {e.start_date && <p className="mt-3 text-sm font-medium text-orange-700">{formatDate(e.start_date)}</p>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <footer className="border-t border-stone-200 py-6 text-center text-sm text-stone-500">
        <Link href="/admin" className="hover:underline">Acceso administración</Link>
      </footer>
    </main>
  );
}
