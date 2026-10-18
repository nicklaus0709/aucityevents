import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getEventContent, loadEvent } from '@/lib/data';

export const revalidate = 60;
export const metadata: Metadata = { title: 'Gastronomía' };

export default async function FoodPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await loadEvent(slug);
  if (!event) notFound();
  const { stalls } = await getEventContent(event.id);

  return (
    <section className="section">
      <h1 className="text-3xl">Gastronomía</h1>
      {stalls.length === 0 && <p className="mt-6 text-stone-500">Pronto vas a ver acá los puestos gastronómicos.</p>}
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stalls.map((s) => (
          <li key={s.id} className="card">
            <div className="flex items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-extrabold text-white" aria-label={`Puesto ${s.number}`}>{s.number}</span>
              <div>
                <h2 className="text-lg leading-tight">{s.name}</h2>
                {s.owner && <p className="text-sm text-stone-500">{s.owner}</p>}
              </div>
            </div>
            {s.image_url && <img src={s.image_url} alt="" loading="lazy" className="mt-3 h-36 w-full rounded-lg object-cover" />}
            {s.products.length > 0 && (
              <ul className="mt-3 list-disc space-y-0.5 pl-5 text-sm text-stone-700">
                {s.products.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
