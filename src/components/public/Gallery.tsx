
import { useCallback, useEffect, useState } from 'react';
import type { GalleryImage } from '@/lib/types';

/** Galería tipo mosaico con visor a pantalla completa (teclado: ← → Esc). */
export default function Gallery({ images, alt }: { images: GalleryImage[]; alt: string }) {
  const [current, setCurrent] = useState<number | null>(null);
  const close = useCallback(() => setCurrent(null), []);
  const move = useCallback((d: number) => setCurrent((c) => (c === null ? c : (c + d + images.length) % images.length)), [images.length]);

  useEffect(() => {
    if (current === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') move(1);
      if (e.key === 'ArrowLeft') move(-1);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [current, close, move]);

  const img = current !== null ? images[current] : null;

  return (
    <>
      <ul className="columns-2 gap-3 sm:gap-4 md:columns-3">
        {images.map((g, i) => (
          <li key={g.id} className="mb-3 break-inside-avoid sm:mb-4">
            <button onClick={() => setCurrent(i)} className="group relative block w-full overflow-hidden rounded-2xl" aria-label={`Ampliar: ${g.caption ?? alt}`}>
              <img src={g.image_url} alt={g.caption ?? alt} loading="lazy" className="w-full object-cover transition duration-500 group-hover:scale-105" />
              {g.caption && <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-left text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100">{g.caption}</span>}
            </button>
          </li>
        ))}
      </ul>

      {img && (
        <div role="dialog" aria-modal="true" aria-label="Visor de fotos" className="animate-fade-in fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4" onClick={close}>
          <button onClick={close} aria-label="Cerrar" className="absolute right-4 top-4 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/20">✕ Cerrar</button>
          {images.length > 1 && <>
            <button onClick={(e) => { e.stopPropagation(); move(-1); }} aria-label="Anterior" className="absolute left-3 rounded-full bg-white/10 px-4 py-3 text-2xl text-white hover:bg-white/20">‹</button>
            <button onClick={(e) => { e.stopPropagation(); move(1); }} aria-label="Siguiente" className="absolute right-3 rounded-full bg-white/10 px-4 py-3 text-2xl text-white hover:bg-white/20">›</button>
          </>}
          <figure className="max-h-full max-w-5xl text-center" onClick={(e) => e.stopPropagation()}>
            <img src={img.image_url} alt={img.caption ?? alt} className="mx-auto max-h-[80vh] rounded-xl object-contain" />
            {img.caption && <figcaption className="mt-3 text-sm font-medium text-white">{img.caption}</figcaption>}
          </figure>
        </div>
      )}
    </>
  );
}
