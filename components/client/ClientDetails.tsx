import { Archive, Building2, FolderOpen, Receipt, Eye } from "lucide-react";
import Link from "next/link";
import { getClientById } from "@/app/actions/clientActions";
import { EditClientDialog } from "./EditClientForm";
import ClientDocumentList from "./ClientDocumentList";
import ClientAnalyticsWidget from "./ClientAnalyticsWidget";

export default async function ClientDetails({ clientId }: { clientId: string }) {
  const client = await getClientById(clientId);

  if (!client) {
    return (
      <div className="px-margin-mobile md:px-margin-desktop py-8 max-w-container-max mx-auto w-full">
        <nav className="font-body-md text-body-md text-[#46464d] mb-6">
          <Link href="/clients" className="hover:text-[#D4AF37] transition-colors">Clients</Link>
          <span className="mx-3">/</span>
          <span className="text-[#0A1128] font-semibold">Not Found</span>
        </nav>
        <div className="bg-[#f8f9ff] border border-[#c6c6ce]/30 p-8 text-center">
          <p className="font-body-md text-body-md text-[#46464d]">Client not found.</p>
          <Link href="/clients" className="inline-block mt-4 text-[#D4AF37] font-semibold hover:underline">
            Back to directory
          </Link>
        </div>
      </div>
    );
  }

  const activeMatters = client.matters.filter(m => m.status === 'Active');
  const archivedMatters = client.matters.filter(m => m.status !== 'Active');

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-8 max-w-container-max mx-auto w-full">
      <nav className="font-body-md text-body-md text-[#46464d] mb-6">
        <Link href="/clients" className="hover:text-[#D4AF37] transition-colors">Clients</Link>
        <span className="mx-3">/</span>
        <span className="text-[#0A1128] font-semibold">{client.name}</span>
      </nav>

      <section className="mb-8 bg-white border border-[#c6c6ce]/50 p-6 md:p-8 lg:p-10">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
          <div className="flex-1">
            <h1 className="font-headline-md text-headline-md text-[#0A1128] mb-3">{client.name}</h1>
            <div className="flex flex-wrap items-center gap-4 font-body-md text-body-md text-[#46464d]">
              {client.industry && (
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-[#D4AF37]" /> {client.industry}
                </span>
              )}
              <span className="w-px h-4 bg-[#c6c6ce]" />
              <span>ID: {client.id.slice(-8).toUpperCase()}</span>
              {client.contactName && (
                <>
                  <span className="w-px h-4 bg-[#c6c6ce]" />
                  <span>{client.contactName}{client.contactTitle ? ` — ${client.contactTitle}` : ''}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-start gap-3 shrink-0">
            <EditClientDialog client={client} />
            <div className="flex gap-4">
              {client.email && (
                <div className="bg-[#f8f9ff] border border-[#c6c6ce]/30 px-5 py-3 text-center min-w-[120px]">
                  <p className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider">Email</p>
                  <p className="font-body-md text-body-md text-[#0A1128] mt-1">{client.email}</p>
                </div>
              )}
              {client.phone && (
                <div className="bg-[#f8f9ff] border border-[#c6c6ce]/30 px-5 py-3 text-center min-w-[120px]">
                  <p className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider">Phone</p>
                  <p className="font-body-md text-body-md text-[#0A1128] mt-1">{client.phone}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-[#c6c6ce]/30">
          <div className="bg-[#f8f9ff] border border-[#c6c6ce]/30 px-6 py-4 text-center min-w-[130px]">
            <p className="font-label-sm text-label-sm text-[#46464d] uppercase tracking-wider">Active Matters</p>
            <p className="font-headline-sm text-headline-sm text-[#0A1128] font-semibold mt-1">{client.activeMatters}</p>
          </div>
          <div className="bg-[#0A1128] px-6 py-4 text-center min-w-[130px]">
            <p className="font-label-sm text-label-sm text-[#D4AF37] uppercase tracking-wider">Invoiced</p>
            <p className="font-headline-sm text-headline-sm text-white font-semibold mt-1">${client.totalInvoiced.toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <Link href={`/billing?clientId=${clientId}`} className="flex items-center gap-2 px-5 py-3 border border-[#c6c6ce]/50 text-[#0A1128] font-label-sm text-label-sm uppercase tracking-wider hover:bg-[#f8f9ff] transition-colors">
              <Eye size={16} /> View Invoices
            </Link>
            <Link href={`/billing/new?clientId=${clientId}`} className="flex items-center gap-2 px-5 py-3 bg-[#0A1128] text-white font-label-sm text-label-sm uppercase tracking-wider hover:bg-[#162244] transition-colors">
              <Receipt size={16} /> Create Invoice
            </Link>
          </div>
        </div>
      </section>

      {activeMatters.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-headline-sm text-headline-sm text-[#0A1128] flex items-center gap-3">
              <FolderOpen className="h-5 w-5 text-[#D4AF37]" /> Active Matters
            </h2>
            <Link
              href={`/matters/new?clientId=${clientId}&clientName=${encodeURIComponent(client.name)}`}
              className="bg-[#0A1128] text-white px-5 py-2 font-label-sm text-label-sm uppercase tracking-wider hover:bg-[#162244] transition-colors"
            >
              + New Matter
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {activeMatters.map(m => (
              <Link key={m.id} href={`/matters/${m.id}`}
                className="block bg-white border border-[#c6c6ce]/50 p-5 hover:border-[#D4AF37]/50 hover:shadow-[0_4px_16px_rgba(10,17,40,0.06)] transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-block bg-[#d9f0d9] text-[#1a6b1a] text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">Active</span>
                  <span className="text-[10px] font-mono text-[#7c839f]">{m.matterCode || m.id.slice(-8).toUpperCase()}</span>
                </div>
                <h3 className="font-body-lg text-body-lg text-[#0A1128] font-semibold mb-1">{m.title}</h3>
                <p className="font-body-md text-body-md text-[#46464d] text-[13px] mb-3">{m.practiceArea || ''}</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#141a32] flex items-center justify-center rounded-none">
                    <span className="text-[#ffe088] font-bold text-[10px]">
                      {m.leadAttorneyName ? m.leadAttorneyName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : 'NA'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-[#7c839f] uppercase tracking-widest">Lead Attorney</p>
                    <p className="text-[12px] font-semibold text-[#0A1128] truncate">{m.leadAttorneyName || '—'}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#c6c6ce]/20 text-[11px] text-[#76767e]">
                  <span>{m.activityCount} activit{m.activityCount !== 1 ? 'ies' : 'y'}</span>
                  <span className="font-semibold text-[#0A1128]">${m.invoiceTotal.toLocaleString()}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {archivedMatters.length > 0 && (
        <section className="mb-10">
          <h2 className="font-headline-sm text-headline-sm text-[#0A1128] mb-5 flex items-center gap-3">
            <Archive className="h-5 w-5 text-[#46464d]" /> Archived Matters
          </h2>
          <div className="bg-white border border-[#c6c6ce]/50 overflow-hidden">
            <div className="grid grid-cols-[160px_1fr_140px_100px] bg-[#f8f9ff] px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[#46464d]">
              <span>Code</span>
              <span>Name</span>
              <span>Status</span>
              <span className="text-right">Invoiced</span>
            </div>
            {archivedMatters.map(m => (
              <Link key={m.id} href={`/matters/${m.id}`}
                className="grid grid-cols-[160px_1fr_140px_100px] items-center px-4 py-3 border-t border-[#c6c6ce]/20 text-[13px] text-[#0A1128] hover:bg-[#f8f9ff] transition-colors">
                <span className="font-mono text-[#76767e]">{m.matterCode || m.id.slice(-6)}</span>
                <span>{m.title}</span>
                <span className="capitalize">{m.status.toLowerCase()}</span>
                <span className="text-right">${m.invoiceTotal.toLocaleString()}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2">
          <ClientDocumentList clientId={clientId} documents={client.clientDocuments || []} />
        </div>
        <div className="lg:col-span-1">
          <ClientAnalyticsWidget matters={client.matters} />
        </div>
      </div>

      {client.notes && (
        <section className="mb-10">
          <h2 className="font-headline-sm text-headline-sm text-[#0A1128] mb-3">Notes</h2>
          <div className="bg-white border border-[#c6c6ce]/50 p-5 font-body-md text-body-md text-[#46464d] whitespace-pre-wrap">
            {client.notes}
          </div>
        </section>
      )}
    </div>
  );
}
