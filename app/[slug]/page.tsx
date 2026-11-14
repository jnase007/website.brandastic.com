import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { PHASES, helpMailto } from "@/lib/brand";
import { currentPhase, dueForPhase, getClientBySlug, listClientItems, listContentPages } from "@/lib/queries";
import { formatDate } from "@/lib/text";
import { ClientChecklist } from "@/components/ClientChecklist";
import { Shell, btnPrimary } from "@/components/Shell";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Your website checklist — Brandastic",
};

export default async function ClientPage({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;
  const client = await getClientBySlug(slug);
  if (!client || client.slug !== slug) notFound();
  const [items, contentPages] = await Promise.all([listClientItems(client.id), listContentPages(client.id)]);
  const received = items.filter((item) => item.status === "received").length;
  const sent = items.filter((item) => item.status === "sent").length;
  const percent = items.length ? Math.round((received / items.length) * 100) : 0;
  const current = currentPhase(items);
  const allDone = items.length > 0 && received === items.length;
  const phases = PHASES.map((phase) => ({
    id: phase.id,
    label: phase.label,
    due: formatDate(dueForPhase(client, phase.id)),
    current: phase.id === current && !allDone,
  }));

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
        <p className="text-gray-500 mt-2">
          This is where we’ll collect all the information, files, and access needed to build your website. Submit items as they become available and upload any files to your shared Google Drive folder. Mark items you completed by clicking “I sent it”.
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
            <div className="h-full bg-[#40B4E5]" style={{ width: `${percent}%` }} />
          </div>
          {sent > 0 ? <p className="text-xs text-gray-400 mt-2">{sent} sent, waiting for Brandastic to review.</p> : null}
        </div>
        {client.driveUrl ? (
          <div className="mt-4">
            <a href={client.driveUrl} target="_blank" rel="noopener noreferrer" className={btnPrimary}>
              Google Drive folder
            </a>
          </div>
        ) : null}
      </div>

      {allDone ? (
        <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4">
          <h2 className="font-bold">You’re all set</h2>
          <p className="text-sm text-gray-600 mt-1">We’ve received everything on this checklist. We’ll be in touch if we need anything else.</p>
        </div>
      ) : null}

      <ClientChecklist
        items={items.map((item) => ({
          id: item.id,
          anchor: item.anchor,
          title: item.title,
          phase: item.phase,
          whatWeNeed: item.whatWeNeed,
          why: item.why,
          steps: item.steps,
          doneLooksLike: item.doneLooksLike,
          allowsResourceLink: item.allowsResourceLink,
          resourceUrl: item.resourceUrl,
          status: item.status,
          note: item.note,
          cardType: item.cardType,
          formSchema: item.formSchema,
          fileFolder: item.fileFolder,
          answers: item.answers,
          files: item.files,
        }))}
        phases={phases}
        current={current}
        contentDocUrl={client.contentDocUrl}
        contentPages={contentPages}
      />
    </Shell>
  );
}
