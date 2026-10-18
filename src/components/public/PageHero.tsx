/** Encabezado de las páginas internas: imagen del evento oscurecida + título. */
export default function PageHero({ eyebrow, title, subtitle, image }: { eyebrow: string; title: string; subtitle?: string; image?: string | null }) {
  return (
    <section className="relative isolate overflow-hidden bg-deep bg-festive text-white">
      {image && <img src={image} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-30" />}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/40 to-transparent" />
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-white/70">{eyebrow}</p>
        <h1 className="animate-fade-up font-display text-4xl !text-white sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-4 max-w-2xl text-lg text-white/85">{subtitle}</p>}
      </div>
    </section>
  );
}
