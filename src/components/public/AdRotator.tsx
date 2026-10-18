'use client';

import { useEffect, useState } from 'react';
import type { Ad } from '@/lib/types';

function safeUrl(u: string | null) {
  try { return u && /^https?:$/.test(new URL(u).protocol) ? u : null; } catch { return null; }
}

/** Pequeña sección de publicidad que va rotando cada 6 segundos. */
export default function AdRotator({ ads }: { ads: Ad[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (ads.length < 2 || paused) return;
    const t = setInterval(() => setI((v) => (v + 1) % ads.length), 6000);
    return () => clearInterval(t);
  }, [ads.length, paused]);

  const ad = ads[i % ads.length];
  const href = safeUrl(ad.link_url);
  const img = <img src={ad.image_url} alt={`Publicidad: ${ad.business_name}`} loading="lazy" className="mx-auto h-24 w-full max-w-3xl rounded-lg object-contain sm:h-28" />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-widest text-stone-400">Con el apoyo de nuestros comercios</p>
      {href ? <a href={href} target="_blank" rel="noopener noreferrer sponsored">{img}</a> : img}
      {ads.length > 1 && (
        <div className="mt-2 flex justify-center gap-1.5" role="tablist" aria-label="Publicidades">
          {ads.map((a, idx) => (
            <button key={a.id} aria-label={`Ver ${a.business_name}`} onClick={() => setI(idx)} className={`h-2 w-2 rounded-full ${idx === i ? 'bg-brand' : 'bg-stone-300'}`} />
          ))}
        </div>
      )}
    </div>
  );
}
