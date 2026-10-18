'use client';

import { useEffect, useState } from 'react';
import type { Ad } from '@/lib/types';

function safeUrl(u: string | null) {
  try { return u && /^https?:$/.test(new URL(u).protocol) ? u : null; } catch { return null; }
}

/** Muestra hasta 3 banners a la vez (1 en celular) y rota cada 5 segundos. */
export default function AdRotator({ ads }: { ads: Ad[] }) {
  const [start, setStart] = useState(0);
  const [paused, setPaused] = useState(false);
  const visible = Math.min(3, ads.length);

  useEffect(() => {
    if (ads.length <= 1 || paused) return;
    const t = setInterval(() => setStart((v) => (v + 1) % ads.length), 5000);
    return () => clearInterval(t);
  }, [ads.length, paused]);

  const shown = Array.from({ length: visible }, (_, i) => ads[(start + i) % ads.length]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <p className="mb-5 text-center text-xs font-bold uppercase tracking-[0.2em] text-stone-400">Nos acompañan nuestros comercios</p>
      <ul className="grid gap-4 md:grid-cols-3">
        {shown.map((ad, i) => {
          const href = safeUrl(ad.link_url);
          const img = <img key={ad.id} src={ad.image_url} alt={`Publicidad: ${ad.business_name}`} loading="lazy" className="aspect-[3/1] w-full animate-fade-in rounded-2xl object-cover shadow-sm ring-1 ring-stone-200" />;
          return (
            <li key={`${ad.id}-${start}-${i}`} className={i > 0 ? 'hidden md:block' : ''}>
              {href ? <a href={href} target="_blank" rel="noopener noreferrer sponsored" className="block transition hover:-translate-y-0.5">{img}</a> : img}
            </li>
          );
        })}
      </ul>
      {ads.length > 1 && (
        <div className="mt-5 flex justify-center gap-1.5" aria-label="Publicidades">
          {ads.map((a, idx) => (
            <button key={a.id} aria-label={`Ver desde ${a.business_name}`} onClick={() => setStart(idx)} className={`h-2 rounded-full transition-all ${idx === start ? 'w-6 bg-brand' : 'w-2 bg-stone-300'}`} />
          ))}
        </div>
      )}
    </div>
  );
}
