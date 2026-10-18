'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminTabs({ eventId }: { eventId: string }) {
  const pathname = usePathname();
  const base = `/admin/${eventId}`;
  const tabs = [
    { href: base, label: 'Resumen' },
    { href: `${base}/config`, label: 'Contenido' },
    { href: `${base}/galeria`, label: 'Galería' },
    { href: `${base}/programacion`, label: 'Grilla' },
    { href: `${base}/gastronomia`, label: 'Gastronomía' },
    { href: `${base}/publicidad`, label: 'Publicidad' },
    { href: `${base}/mensajes`, label: 'Mensajes' },
    { href: `${base}/bonos`, label: 'Bonos' },
    { href: `${base}/qr`, label: 'QR' },
  ];
  return (
    <nav className="-mx-4 flex gap-1 overflow-x-auto border-b border-stone-200 px-4 sm:mx-0 sm:px-0" aria-label="Secciones del evento">
      {tabs.map((t) => {
        const active = t.href === base ? pathname === base : pathname.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium ${active ? 'border-brand text-brand' : 'border-transparent text-stone-600 hover:text-stone-900'}`}>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
