import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PHASES, presetLabel } from "@/lib/brand";
import { addContentPage, markPageNeedsChanges, markPageReceived, removeContentPage, saveContentDocUrl, updateClient } from "@/lib/actions";
import { currentPhase, dueForPhase, getClientBySlug, listClientItems, listContentPages, listLibrary } from "@/lib/queries";
import { formatDate } from "@/lib/text";
import { AddItemForm } from "@/components/AddItemForm";
import { CopyButton } from "@/components/CopyButton";
import { StatusFlag } from "@/components/ClientChecklist";
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
  searchParams: Promise<{ created?: string; error?: string; tabs?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const client = await getClientBySlug(slug);
  if (!client) notFound();
  const [items, library, contentPages] = await Promise.all([
    listClientItems(client.id),
    listLibrary(),
    listContentPages(client.id),
  ]);
  const hasWebsiteContent = items.some((item) => item.anchor === "website-content");
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
      {query.tabs ? (
        <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Pulled {query.tabs} {query.tabs === "1" ? "page" : "pages"} from the document tabs.
        </p>
      ) : null}

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

      {hasWebsiteContent ? (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
          <div>
            <h2 className="text-lg font-bold">Website pages</h2>
            <p className="text-sm text-gray-500 mt-1">Saving the content doc adds a page for each tab. Share the doc so anyone with the link can view it. The Website Content card is Received only when every page is.</p>
          </div>
          <form action={saveContentDocUrl} className="flex flex-col sm:flex-row gap-2">
            <input type="hidden" name="slug" value={client.slug} />
            <input
              name="contentDocUrl"
              type="url"
              defaultValue={client.contentDocUrl ?? ""}
              placeholder="Content doc URL"
              className={fieldClass}
            />
            <button type="submit" className={btnGhost}>
              Save and pull pages
            </button>
          </form>
          <form action={addContentPage} className="flex flex-col sm:flex-row gap-2">
            <input type="hidden" name="slug" value={client.slug} />
            <input name="title" placeholder="Page name, such as About" className={fieldClass} />
            <button type="submit" className={btnGhost}>
              Add page
            </button>
          </form>
          {contentPages.length === 0 ? (
            <p className="text-sm text-gray-500">No pages yet.</p>
          ) : (
            <ul className="space-y-3">
              {contentPages.map((page) => (
                <li key={page.id} className="rounded-xl border border-gray-200 p-4 space-y-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-bold">{page.title}</p>
                    <StatusFlag status={page.status} />
                  </div>
                  {page.choice ? (
                    <p className="text-xs text-gray-500">{page.choice === "in_doc" ? "My content is in the doc" : "Use my current site"}</p>
                  ) : null}
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <form action={markPageReceived}>
                      <input type="hidden" name="slug" value={client.slug} />
                      <input type="hidden" name="pageId" value={page.id} />
                      <button type="submit" className={btnPrimary}>
                        Received
                      </button>
                    </form>
                    <form action={markPageNeedsChanges} className="flex-1 flex flex-col sm:flex-row gap-2">
                      <input type="hidden" name="slug" value={client.slug} />
                      <input type="hidden" name="pageId" value={page.id} />
                      <input
                        name="note"
                        defaultValue={page.status === "needs_changes" ? page.note ?? "" : ""}
                        placeholder="What should the client change?"
                        className={fieldClass}
                      />
                      <button type="submit" className={btnGhost}>
                        Needs changes
                      </button>
                    </form>
                  </div>
                  <form action={removeContentPage}>
                    <input type="hidden" name="slug" value={client.slug} />
                    <input type="hidden" name="pageId" value={page.id} />
                    <button type="submit" className="text-xs font-semibold text-gray-400 hover:text-gray-900">
                      Remove page
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      <AddItemForm slug={client.slug} items={available} />
      <PhaseAccordions current={current} phases={phases} />
    </div>
  );
}
