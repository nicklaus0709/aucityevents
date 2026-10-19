import { Link, Navigate, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DEMO } from '@/lib/base44';
import Spinner from '@/components/Spinner';

/** Protege todo /admin: requiere sesión y rol admin de Base44. */
export default function AdminShell() {
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    document.title = 'Administración';
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => { meta.remove(); };
  }, []);

  if (DEMO) {
    return (
      <main className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl">Modo demo</h1>
        <p className="mt-3 text-stone-600">El panel de administración se activa al conectar la app de Base44 (variable <code>VITE_BASE44_APP_ID</code>). Por ahora solo se muestra el sitio público con datos de prueba.</p>
        <Link to="/" className="btn mt-6">Ver el sitio</Link>
      </main>
    );
  }
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-screen bg-stone-100">
      <header className="no-print border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/admin" className="font-extrabold text-stone-900">⚙ Panel · Eventos Capioví</Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-stone-500 sm:inline">{user.email}</span>
            <button className="btn-secondary !py-1.5" onClick={() => void logout()}>Salir</button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {user.role === 'admin' ? <Outlet /> : (
          <div className="card mx-auto mt-10 max-w-md text-center">
            <h1 className="text-xl">Sin permisos</h1>
            <p className="mt-2 text-sm text-stone-600">Tu usuario no es administrador. Pedile a la Municipalidad que te asigne el rol de administrador.</p>
          </div>
        )}
      </main>
    </div>
  );
}
