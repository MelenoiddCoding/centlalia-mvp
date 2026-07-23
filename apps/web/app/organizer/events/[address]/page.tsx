import { ManageEventPage } from '@/components/manage-event-page';

export default async function ManageEventRoute({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;
  return <ManageEventPage eventAddress={address} />;
}
