import { admin } from '@/lib/api';
import type { Field } from '@/lib/admin-config';
import { fromInputDateTime } from '@/lib/utils';

const MAX_IMAGE = 5 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

type Parsed = { value?: unknown; error?: string };

function parseField(f: Field, fd: FormData): Parsed {
  const raw = fd.get(f.name);
  const str = typeof raw === 'string' ? raw.trim() : '';
  const empty = str === '';
  if (f.type === 'checkbox') return { value: raw === 'on' };
  if (f.type === 'image') return {}; // se resuelve aparte
  if (f.type === 'lines') {
    const lines = str.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length > 50 || lines.some((l) => l.length > 150)) return { error: `${f.label}: máximo 50 líneas de 150 caracteres` };
    return { value: lines };
  }
  if (empty) return f.required ? { error: `${f.label} es obligatorio` } : { value: null };
  if (f.max && str.length > f.max) return { error: `${f.label}: máximo ${f.max} caracteres` };

  switch (f.type) {
    case 'number': {
      const n = Number(str);
      if (!Number.isFinite(n) || (f.integer && !Number.isInteger(n)) || (f.min !== undefined && n < f.min) || n > 1e9) return { error: `${f.label} no es válido` };
      return { value: n };
    }
    case 'date': return /^\d{4}-\d{2}-\d{2}$/.test(str) ? { value: str } : { error: `${f.label} no es válida` };
    case 'datetime': return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(str) ? { value: fromInputDateTime(str) } : { error: `${f.label} no es válida` };
    case 'color': return /^#[0-9a-f]{6}$/i.test(str) ? { value: str } : { error: `${f.label} no es válido` };
    case 'tel': return /^[0-9]{8,15}$/.test(str) ? { value: str } : { error: `${f.label}: solo números, de 8 a 15 dígitos` };
    case 'url':
      try {
        const u = new URL(str);
        if (!/^https?:$/.test(u.protocol)) throw new Error();
        return { value: u.toString() };
      } catch { return { error: `${f.label} debe ser una URL válida (https://…)` }; }
    case 'select': return f.options?.some((o) => o.value === str) ? { value: str } : { error: `${f.label} no es válido` };
    default: return { value: str };
  }
}

async function checkImage(file: File): Promise<string | null> {
  if (!IMAGE_TYPES.includes(file.type)) return 'Solo se permiten imágenes JPG, PNG o WebP';
  if (file.size > MAX_IMAGE) return 'La imagen supera los 5 MB';
  // Verificación de la firma real del archivo (no solo el tipo declarado)
  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const isJpg = head[0] === 0xff && head[1] === 0xd8;
  const isPng = head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47;
  const isWebp = String.fromCharCode(...head.slice(0, 4)) === 'RIFF' && String.fromCharCode(...head.slice(8, 12)) === 'WEBP';
  return isJpg || isPng || isWebp ? null : 'El archivo no es una imagen válida';
}

/** Convierte un formulario en el objeto a guardar (valida y sube las imágenes). Lanza Error con mensaje para el usuario. */
export async function buildPayload(fields: Field[], fd: FormData): Promise<Record<string, unknown>> {
  const payload: Record<string, unknown> = {};
  for (const f of fields) {
    if (f.type === 'image') {
      const file = fd.get(f.name);
      const current = String(fd.get(`${f.name}__current`) || '');
      if (file instanceof File && file.size > 0) {
        const err = await checkImage(file);
        if (err) throw new Error(err);
        payload[f.name] = await admin.uploadImage(file);
      } else if (current) payload[f.name] = current;
      else if (f.required) throw new Error(`${f.label} es obligatoria`);
      else payload[f.name] = null;
      continue;
    }
    const r = parseField(f, fd);
    if (r.error) throw new Error(r.error);
    payload[f.name] = r.value;
  }
  return payload;
}
