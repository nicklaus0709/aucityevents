'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function SiteHeader({ slug, name, showBonos }: { slug: string; name: string; showBonos: boolean }) {
  const [open, setOpen] = useState(false);
  const base = `/e/${slug}`;
  const links = [
    { href: base, label: 'Inicio' },
    { href: `${base}/eventos`, label: 'Grilla' },
    { href: `${base}/gastronomia`, label: 'Gastronomía' },
    { href: `${base}/publicidad`, label: 'Comercios' },
    ...(showBonos ? [{ href: `${base}/bonos`, label: 'Bonos' }] : []),
    { href: `${base}/contacto`, label: 'Contacto' },
  ];
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href={base} className="text-lg font-extrabold text-brand">{name}</Link>
        <button className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm md:hidden" aria-expanded={open} aria-label="Menú" onClick={() => setOpen(!open)}>
          {open ? '✕' : '☰'}
        </button>
        <nav className="hidden gap-6 text-sm font-medium md:flex" aria-label="Principal">
          {links.map((l) => <Link key={l.href} href={l.href} className="hover:text-brand">{l.label}</Link>)}
        </nav>
      </div>
      {open && (
        <nav className="flex flex-col border-t border-stone-200 bg-white px-4 py-2 md:hidden" aria-label="Principal móvil">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded px-2 py-3 text-sm font-medium hover:bg-stone-100">{l.label}</Link>
          ))}
        </nav>
      )}
    </header>
  );
}
