import QRCode from 'qrcode';
import Link from 'next/link';
import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { formatMoney } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Tu bono', robots: { index: false } };

export default async function BonoResult({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ ref?: string }> }) {
  const { slug } = await params;
  const { ref } = await searchParams;
  const valid = ref && /^[0-9a-f-]{36}$/i.test(ref);

  // La referencia es un UUID aleatorio no adivinable; solo se muestran datos mínimos.
  const p = valid
    ? await prisma.bono_purchases.findUnique({ where: { id: ref }, include: { bono_type: { select: { name: true } } } })
    : null;

  if (!p) return <section className="section text-center"><h1 className="text-2xl">No encontramos tu compra</h1><Link className="btn mt-6" href={`/e/${slug}`}>Volver al inicio</Link></section>;

  const qr = p.status === 'approved' ? await QRCode.toDataURL(p.code, { margin: 1, width: 280 }) : null;
  const bonoName = p.bono_type?.name;

  return (
    <section className="section max-w-xl text-center">
      {p.status === 'approved' ? (
        <>
          <h1 className="text-3xl text-green-700">¡Pago aprobado! 🎉</h1>
          <p className="mt-2 text-stone-600">Gracias {p.buyer_name}. Guardá este código y presentalo en el evento.</p>
          <div className="card mt-6">
            {qr && <img src={qr} alt={`Código QR ${p.code}`} className="mx-auto h-56 w-56" />}
            <p className="mt-3 font-mono text-2xl font-bold tracking-widest">{p.code}</p>
            <p className="mt-2 text-sm text-stone-600">{p.quantity} × {bonoName} · {formatMoney(Number(p.amount))}</p>
          </div>
          <p className="mt-4 text-sm text-stone-500">Tip: sacale una captura de pantalla.</p>
        </>
      ) : p.status === 'pending' ? (
        <>
          <h1 className="text-3xl">Pago en proceso ⏳</h1>
          <p className="mt-2 text-stone-600">Estamos esperando la confirmación de Mercado Pago. Actualizá esta página en unos minutos.</p>
        </>
      ) : (
        <>
          <h1 className="text-3xl text-red-700">El pago no se completó</h1>
          <p className="mt-2 text-stone-600">No se realizó ningún cobro. Podés intentarlo nuevamente.</p>
          <Link className="btn mt-6" href={`/e/${slug}/bonos`}>Reintentar</Link>
        </>
      )}
    </section>
  );
}
