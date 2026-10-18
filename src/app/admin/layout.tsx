import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { signOut } from './actions';

export const metadata: Metadata = { title: 'Administración', robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <div className="min-h-screen bg-stone-100">
      <header className="no-print border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/admin" className="font-extrabold text-stone-900">⚙ Panel · Eventos Capioví</Link>
          {user && (
            <form action={signOut} className="flex items-center gap-3 text-sm">
              <span className="hidden text-stone-500 sm:inline">{user.email}</span>
              <button className="btn-secondary !py-1.5">Salir</button>
            </form>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
