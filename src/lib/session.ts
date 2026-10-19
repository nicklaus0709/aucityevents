import 'server-only';
import { createHmac, randomBytes, timingSafeEqual, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt) as (password: string, salt: string, keylen: number) => Promise<Buffer>;

export const SESSION_COOKIE = 'admin_session';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 días

/** Hash de contraseña (scrypt con sal aleatoria). Formato: `sal:hash`. */
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = await scrypt(password, salt, 64);
  return `${salt}:${hash.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const test = await scrypt(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return expected.length === test.length && timingSafeEqual(expected, test);
}

function sign(payload: string) {
  return createHmac('sha256', process.env.AUTH_SECRET ?? '').update(payload).digest('base64url');
}

/** Token de sesión firmado: `<userId>.<expiración>.<firma HMAC>`. Verificable sin base. */
export async function createSessionToken(userId: string) {
  if (!process.env.AUTH_SECRET) throw new Error('AUTH_SECRET no está configurada');
  const exp = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = `${userId}.${exp}`;
  return { token: `${payload}.${sign(payload)}`, maxAge: MAX_AGE_SECONDS };
}

export function verifySessionToken(token: string | undefined | null): string | null {
  if (!token || !process.env.AUTH_SECRET) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [userId, exp, sig] = parts;
  const expected = Buffer.from(sign(`${userId}.${exp}`));
  const received = Buffer.from(sig);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
  if (!Number(exp) || Number(exp) < Date.now()) return null;
  return userId;
}

export const SESSION_MAX_AGE = MAX_AGE_SECONDS;
