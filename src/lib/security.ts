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
  try { return new URL(origin).host === host; } catch { return false; }
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
