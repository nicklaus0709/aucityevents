/** Mensajes de resultado (vienen por querystring; React escapa el texto). */
export default function Flash({ error, ok }: { error?: string; ok?: string }) {
  if (error) return <p role="alert" className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>;
  if (ok) return <p role="status" className="rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800">{ok}</p>;
  return null;
}
