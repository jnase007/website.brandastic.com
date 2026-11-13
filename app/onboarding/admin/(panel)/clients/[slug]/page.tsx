import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PHASES, presetLabel } from "@/lib/brand";
import { updateClient } from "@/lib/actions";
import { currentPhase, dueForPhase, getClientBySlug, listClientItems, listLibrary } from "@/lib/queries";
import { formatDate } from "@/lib/text";
import { AddItemForm } from "@/components/AddItemForm";
import { CopyButton } from "@/components/CopyButton";
import { ItemCard } from "@/components/ItemCard";
import { PhaseAccordions } from "@/components/PhaseAccordions";
import { btnGhost, btnPrimary, fieldClass } from "@/components/Shell";

async function origin() {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "website.brandastic.com";
  const proto = headerList.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

export default async function AdminClientPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ created?: string; error?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const client = await getClientBySlug(slug);
  if (!client) notFound();
  const [items, library] = await Promise.all([listClientItems(client.id), listLibrary()]);
  const assigned = new Set(items.map((item) => item.libraryItemId));
  const available = library.filter((item) => !assigned.has(item.id));
  const pageUrl = `${await origin()}/onboarding/${client.slug}`;
  const current = currentPhase(items);
  const received = items.filter((item) => item.status === "received").length;

  const phases = PHASES.map((phase) => {
    const inPhase = items.filter((item) => item.phase === phase.id);
    const phaseReceived = inPhase.filter((item) => item.status === "received").length;
    const due = formatDate(dueForPhase(client, phase.id));
    return {
      id: phase.id,
      anchors: inPhase.map((item) => item.anchor),
      summary: (
        <span className="flex items-center justify-between gap-3">
          <span>
            <span className="block text-base font-bold">{phase.label}</span>
            <span className="block text-xs text-gray-400 mt-0.5">{due ? `Due ${due}` : "No due date"}</span>
          </span>
          <span className="text-xs font-semibold text-gray-500">
            {phaseReceived} of {inPhase.length}
          </span>
        </span>
      ),
      body: inPhase.map((item) => <ItemCard key={item.id} item={item} mode="admin" slug={client.slug} pageUrl={pageUrl} />),
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{presetLabel(client.preset)}</p>
        <h1 className="text-3xl font-extrabold mt-1">{client.name}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {received} of {items.length} received
        </p>
      </div>

      {query.created ? (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4">
          <p className="font-semibold">Client link is ready</p>
          <p className="text-sm break-all mt-1">{pageUrl}</p>
          <CopyButton text={pageUrl} className={`${btnPrimary} mt-3`} />
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <CopyButton text={pageUrl} className={btnPrimary} />
          <Link href={`/onboarding/${client.slug}`} className={btnGhost} target="_blank">
            View as client
          </Link>
        </div>
      )}

      {query.error ? <p className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800">{query.error}</p> : null}

      <form action={updateClient} className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3">
        <input type="hidden" name="slug" value={client.slug} />
        <label className="block">
          <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">Client name</span>
          <input name="name" defaultValue={client.name} className={`${fieldClass} mt-1.5`} />
        </label>
        <label className="block">
          <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">Google Drive folder</span>
          <input name="driveUrl" type="url" defaultValue={client.driveUrl ?? ""} placeholder="https://" className={`${fieldClass} mt-1.5`} />
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">Phase 1 due</span>
            <input name="due1" type="date" defaultValue={client.duePhase1 ?? ""} className={`${fieldClass} mt-1.5`} />
          </label>
          <label className="block">
            <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">Phase 2 due</span>
            <input name="due2" type="date" defaultValue={client.duePhase2 ?? ""} className={`${fieldClass} mt-1.5`} />
          </label>
          <label className="block">
            <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">Phase 3 due</span>
            <input name="due3" type="date" defaultValue={client.duePhase3 ?? ""} className={`${fieldClass} mt-1.5`} />
          </label>
        </div>
        <button type="submit" className={btnGhost}>
          Save client details
        </button>
      </form>

      <AddItemForm slug={client.slug} items={available} />
      <PhaseAccordions current={current} phases={phases} />
    </div>
  );
}
