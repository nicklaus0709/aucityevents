/** Crédito del desarrollador. Se usa sobre fondo oscuro (pie del evento) o claro (portada general). */
export default function PoweredBy({ dark = true }: { dark?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`flex w-full max-w-sm items-center gap-3 text-[10px] font-bold uppercase tracking-[0.25em] ${dark ? 'text-white/55' : 'text-stone-400'}`}>
        <span className={`h-px flex-1 ${dark ? 'bg-white/20' : 'bg-stone-300'}`} />
        Desarrollado por
        <span className={`h-px flex-1 ${dark ? 'bg-white/20' : 'bg-stone-300'}`} />
      </div>
      <a
        href="https://auvance.com.ar/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Auvance - sitio del desarrollador"
        className={`group inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-extrabold tracking-wide transition hover:-translate-y-0.5 ${dark ? 'text-white hover:bg-white/10' : 'text-stone-700 hover:bg-stone-100'}`}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 transition group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 20 12 4l9 16" />
          <path d="M8 20l4-7 4 7" />
        </svg>
        AUVANCE
      </a>
    </div>
  );
}
