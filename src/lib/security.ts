import 'server-only';
import { randomBytes } from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';

export function getClientIp(headers: Headers) {
  return (headers.get('x-forwarded-for')?.split(',')[0] || headers.get('x-real-ip') || 'unknown').trim();
}

/** Rate limit persistente (tabla en Supabase): funciona en serverless. Falla "cerrado". */
export async function rateLimit(key: string, max: number, windowSeconds: number) {
  const { data, error } = await createAdminClient().rpc('check_rate_limit', {
    p_key: key, p_max: max, p_window_seconds: windowSeconds,
  });
  if (error) return false;
  return data === true;
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
