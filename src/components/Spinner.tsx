export default function Spinner({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-stone-500" role="status">
      <span className="mr-3 inline-block h-5 w-5 animate-spin rounded-full border-2 border-stone-300 border-t-brand" />{label}
    </div>
  );
}
