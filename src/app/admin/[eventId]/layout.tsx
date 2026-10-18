import Link from 'next/link';
import { requireEventAccess } from '@/lib/auth';
import AdminTabs from '@/components/admin/AdminTabs';

export default async function EventAdminLayout({ children, params }: { children: React.ReactNode; params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const { event } = await requireEventAccess(eventId);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Link href="/admin" className="text-sm text-stone-500 hover:underline">← Cambiar de evento</Link>
          <h1 className="text-2xl">{event.name}</h1>
        </div>
        {event.is_published && <Link href={`/e/${event.slug}`} target="_blank" className="btn-secondary">Ver sitio ↗</Link>}
      </div>
      <AdminTabs eventId={eventId} />
      <div>{children}</div>
    </div>
  );
}
