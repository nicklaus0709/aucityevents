'use server';

import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { z } from 'zod';
import { requireEventAccess, requireSuperAdmin } from '@/lib/auth';
import { TABLES, type Field } from '@/lib/admin-config';
import { fromInputDateTime } from '@/lib/utils';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getClientIp, rateLimit } from '@/lib/security';

const MAX_IMAGE = 5 * 1024 * 1024;
const IMAGE_TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

type Row = Record<string, unknown>;

function back(path: string, key: 'error' | 'ok', msg: string): never {
  redirect(`${path}?${key}=${encodeURIComponent(msg)}`);
}

function parseField(f: Field, fd: FormData): { value?: unknown; error?: string } {
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

async function uploadImage(supabase: Awaited<ReturnType<typeof createClient>>, eventId: string, file: File): Promise<{ url?: string; error?: string }> {
  const ext = IMAGE_TYPES[file.type];
  if (!ext) return { error: 'Solo se permiten imágenes JPG, PNG o WebP' };
  if (file.size > MAX_IMAGE) return { error: 'La imagen supera los 5 MB' };
  // Verificación de firma real del archivo (no solo el tipo declarado)
  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const isJpg = head[0] === 0xff && head[1] === 0xd8;
  const isPng = head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47;
  const isWebp = String.fromCharCode(...head.slice(0, 4)) === 'RIFF' && String.fromCharCode(...head.slice(8, 12)) === 'WEBP';
  if (!(isJpg || isPng || isWebp)) return { error: 'El archivo no es una imagen válida' };

  const path = `${eventId}/${randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from('event-media').upload(path, file, { contentType: file.type, upsert: false });
  if (error) return { error: 'No se pudo subir la imagen' };
  return { url: supabase.storage.from('event-media').getPublicUrl(path).data.publicUrl };
}

function checkPath(eventId: string, path: string) {
  if (!path.startsWith(`/admin/${eventId}`) || path.includes('..') || path.includes('?')) redirect('/admin');
}

export async function saveRow(fd: FormData) {
  const table = String(fd.get('_table'));
  const eventId = String(fd.get('_eventId'));
  const id = String(fd.get('_id') || '');
  const path = String(fd.get('_path'));
  const cfg = TABLES[table];
  if (!cfg || !Object.hasOwn(TABLES, table)) redirect('/admin');
  checkPath(eventId, path);

  const { supabase, event } = await requireEventAccess(eventId);

  const payload: Row = {};
  for (const f of cfg.fields) {
    if (f.type === 'image') {
      const file = fd.get(f.name);
      const current = String(fd.get(`${f.name}__current`) || '');
      if (file instanceof File && file.size > 0) {
        const up = await uploadImage(supabase, eventId, file);
        if (up.error) back(path, 'error', up.error);
        payload[f.name] = up.url;
      } else if (current && (current.startsWith(process.env.NEXT_PUBLIC_SUPABASE_URL!) || current.startsWith('/demo/'))) {
        payload[f.name] = current;
      } else if (f.required) {
        back(path, 'error', `${f.label} es obligatoria`);
      } else payload[f.name] = null;
      continue;
    }
    const r = parseField(f, fd);
    if (r.error) back(path, 'error', r.error);
    payload[f.name] = r.value;
  }

  if (table === 'events') {
    if (payload.start_date && payload.end_date && String(payload.end_date) < String(payload.start_date)) back(path, 'error', 'La fecha de fin es anterior al inicio');
    const { error } = await supabase.from('events').update(payload).eq('id', eventId);
    if (error) back(path, 'error', 'No se pudo guardar');
  } else if (id) {
    if (!/^[0-9a-f-]{36}$/i.test(id)) redirect('/admin');
    const { error } = await supabase.from(table).update(payload).eq('id', id).eq('event_id', eventId);
    if (error) back(path, 'error', error.code === '23505' ? 'Ya existe un registro con ese número' : 'No se pudo guardar');
  } else {
    const { error } = await supabase.from(table).insert({ ...payload, event_id: eventId });
    if (error) back(path, 'error', error.code === '23505' ? 'Ya existe un registro con ese número' : 'No se pudo guardar');
  }

  revalidatePath(`/e/${event.slug}`, 'layout');
  revalidatePath(path);
  back(path, 'ok', 'Guardado');
}

export async function deleteRow(fd: FormData) {
  const table = String(fd.get('_table'));
  const eventId = String(fd.get('_eventId'));
  const id = String(fd.get('_id'));
  const path = String(fd.get('_path'));
  const cfg = TABLES[table];
  if (!cfg || !cfg.scoped || !/^[0-9a-f-]{36}$/i.test(id)) redirect('/admin');
  checkPath(eventId, path);

  const { supabase, event } = await requireEventAccess(eventId);
  const { error } = await supabase.from(table).delete().eq('id', id).eq('event_id', eventId);
  if (error) back(path, 'error', 'No se pudo eliminar (¿tiene compras asociadas?)');
  revalidatePath(`/e/${event.slug}`, 'layout');
  back(path, 'ok', 'Eliminado');
}

// ---------------- Sesión ----------------
export async function signIn(fd: FormData) {
  const ip = getClientIp(await headers());
  if (!(await rateLimit(`login:${ip}`, 10, 900))) redirect('/admin/login?error=Demasiados%20intentos.%20Esper%C3%A1%2015%20minutos');
  const parsed = z.object({ email: z.string().email().max(150), password: z.string().min(1).max(200) }).safeParse(Object.fromEntries(fd));
  if (!parsed.success) redirect('/admin/login?error=Credenciales%20inv%C3%A1lidas');
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) redirect('/admin/login?error=Credenciales%20inv%C3%A1lidas'); // mensaje genérico: no revela si el usuario existe
  redirect('/admin');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}

// ---------------- Eventos ----------------
export async function createEvent(fd: FormData) {
  const { supabase } = await requireSuperAdmin();
  const parsed = z.object({
    name: z.string().trim().min(2).max(120),
    slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(60),
  }).safeParse(Object.fromEntries(fd));
  if (!parsed.success) redirect('/admin/nuevo?error=Nombre%20o%20direcci%C3%B3n%20inv%C3%A1lidos%20(solo%20min%C3%BAsculas%2C%20n%C3%BAmeros%20y%20guiones)');
  const { data, error } = await supabase.from('events').insert(parsed.data).select('id').single();
  if (error || !data) redirect(`/admin/nuevo?error=${encodeURIComponent(error?.code === '23505' ? 'Esa dirección ya existe' : 'No se pudo crear')}`);
  redirect(`/admin/${data.id}/config`);
}

// ---------------- Mensajes de contacto ----------------
export async function setMessageStatus(fd: FormData) {
  const eventId = String(fd.get('_eventId'));
  const id = String(fd.get('_id'));
  const status = String(fd.get('status'));
  if (!['nuevo', 'en_proceso', 'resuelto'].includes(status) || !/^[0-9a-f-]{36}$/i.test(id)) redirect('/admin');
  const { supabase } = await requireEventAccess(eventId);
  await supabase.from('contact_messages').update({ status }).eq('id', id).eq('event_id', eventId);
  revalidatePath(`/admin/${eventId}/mensajes`);
}

export async function deleteMessage(fd: FormData) {
  const eventId = String(fd.get('_eventId'));
  const id = String(fd.get('_id'));
  if (!/^[0-9a-f-]{36}$/i.test(id)) redirect('/admin');
  const { supabase } = await requireEventAccess(eventId);
  await supabase.from('contact_messages').delete().eq('id', id).eq('event_id', eventId);
  revalidatePath(`/admin/${eventId}/mensajes`);
}

// ---------------- Bonos ----------------
export async function redeemBono(fd: FormData) {
  const eventId = String(fd.get('_eventId'));
  const path = `/admin/${eventId}/bonos`;
  const code = String(fd.get('code') || '').trim().toUpperCase();
  if (!/^[A-Z0-9]{5}-[A-Z0-9]{5}$/.test(code)) back(path, 'error', 'Código con formato inválido');
  const { supabase, user } = await requireEventAccess(eventId);

  const { data: found } = await supabase.from('bono_purchases').select('id,status,redeemed_at,quantity,buyer_name').eq('event_id', eventId).eq('code', code).maybeSingle();
  if (!found) back(path, 'error', 'Código inexistente');
  if (found.status !== 'approved') back(path, 'error', `La compra no está aprobada (estado: ${found.status})`);
  if (found.redeemed_at) back(path, 'error', `Este bono ya fue canjeado el ${new Date(found.redeemed_at).toLocaleString('es-AR', { timeZone: 'America/Argentina/Cordoba' })}`);

  // Canje atómico: la condición redeemed_at IS NULL evita el doble canje simultáneo
  const { data: updated } = await supabase.from('bono_purchases')
    .update({ redeemed_at: new Date().toISOString(), redeemed_by: user.id })
    .eq('id', found.id).is('redeemed_at', null).select('id');
  if (!updated?.length) back(path, 'error', 'El bono ya fue canjeado');
  revalidatePath(path);
  back(path, 'ok', `✔ Bono válido de ${found.buyer_name} (${found.quantity} unidad/es) canjeado`);
}

// ---------------- Usuarios (solo super admin) ----------------
export async function createUser(fd: FormData) {
  await requireSuperAdmin();
  const parsed = z.object({
    email: z.string().trim().toLowerCase().email().max(150),
    full_name: z.string().trim().min(2).max(100),
    password: z.string().min(12, 'La contraseña debe tener al menos 12 caracteres').max(100),
    role: z.enum(['admin', 'editor']),
  }).safeParse(Object.fromEntries(fd));
  if (!parsed.success) back('/admin/usuarios', 'error', parsed.error.issues[0].message);
  const eventIds = fd.getAll('events').map(String).filter((e) => /^[0-9a-f-]{36}$/i.test(e));

  const db = createAdminClient();
  const { data, error } = await db.auth.admin.createUser({
    email: parsed.data.email, password: parsed.data.password, email_confirm: true, user_metadata: { full_name: parsed.data.full_name },
  });
  if (error || !data.user) back('/admin/usuarios', 'error', 'No se pudo crear el usuario (¿el email ya existe?)');
  if (eventIds.length) await db.from('event_members').insert(eventIds.map((event_id) => ({ event_id, user_id: data.user.id, role: parsed.data.role })));
  revalidatePath('/admin/usuarios');
  back('/admin/usuarios', 'ok', 'Usuario creado');
}

export async function addMembership(fd: FormData) {
  await requireSuperAdmin();
  const p = z.object({ user_id: z.string().uuid(), event_id: z.string().uuid(), role: z.enum(['admin', 'editor']) }).safeParse(Object.fromEntries(fd));
  if (!p.success) back('/admin/usuarios', 'error', 'Datos inválidos');
  await createAdminClient().from('event_members').upsert(p.data);
  revalidatePath('/admin/usuarios');
}

export async function removeMembership(fd: FormData) {
  await requireSuperAdmin();
  const p = z.object({ user_id: z.string().uuid(), event_id: z.string().uuid() }).safeParse(Object.fromEntries(fd));
  if (!p.success) back('/admin/usuarios', 'error', 'Datos inválidos');
  await createAdminClient().from('event_members').delete().eq('user_id', p.data.user_id).eq('event_id', p.data.event_id);
  revalidatePath('/admin/usuarios');
}

export async function deleteUser(fd: FormData) {
  const { user } = await requireSuperAdmin();
  const id = z.string().uuid().safeParse(fd.get('user_id'));
  if (!id.success) back('/admin/usuarios', 'error', 'Datos inválidos');
  if (id.data === user.id) back('/admin/usuarios', 'error', 'No podés eliminar tu propio usuario');
  await createAdminClient().auth.admin.deleteUser(id.data);
  revalidatePath('/admin/usuarios');
  back('/admin/usuarios', 'ok', 'Usuario eliminado');
}
