import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getEventContent, loadEvent } from '@/lib/data';
import { formatDay, formatTime, groupBy } from '@/lib/utils';
import PageHero from '@/components/public/PageHero';

export const revalidate = 60;
export const metadata: Metadata = { title: 'Programación' };

export default async function SchedulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await loadEvent(slug);
  if (!event) notFound();
  const { schedule } = await getEventContent(event.id);
  const days = groupBy(schedule, (s) => formatDay(s.starts_at));

  return (
    <>
      <PageHero eyebrow={event.name} title="Programación" subtitle="Artistas, escenarios y horarios del evento." image={event.hero_image} />
      <section className="section">
        {schedule.length === 0 && <p className="text-stone-500">La programación se publicará muy pronto.</p>}
        <div className="space-y-14">
          {[...days.entries()].map(([day, items]) => (
            <div key={day}>
              <h2 className="mb-6 flex items-center gap-4 text-2xl sm:text-3xl">
                <span className="h-1 w-10 shrink-0 rounded-full bg-brand" /><span className="inline-block first-letter:uppercase">{day}</span>
              </h2>
              <ul className="space-y-4">
                {items.map((s) => (
                  <li key={s.id} className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200 transition hover:shadow-lg sm:flex-row">
                    <div className="flex shrink-0 flex-row items-center justify-center gap-2 bg-brand px-6 py-4 text-white sm:w-36 sm:flex-col sm:gap-0">
                      <span className="text-3xl font-extrabold leading-none">{formatTime(s.starts_at)}</span>
                      <span className="text-xs font-bold uppercase tracking-widest text-white/80">{s.ends_at ? `a ${formatTime(s.ends_at)} hs` : 'hs'}</span>
                    </div>
                    {s.image_url && <img src={s.image_url} alt="" loading="lazy" className="h-40 w-full object-cover sm:h-auto sm:w-48" />}
                    <div className="p-5">
                      {s.stage && <p className="text-xs font-bold uppercase tracking-wider text-accent">📍 {s.stage}</p>}
                      <h3 className="mt-1 text-xl">{s.artist}</h3>
                      {s.description && <p className="mt-2 text-stone-600">{s.description}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
