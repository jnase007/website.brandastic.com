import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { PHASES, helpMailto } from "@/lib/brand";
import { currentPhase, dueForPhase, getClientBySlug, listClientItems } from "@/lib/queries";
import { formatDate } from "@/lib/text";
import { ItemCard } from "@/components/ItemCard";
import { PhaseAccordions } from "@/components/PhaseAccordions";
import { Shell, btnPrimary } from "@/components/Shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Your website checklist — Brandastic",
};

async function origin() {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "website.brandastic.com";
  const proto = headerList.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

export default async function ClientPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const client = await getClientBySlug(slug);
  if (!client) notFound();
  const items = await listClientItems(client.id);
  const received = items.filter((item) => item.status === "received").length;
  const sent = items.filter((item) => item.status === "sent").length;
  const percent = items.length ? Math.round((received / items.length) * 100) : 0;
  const current = currentPhase(items);
  const allDone = items.length > 0 && received === items.length;
  const pageUrl = `${await origin()}/onboarding/${client.slug}`;

  const phases = PHASES.map((phase) => {
    const inPhase = items.filter((item) => item.phase === phase.id);
    const phaseReceived = inPhase.filter((item) => item.status === "received").length;
    const due = formatDate(dueForPhase(client, phase.id));
    const phasePercent = inPhase.length ? Math.round((phaseReceived / inPhase.length) * 100) : 0;
    return {
      id: phase.id,
      anchors: inPhase.map((item) => item.anchor),
      summary: (
        <span className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span>
            <span className="block text-base font-bold text-gray-900">{phase.label}</span>
            <span className="block text-xs text-gray-400 mt-0.5">
              {due ? `Due ${due}` : "Due date to be added"}
              {phase.id === current && !allDone ? " · Current phase" : ""}
            </span>
          </span>
          <span className="sm:text-right">
            <span className="block text-xs font-semibold text-gray-500">
              {inPhase.length ? `${phaseReceived} of ${inPhase.length} received` : "No items"}
            </span>
            <span className="mt-1 block h-1.5 w-full sm:w-28 bg-gray-200 rounded-full overflow-hidden">
              <span className="block h-full bg-gray-900" style={{ width: `${phasePercent}%` }} />
            </span>
          </span>
        </span>
      ),
      body:
        inPhase.length > 0 ? (
          inPhase.map((item) => <ItemCard key={item.id} item={item} mode="client" slug={client.slug} pageUrl={pageUrl} />)
        ) : (
          <p className="text-sm text-gray-500 px-1">Nothing in this phase for your project.</p>
        ),
    };
  });

  return (
    <Shell
      actions={
        <a href={helpMailto(client.name)} className="text-sm font-semibold text-gray-600 hover:text-gray-900">
          Need help? Email Sandy
        </a>
      }
    >
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold">Welcome, {client.name}</h1>
        <p className="text-gray-500 mt-2 max-w-xl">
          Send each item when you have it. Upload files to your Google Drive folder. For access items, “I sent it” means the invite is sent.
        </p>
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-1.5">
            <span>
              {received} of {items.length} received
            </span>
            <span>{percent}%</span>
          </div>
          <div
            className="h-1.5 bg-gray-200 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={received}
            aria-valuemin={0}
            aria-valuemax={items.length}
            aria-label="Overall progress"
          >
            <div className="h-full bg-gray-900" style={{ width: `${percent}%` }} />
          </div>
          {sent > 0 ? <p className="text-xs text-gray-400 mt-2">{sent} sent, waiting for Brandastic to review.</p> : null}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {client.driveUrl ? (
            <a href={client.driveUrl} target="_blank" rel="noopener noreferrer" className={btnPrimary}>
              Google Drive folder
            </a>
          ) : null}
          <a href={helpMailto(client.name)} className="inline-flex items-center justify-center text-sm font-semibold text-gray-900 bg-white border border-gray-300 px-4 py-2.5 rounded-full hover:bg-gray-50">
            Need help? Email Sandy
          </a>
        </div>
      </div>

      {allDone ? (
        <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4">
          <h2 className="font-bold">You’re all set</h2>
          <p className="text-sm text-gray-600 mt-1">We’ve received everything on this checklist. We’ll be in touch if we need anything else.</p>
        </div>
      ) : null}

      <PhaseAccordions current={current} phases={phases} />
    </Shell>
  );
}
