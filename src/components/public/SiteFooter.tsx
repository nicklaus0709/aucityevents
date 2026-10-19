import { Link } from 'react-router-dom';
import type { EventRow } from '@/lib/types';
import PoweredBy from './PoweredBy';

export default function SiteFooter({ event }: { event: EventRow }) {
  const base = `/e/${event.slug}`;
  const tel = event.phone?.replace(/[^\d+]/g, '');
  const social = [
    { label: 'Instagram', url: event.instagram_url }, { label: 'Facebook', url: event.facebook_url }, { label: 'YouTube', url: event.youtube_url },
  ].filter((s) => s.url);

  return (
    <footer className="bg-deep bg-festive text-white/80">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl font-bold text-white">{event.name}</p>
          {event.tagline && <p className="mt-3 text-sm leading-relaxed">{event.tagline}</p>}
          {social.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2">
              {social.map((s) => <li key={s.label}><a href={s.url!} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/25 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-white/15">{s.label}</a></li>)}
            </ul>
          )}
        </div>
        <nav aria-label="Pie de página">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white">Explorá</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to={base} className="hover:text-white">Inicio</Link></li>
            <li><Link to={`${base}/eventos`} className="hover:text-white">Programación</Link></li>
            <li><Link to={`${base}/gastronomia`} className="hover:text-white">Gastronomía</Link></li>
            <li><Link to={`${base}/publicidad`} className="hover:text-white">Comercios que acompañan</Link></li>
            {event.bonos_enabled && <li><Link to={`${base}/bonos`} className="hover:text-white">Bonos de colaboración</Link></li>}
            <li><Link to={`${base}/contacto`} className="hover:text-white">Contacto</Link></li>
          </ul>
        </nav>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white">Contacto</p>
          <ul className="mt-4 space-y-2 text-sm">
            {event.location && <li>📍 {event.location}</li>}
            {event.phone && <li>📞 <a href={`tel:${tel}`} className="hover:text-white">{event.phone}</a></li>}
            {event.whatsapp && <li>💬 <a href={`https://wa.me/${event.whatsapp}`} target="_blank" rel="noopener noreferrer" className="hover:text-white">WhatsApp de la Municipalidad</a></li>}
            {event.email && <li>✉️ <a href={`mailto:${event.email}`} className="hover:text-white">{event.email}</a></li>}
          </ul>
          <Link to="/" className="mt-5 inline-block text-sm font-semibold text-white underline-offset-4 hover:underline">Ver otros eventos →</Link>
        </div>
      </div>
      <div className="space-y-4 border-t border-white/10 px-4 py-6 text-center">
        <p className="text-xs text-white/60">© {new Date().getFullYear()} Municipalidad de Capioví · {event.name}. Todos los derechos reservados.</p>
        <PoweredBy />
      </div>
    </footer>
  );
}
