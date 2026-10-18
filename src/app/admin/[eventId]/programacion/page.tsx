import CrudManager from '@/components/admin/CrudManager';

export default async function Page({ params, searchParams }: { params: Promise<{ eventId: string }>; searchParams: Promise<{ error?: string; ok?: string }> }) {
  const { eventId } = await params;
  return (
    <div className="space-y-4">
      <h2 className="text-xl">Grilla de eventos</h2>
      <CrudManager table="schedule_items" eventId={eventId} searchParams={await searchParams} />
    </div>
  );
}
