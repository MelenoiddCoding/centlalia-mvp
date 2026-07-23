import { EventDetailPage } from '@/components/event-detail-page';

export default async function EventPage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;
  return <EventDetailPage eventAddress={address} />;
}
