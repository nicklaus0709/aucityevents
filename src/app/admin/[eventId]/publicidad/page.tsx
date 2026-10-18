import CrudManager from '@/components/admin/CrudManager';

export default async function Page({ params, searchParams }: { params: Promise<{ eventId: string }>; searchParams: Promise<{ error?: string; ok?: string }> }) {
  const { eventId } = await params;
  return (
    <div className="space-y-4">
      <h2 className="text-xl">Publicidad de comercios</h2>
      <CrudManager table="ads" eventId={eventId} searchParams={await searchParams} />
    </div>
  );
}
