import ClientDetails from "@/components/client/ClientDetails";

export async function generateMetadata({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  return { title: `Client #${clientId.slice(-8).toUpperCase()}` };
}

export default async function ClientDetailPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  return <ClientDetails clientId={clientId} />;
}
