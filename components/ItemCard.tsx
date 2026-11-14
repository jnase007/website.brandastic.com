import { markNeedsChanges, markReceived, markSent, removeClientItem, updateResourceUrl } from "@/lib/actions";
import { formatTimestamp } from "@/lib/text";
import type { ClientItem } from "@/lib/types";
import { AnswerSummary, FileSummary, MenuSummary } from "@/components/AnswerSummary";
import { ConfirmForm } from "@/components/ConfirmForm";
import { CopyButton } from "@/components/CopyButton";
import { Paragraphs, Steps } from "@/components/RichText";
import { btnGhost, btnPrimary, fieldClass } from "@/components/Shell";

const STATUS_LABEL = {
  not_started: "Not started",
  sent: "Sent by client",
  received: "Received",
  needs_changes: "Needs changes",
} as const;

const STATUS_CLASS = {
  not_started: "bg-gray-100 text-gray-600",
  sent: "bg-amber-50 text-amber-800 border border-amber-100",
  received: "bg-emerald-50 text-emerald-800 border border-emerald-100",
  needs_changes: "bg-rose-50 text-rose-800 border border-rose-100",
} as const;

export function ItemCard({
  item,
  mode,
  slug,
  pageUrl,
}: {
  item: ClientItem;
  mode: "client" | "admin";
  slug: string;
  pageUrl: string;
}) {
  const sentLabel = item.sentAt ? formatTimestamp(item.sentAt) : null;
  const showSend = mode === "client" && (item.status === "not_started" || item.status === "needs_changes");

  return (
    <article id={item.anchor} className="item-card bg-white rounded-2xl border border-gray-200 p-5 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold">
            <a href={`#${item.anchor}`} className="hover:underline">
              {item.title}
            </a>
          </h2>
          {sentLabel && item.status !== "not_started" ? (
            <p className="text-xs text-gray-400 mt-1">Sent {sentLabel}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_CLASS[item.status]}`}>
            {STATUS_LABEL[item.status]}
          </span>
          <CopyButton
            text={`${pageUrl}#${item.anchor}`}
            label="Copy link"
            className="text-xs font-semibold bg-gray-900 text-white px-3 py-1.5 rounded-full"
          />
        </div>
      </div>

      <div className="space-y-5">
        <section>
          <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide mb-1.5">What we need</p>
          <Paragraphs text={item.whatWeNeed} />
        </section>
        <section>
          <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide mb-1.5">Why we need it</p>
          <Paragraphs text={item.why} />
        </section>

        {item.allowsResourceLink ? (
          item.resourceUrl ? (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">Folder or doc for this item</p>
                <a href={item.resourceUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-blue-600 underline break-all">
                  Open the link
                </a>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Brandastic will add the folder or doc link on this card.</p>
          )
        ) : null}

        {item.steps.length ? (
          <section>
            <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide mb-2">Steps</p>
            <Steps steps={item.steps} />
          </section>
        ) : null}

        <section>
          <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide mb-1.5">Done looks like</p>
          <Paragraphs text={item.doneLooksLike} />
        </section>
      </div>

      {item.status === "needs_changes" && item.note ? (
        <div className="mt-5 p-4 bg-rose-50 border border-rose-100 rounded-xl">
          <p className="text-[10px] uppercase font-semibold tracking-wide text-rose-700">From Sandy</p>
          <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{item.note}</p>
        </div>
      ) : null}

      {mode === "admin" && item.note && item.status === "sent" ? (
        <p className="mt-4 text-sm text-gray-500">Last note: {item.note}</p>
      ) : null}

      {showSend ? (
        <form action={async (data) => { await markSent(data); }} className="mt-6">
          <input type="hidden" name="itemId" value={item.id} />
          <button type="submit" className={btnPrimary}>
            I sent it
          </button>
        </form>
      ) : null}

      {mode === "client" && item.status === "sent" ? (
        <p className="mt-6 text-sm text-gray-500">Thanks. We’ll review this and update the card.</p>
      ) : null}

      {mode === "admin" ? (
        <div className="mt-6 pt-5 border-t border-gray-100 space-y-4">
          {item.allowsResourceLink ? (
            <form action={updateResourceUrl} className="flex flex-col sm:flex-row gap-2">
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="itemId" value={item.id} />
              <input type="hidden" name="anchor" value={item.anchor} />
              <input
                name="resourceUrl"
                defaultValue={item.resourceUrl ?? ""}
                placeholder="Google Drive folder or Google Doc link"
                className={fieldClass}
              />
              <button type="submit" className={btnGhost}>
                Save link
              </button>
            </form>
          ) : null}

          {mode === "admin" && item.anchor === "menu" ? <MenuSummary answers={item.answers} /> : null}
          {mode === "admin" && item.anchor !== "menu" && item.cardType === "form" && item.formSchema ? (
            <AnswerSummary schema={item.formSchema} answers={item.answers} />
          ) : null}
          {mode === "admin" && item.cardType === "file" ? <FileSummary files={item.files} /> : null}
          {item.anchor === "website-content" ? (
            <p className="text-sm text-gray-500">Set each page to Received or Needs changes in Website pages above. The card is Received only when every page is.</p>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
              {item.status !== "received" ? (
                <form action={markReceived}>
                  <input type="hidden" name="itemId" value={item.id} />
                  <button type="submit" className={btnPrimary}>
                    Received
                  </button>
                </form>
              ) : (
                <p className="text-sm font-semibold text-emerald-700 py-2">Received</p>
              )}
              <form action={markNeedsChanges} className="flex-1 flex flex-col sm:flex-row gap-2">
                <input type="hidden" name="itemId" value={item.id} />
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="anchor" value={item.anchor} />
                <input
                  name="note"
                  defaultValue={item.status === "needs_changes" ? item.note ?? "" : ""}
                  placeholder="What should the client change?"
                  className={fieldClass}
                />
                <button type="submit" className={btnGhost}>
                  Needs changes
                </button>
              </form>
            </div>
          )}

          <ConfirmForm action={removeClientItem} message={`Remove “${item.title}” from this client?`}>
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="itemId" value={item.id} />
            <button type="submit" className="text-xs font-semibold text-gray-400 hover:text-gray-900">
              Remove item
            </button>
          </ConfirmForm>
        </div>
      ) : null}
    </article>
  );
}
