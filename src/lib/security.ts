import 'server-only';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/db';

export function getClientIp(headers: Headers) {
  return (headers.get('x-forwarded-for')?.split(',')[0] || headers.get('x-real-ip') || 'unknown').trim();
}

/** Rate limit persistente (tabla rate_limits, atómico con ON CONFLICT). Falla "cerrado". */
export async function rateLimit(key: string, max: number, windowSeconds: number) {
  try {
    const rows = await prisma.$queryRaw<{ allowed: boolean }[]>`
      INSERT INTO rate_limits (key, window_start, hits) VALUES (${key}, now(), 1)
      ON CONFLICT (key) DO UPDATE SET
        window_start = CASE WHEN rate_limits.window_start < now() - make_interval(secs => ${windowSeconds}::int) THEN now() ELSE rate_limits.window_start END,
        hits = CASE WHEN rate_limits.window_start < now() - make_interval(secs => ${windowSeconds}::int) THEN 1 ELSE rate_limits.hits + 1 END
      RETURNING hits <= ${max}::int AS allowed`;
    return rows[0]?.allowed === true;
  } catch { return false; }
}

/** Valida que el POST venga de nuestro propio sitio (defensa CSRF adicional en APIs públicas). */
export function isSameOrigin(headers: Headers) {
  const origin = headers.get('origin');
  const host = headers.get('x-forwarded-host') || headers.get('host');
  if (!origin || !host) return false;
  try {
    if (new URL(origin).host === host) return true;
    // Base44 preview only: el proxy entrega el sitio en un host público distinto
    // del Host interno; se acepta ese origen solo cuando corre en modo preview.
    // Con el flag ausente o con otro valor, el chequeo queda como siempre.
    if (
      process.env.BASE44_PREVIEW_MODE === '1' &&
      process.env.BASE44_PUBLIC_HOST_SUFFIX &&
      new URL(origin).host === `3000-${process.env.BASE44_PUBLIC_HOST_SUFFIX}`
    ) return true;
    return false;
  } catch { return false; }
}

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // sin caracteres ambiguos
export function generateBonoCode() {
  const bytes = randomBytes(10);
  let s = '';
  for (const b of bytes) s += ALPHABET[b % ALPHABET.length];
  return `${s.slice(0, 5)}-${s.slice(5)}`;
}

export function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}
