import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/session';

type SessionUser = { id: string; email: string | null };

/** Lee la sesión del cookie y verifica la firma; null si no hay sesión válida. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const userId = verifySessionToken(store.get(SESSION_COOKIE)?.value);
  if (!userId) return null;
  return prisma.users.findUnique({ where: { id: userId }, select: { id: true, email: true } });
}

/** Requiere sesión válida (redirige al login si no la hay). */
export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  const profile = await prisma.users.findUnique({
    where: { id: user.id }, select: { id: true, email: true, full_name: true, role: true },
  });
  if (!profile) redirect('/admin/login');
  return { user, profile, isSuper: profile.role === 'super_admin' };
}

export async function requireSuperAdmin() {
  const ctx = await requireUser();
  if (!ctx.isSuper) redirect('/admin');
  return ctx;
}

/** Autorización reemplaza al RLS de Supabase: super admin, o miembro del evento. */
export async function requireEventAccess(eventId: string) {
  const ctx = await requireUser();
  if (!/^[0-9a-f-]{36}$/i.test(eventId)) redirect('/admin');
  const [event, allowed] = await Promise.all([
    prisma.events.findUnique({ where: { id: eventId } }),
    ctx.isSuper
      ? Promise.resolve(true)
      : prisma.event_members.findFirst({ where: { event_id: eventId, user_id: ctx.user.id } }).then(Boolean),
  ]);
  if (!allowed || !event) redirect('/admin');
  return { ...ctx, event };
}
