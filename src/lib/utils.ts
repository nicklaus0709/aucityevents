export const TZ = 'America/Argentina/Cordoba'; // Misiones: UTC-3

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat('es-AR', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(iso));
}
export function formatDay(iso: string) {
  return new Intl.DateTimeFormat('es-AR', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(iso));
}
export function formatTime(iso: string) {
  return new Intl.DateTimeFormat('es-AR', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(iso));
}
export function formatDate(d: string) {
  return new Intl.DateTimeFormat('es-AR', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(d));
}
export function formatMoney(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n);
}

/** ISO -> valor para <input type="datetime-local"> en hora de Misiones */
export function toInputDateTime(iso?: string | null) {
  if (!iso) return '';
  const p = new Intl.DateTimeFormat('sv-SE', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(iso));
  return p.replace(' ', 'T');
}
/** valor de datetime-local (hora de Misiones, UTC-3 fijo) -> ISO */
export function fromInputDateTime(v: string) {
  return new Date(`${v}:00-03:00`).toISOString();
}

export function hexToRgbTriplet(hex: string) {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return '194 65 12';
  const n = parseInt(m[1], 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

/** Texto con años ("2009 – Los inicios" + párrafo) -> línea de tiempo. Lo demás es introducción. */
export function parseHistory(text: string) {
  const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  const intro: string[] = [];
  const items: { title: string; body: string }[] = [];
  for (let i = 0; i < blocks.length; i++) {
    if (/^\d{4}(\s*[–-]\s*[^\n]+)?$/.test(blocks[i]) && blocks[i + 1]) items.push({ title: blocks[i], body: blocks[++i] });
    else if (items.length === 0) intro.push(blocks[i]);
    else items[items.length - 1].body += '\n\n' + blocks[i];
  }
  return { intro, items };
}

export function groupBy<T>(items: T[], key: (i: T) => string) {
  const out = new Map<string, T[]>();
  for (const i of items) {
    const k = key(i);
    out.set(k, [...(out.get(k) ?? []), i]);
  }
  return out;
}
