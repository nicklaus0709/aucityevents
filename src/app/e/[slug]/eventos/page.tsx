import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getEventContent, loadEvent } from '@/lib/data';
import { formatDay, formatTime, groupBy } from '@/lib/utils';

export const revalidate = 60;
export const metadata: Metadata = { title: 'Grilla de eventos' };

export default async function SchedulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await loadEvent(slug);
  if (!event) notFound();
  const { schedule } = await getEventContent(event.id);
  const days = groupBy(schedule, (s) => formatDay(s.starts_at));

  return (
    <section className="section">
      <h1 className="text-3xl">Grilla de eventos</h1>
      {schedule.length === 0 && <p className="mt-6 text-stone-500">La grilla se publicará muy pronto.</p>}
      {[...days.entries()].map(([day, items]) => (
        <div key={day} className="mt-8">
          <h2 className="text-xl capitalize text-brand">{day}</h2>
          <ul className="mt-4 space-y-3">
            {items.map((s) => (
              <li key={s.id} className="card flex gap-4">
                {s.image_url && <img src={s.image_url} alt="" loading="lazy" className="h-20 w-20 shrink-0 rounded-lg object-cover" />}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-brand">
                    {formatTime(s.starts_at)}{s.ends_at && ` – ${formatTime(s.ends_at)}`} hs{s.stage && ` · ${s.stage}`}
                  </p>
                  <p className="text-lg font-bold">{s.artist}</p>
                  {s.description && <p className="mt-1 text-sm text-stone-600">{s.description}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
