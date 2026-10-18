import QRCode from 'qrcode';
import { requireEventAccess } from '@/lib/auth';
import { SITE_URL } from '@/lib/utils';
import PrintButton from '@/components/admin/PrintButton';

export default async function QrPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const { event } = await requireEventAccess(eventId);

  const items = [
    { title: 'Grilla de eventos', hint: 'Escaneá para ver artistas y horarios', url: `${SITE_URL}/e/${event.slug}/eventos` },
    { title: 'Gastronomía', hint: 'Escaneá para ver los puestos y productos', url: `${SITE_URL}/e/${event.slug}/gastronomia` },
    { title: 'Sitio del evento', hint: 'Toda la información en un solo lugar', url: `${SITE_URL}/e/${event.slug}` },
    ...(event.bonos_enabled ? [{ title: 'Bono de colaboración', hint: 'Escaneá y colaborá con Mercado Pago', url: `${SITE_URL}/e/${event.slug}/bonos` }] : []),
  ];
  const qrs = await Promise.all(items.map((i) => QRCode.toDataURL(i.url, { width: 700, margin: 2, errorCorrectionLevel: 'H', color: { dark: '#000000', light: '#ffffff' } })));

  return (
    <div className="space-y-4">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-xl">Códigos QR para imprimir</h2><p className="text-sm text-stone-600">Cada QR abre la sección del sitio. Imprimilos y pegalos en la comunidad (una hoja A4 por QR).</p></div>
        <PrintButton />
      </div>
      {SITE_URL.startsWith('http://localhost') && <p className="no-print rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">⚠ NEXT_PUBLIC_SITE_URL apunta a localhost: configurá el dominio real antes de imprimir.</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((it, i) => (
          <figure key={it.url} className="print-page card flex flex-col items-center text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand">{event.name}</p>
            <h3 className="mt-1 text-3xl">{it.title}</h3>
            <img src={qrs[i]} alt={`QR de ${it.title}`} className="my-4 w-full max-w-sm" />
            <figcaption className="text-lg font-medium">{it.hint}</figcaption>
            <p className="mt-1 break-all text-xs text-stone-500">{it.url}</p>
            <a href={qrs[i]} download={`qr-${event.slug}-${i + 1}.png`} className="btn-secondary no-print mt-3">Descargar PNG</a>
          </figure>
        ))}
      </div>
    </div>
  );
}
