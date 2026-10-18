import 'server-only';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');
  const { data: profile } = await supabase.from('profiles').select('role,full_name,email').eq('id', user.id).single();
  return { supabase, user, profile, isSuper: profile?.role === 'super_admin' };
}

export async function requireSuperAdmin() {
  const ctx = await requireUser();
  if (!ctx.isSuper) redirect('/admin');
  return ctx;
}

/** Verifica que el usuario pueda editar el evento (autorización real = RLS + esta comprobación). */
export async function requireEventAccess(eventId: string) {
  const ctx = await requireUser();
  if (!/^[0-9a-f-]{36}$/i.test(eventId)) redirect('/admin');
  const { data: allowed } = await ctx.supabase.rpc('can_edit_event', { eid: eventId });
  if (!allowed) redirect('/admin');
  const { data: event } = await ctx.supabase.from('events').select('*').eq('id', eventId).single();
  if (!event) redirect('/admin');
  return { ...ctx, event: event as import('@/lib/types').EventRow };
}
