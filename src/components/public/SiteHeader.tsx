'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SiteHeader({ slug, name, showBonos }: { slug: string; name: string; showBonos: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const base = `/e/${slug}`;
  const links = [
    { href: base, label: 'Inicio' },
    { href: `${base}/eventos`, label: 'Programación' },
    { href: `${base}/gastronomia`, label: 'Gastronomía' },
    { href: `${base}/publicidad`, label: 'Comercios' },
    { href: `${base}/contacto`, label: 'Contacto' },
  ];

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 bg-deep text-white shadow-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href={base} className="font-display text-xl font-bold leading-none tracking-tight sm:text-2xl">{name}</Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
          {links.map((l) => {
            const active = l.href === base ? pathname === base : pathname.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${active ? 'bg-white/15' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>{l.label}</Link>
            );
          })}
          {showBonos && <Link href={`${base}/bonos`} className="btn ml-2">Comprar bono</Link>}
        </nav>

        <button className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold lg:hidden" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(!open)}>
          {open ? 'Cerrar' : 'Menú'}
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" className="animate-fade-in flex flex-col gap-1 border-t border-white/10 px-4 pb-5 pt-3 lg:hidden" aria-label="Principal móvil">
          {links.map((l) => <Link key={l.href} href={l.href} className="rounded-xl px-4 py-3 text-base font-semibold hover:bg-white/10">{l.label}</Link>)}
          {showBonos && <Link href={`${base}/bonos`} className="btn mt-2 !py-3">Comprar bono de colaboración</Link>}
        </nav>
      )}
    </header>
  );
}
