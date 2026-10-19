import { promises as fs } from 'fs';
import nodePath from 'path';

/**
 * Sirve las imágenes subidas por el panel (reemplaza al Storage de Supabase).
 * Los archivos viven en UPLOAD_DIR (volumen persistente) bajo `<eventId>/<uuid>.<ext>`.
 */
const UPLOAD_DIR = process.env.UPLOAD_DIR || nodePath.join(process.cwd(), '.data', 'uploads');
const TYPES: Record<string, string> = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const segments = (await params).path;
  const [eventId, file] = Array.isArray(segments) ? segments : [];
  // Ruta estricta: exactamente dos segmentos, con formato conocido (sin recorridos ../..)
  if (!eventId || !file || !/^[0-9a-f-]{36}$/i.test(eventId) || !/^[A-Za-z0-9_-]+\.(jpg|png|webp)$/.test(file)) {
    return new Response('Not found', { status: 404 });
  }
  try {
    const data = await fs.readFile(nodePath.join(UPLOAD_DIR, eventId, file));
    return new Response(new Uint8Array(data), {
      headers: { 'Content-Type': TYPES[file.split('.').pop()!] ?? 'application/octet-stream', 'Cache-Control': 'public, max-age=31536000, immutable' },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
