import Flash from '@/components/admin/Flash';
import { signIn } from '../actions';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <div className="mx-auto mt-10 max-w-sm">
      <form action={signIn} className="card space-y-4">
        <h1 className="text-2xl">Ingresar</h1>
        <Flash error={error} />
        <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="username" className="input" /></div>
        <div><label className="label" htmlFor="password">Contraseña</label><input id="password" name="password" type="password" required autoComplete="current-password" className="input" /></div>
        <button className="btn w-full">Entrar</button>
      </form>
    </div>
  );
}
