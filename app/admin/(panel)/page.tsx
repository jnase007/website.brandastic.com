import Link from "next/link";
import { headers } from "next/headers";
import { PHASES, presetLabel } from "@/lib/brand";
import { listClientsWithStats } from "@/lib/queries";
import { formatDate } from "@/lib/text";
import { CopyButton } from "@/components/CopyButton";
import { btnPrimary } from "@/components/Shell";

async function origin() {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "website.brandastic.com";
  const proto = headerList.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

export default async function AdminHome() {
  const clients = await listClientsWithStats();
  const base = await origin();
  const waitingSandy = clients.reduce((sum, client) => sum + client.waitingSandy, 0);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold">Clients</h1>
          <p className="text-gray-500 mt-1">
            {waitingSandy === 0 ? "Nothing is waiting on you." : `${waitingSandy} sent and waiting on you.`}
          </p>
        </div>
        <Link href="/admin/new" className={btnPrimary}>
          New client
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-5 py-8 text-center">
          <p className="font-semibold">No clients yet</p>
          <p className="text-sm text-gray-500 mt-1">Create one to get a private checklist link.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {clients.map((client) => {
            const percent = client.total ? Math.round((client.received / client.total) * 100) : 0;
            const link = `${base}/${client.slug}`;
            return (
              <article key={client.id} className="rounded-2xl border border-gray-200 bg-white px-5 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg font-bold">
                      <Link href={`/admin/clients/${client.slug}`} className="hover:underline">
                        {client.name}
                      </Link>
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {presetLabel(client.preset)} · Created {formatDate(client.createdAt.slice(0, 10))}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <CopyButton text={link} label="Copy client link" className="text-xs font-semibold bg-gray-900 text-white px-3 py-1.5 rounded-full" />
                    <Link href={`/admin/clients/${client.slug}`} className="text-xs font-semibold border border-gray-300 px-3 py-1.5 rounded-full">
                      Open
                    </Link>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-900" style={{ width: `${percent}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {client.received} of {client.total} received · {client.waitingClient} waiting on client · {client.waitingSandy} waiting on you
                    {client.overduePhases.length
                      ? ` · ${client.overduePhases.map((phase) => PHASES.find((entry) => entry.id === phase)?.label ?? `Phase ${phase}`).join(", ")} overdue`
                      : ""}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
