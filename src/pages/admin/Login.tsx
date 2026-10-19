import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { DEMO } from '@/lib/base44';
import Flash from '@/components/admin/Flash';

export default function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (DEMO || user) return <Navigate to="/admin" replace />;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    setError('');
    try {
      await login(String(fd.get('email')).trim(), String(fd.get('password')));
      nav('/admin', { replace: true });
    } catch {
      setError('Credenciales inválidas'); // mensaje genérico: no revela si el usuario existe
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100 px-4">
      <form onSubmit={onSubmit} className="card w-full max-w-sm space-y-4 !p-7">
        <h1 className="text-2xl">Ingresar</h1>
        <Flash error={error} />
        <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="username" className="input" /></div>
        <div><label className="label" htmlFor="password">Contraseña</label><input id="password" name="password" type="password" required autoComplete="current-password" className="input" /></div>
        <button className="btn w-full" disabled={busy}>{busy ? 'Ingresando…' : 'Entrar'}</button>
        <p className="text-center text-sm"><Link to="/" className="text-stone-500 hover:underline">← Volver al sitio</Link></p>
      </form>
    </div>
  );
}
