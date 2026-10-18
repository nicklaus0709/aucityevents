import Link from 'next/link';
import type { EventRow } from '@/lib/types';

export default function SiteFooter({ event }: { event: EventRow }) {
  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm sm:flex-row sm:px-6">
        <p>© {new Date().getFullYear()} Municipalidad de Capioví · {event.name}</p>
        <div className="flex gap-5">
          {event.instagram_url && <a href={event.instagram_url} target="_blank" rel="noopener noreferrer" className="hover:text-white">Instagram</a>}
          {event.facebook_url && <a href={event.facebook_url} target="_blank" rel="noopener noreferrer" className="hover:text-white">Facebook</a>}
          {event.whatsapp && <a href={`https://wa.me/${event.whatsapp}`} target="_blank" rel="noopener noreferrer" className="hover:text-white">WhatsApp</a>}
          <Link href="/" className="hover:text-white">Otros eventos</Link>
        </div>
      </div>
    </footer>
  );
}
