import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl">🎄</p>
      <h1 className="mt-4 text-3xl">No encontramos esa página</h1>
      <p className="mt-2 text-stone-600">Puede que el evento no esté publicado o que el enlace sea incorrecto.</p>
      <Link to="/" className="btn mt-6">Ver eventos</Link>
    </main>
  );
}
