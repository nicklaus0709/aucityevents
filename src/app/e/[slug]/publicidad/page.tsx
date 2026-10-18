import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getEventContent, loadEvent } from '@/lib/data';

export const revalidate = 60;
export const metadata: Metadata = { title: 'Comercios que acompañan' };

function safeUrl(u: string | null) {
  try { return u && /^https?:$/.test(new URL(u).protocol) ? u : null; } catch { return null; }
}

export default async function AdsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await loadEvent(slug);
  if (!event) notFound();
  const { ads } = await getEventContent(event.id);

  return (
    <section className="section">
      <h1 className="text-3xl">Comercios que acompañan</h1>
      <p className="mt-2 text-stone-600">Gracias a ellos este evento es posible. ¡Visitalos!</p>
      {ads.length === 0 && <p className="mt-6 text-stone-500">Próximamente.</p>}
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ads.map((a) => {
          const href = safeUrl(a.link_url);
          const body = (
            <>
              <img src={a.image_url} alt={`Publicidad de ${a.business_name}`} loading="lazy" className="h-44 w-full rounded-lg object-cover" />
              <h2 className="mt-3 text-lg">{a.business_name}</h2>
              {a.description && <p className="text-sm text-stone-600">{a.description}</p>}
            </>
          );
          return (
            <li key={a.id} className="card">
              {href ? <a href={href} target="_blank" rel="noopener noreferrer sponsored" className="block">{body}</a> : body}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
