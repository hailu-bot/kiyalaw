import ClientDirectoryGrid from "@/components/client/ClientDirectoryGrid";
import { getClients } from "@/app/actions/clientActions";

export const metadata = { title: "Client Directory" };

export default async function ClientsPage() {
  let clients: Awaited<ReturnType<typeof getClients>> = [];
  try {
    clients = await getClients();
  } catch (e) {
    console.error("ClientsPage: Failed to load clients, using empty defaults", e);
  }

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-8 max-w-container-max mx-auto w-full">
      <ClientDirectoryGrid clients={clients} />
    </div>
  );
}
