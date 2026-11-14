"use client";

import { useEffect, useLayoutEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { chooseContentPage, markSent } from "@/lib/actions";
import type { Answers, CardType, ContentPage, FormSchema, ItemFile, ItemStatus, StepBlock } from "@/lib/types";
import { CardForm, FileCard } from "@/components/CardForm";
import { MenuForm } from "@/components/MenuForm";
import { flushCardSave } from "@/components/useAutosave";
import { CopyButton } from "@/components/CopyButton";
import { GuideSteps, Paragraphs } from "@/components/RichText";
import { btnGhost, btnPrimary } from "@/components/Shell";

export type ChecklistItem = {
  id: string;
  anchor: string;
  title: string;
  phase: 1 | 2 | 3;
  whatWeNeed: string;
  why: string;
  steps: StepBlock[];
  doneLooksLike: string;
  allowsResourceLink: boolean;
  resourceUrl: string | null;
  status: ItemStatus;
  note: string | null;
  cardType: CardType;
  formSchema: FormSchema | null;
  fileFolder: string | null;
  answers: Answers;
  files: ItemFile[];
};

export type ChecklistPhase = {
  id: 1 | 2 | 3;
  label: string;
  due: string | null;
  current: boolean;
};

const FLAG: Record<ItemStatus, { label: string; className: string; check?: boolean }> = {
  not_started: { label: "Not started", className: "bg-gray-100 text-gray-600" },
  sent: { label: "Sent", className: "bg-blue-50 text-blue-700" },
  needs_changes: { label: "Needs changes", className: "bg-orange-50 text-orange-800" },
  received: { label: "Received", className: "bg-emerald-50 text-emerald-700", check: true },
};

export function StatusFlag({ status }: { status: ItemStatus }) {
  const flag = FLAG[status];
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${flag.className}`}>
      {flag.check ? (
        <svg viewBox="0 0 16 16" className="w-3 h-3" aria-hidden="true">
          <path
            d="M3.5 8.5 6.5 11.5 12.5 4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
      {flag.label}
    </span>
  );
}

function itemText(item: ChecklistItem) {
  return [item.whatWeNeed, item.why, item.doneLooksLike, ...item.steps.map((step) => step.text)].join("\n");
}

function copyRows(item: ChecklistItem) {
  const text = itemText(item);
  const rows: { label: string; value: string }[] = [];
  const emails = new Set<string>();
  for (const match of text.matchAll(/[A-Za-z0-9._%+-]+@brandastic\.com/gi)) {
    emails.add(match[0].toLowerCase());
  }
  if (/username\s+brandastic/i.test(text)) {
    rows.push({ label: "Username", value: "brandastic" });
  }
  for (const email of emails) {
    rows.push({
      label: email.startsWith("dev@") ? "Login email for this step" : "Invite email for this step",
      value: email,
    });
  }
  return rows;
}

function readHash() {
  return decodeURIComponent(window.location.hash.replace(/^#/, ""));
}

export function ClientChecklist({
  items,
  phases,
  current,
  contentDocUrl,
  contentPages,
}: {
  items: ChecklistItem[];
  phases: ChecklistPhase[];
  current: number;
  contentDocUrl: string | null;
  contentPages: ContentPage[];
}) {
  const numbered = items.map((item, index) => ({
    ...item,
    number: String(index + 1).padStart(2, "0"),
  }));
  const [selected, setSelected] = useState("");
  const [open, setOpen] = useState<number[]>([current]);
  const selectedRef = useRef("");

  useLayoutEffect(() => {
    const apply = (fromHistory: boolean) => {
      const hash = readHash();
      if (!hash && selectedRef.current && !fromHistory) {
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${selectedRef.current}`);
        return;
      }
      const changed = hash !== selectedRef.current;
      selectedRef.current = hash;
      setSelected(hash);
      if (!hash) {
        if (fromHistory) window.scrollTo(0, 0);
        return;
      }
      const match = numbered.find((item) => item.anchor === hash);
      if (!match) return;
      setOpen((prev) => (prev.includes(match.phase) ? prev : [...prev, match.phase]));
      if (changed) window.scrollTo(0, 0);
    };
    const onHistory = () => apply(true);
    apply(false);
    window.addEventListener("hashchange", onHistory);
    window.addEventListener("popstate", onHistory);
    return () => {
      window.removeEventListener("hashchange", onHistory);
      window.removeEventListener("popstate", onHistory);
    };
    // numbered is derived from items; re-sync after a status update so the open phase stays put.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const active = numbered.find((item) => item.anchor === selected) ?? null;

  if (active) {
    const index = numbered.findIndex((item) => item.anchor === active.anchor);
    const previous = index > 0 ? numbered[index - 1] : null;
    const next = index < numbered.length - 1 ? numbered[index + 1] : null;
    return (
      <ItemDetail
        item={active}
        previous={previous}
        next={next}
        contentDocUrl={contentDocUrl}
        contentPages={contentPages}
        onBack={() => {
          selectedRef.current = "";
          const url = window.location.pathname + window.location.search;
          window.history.pushState(null, "", url);
          setSelected("");
          window.scrollTo(0, 0);
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {phases.map((phase) => {
        const inPhase = numbered
          .filter((item) => item.phase === phase.id)
          .sort((a, b) => Number(a.status === "received" || a.status === "sent") - Number(b.status === "received" || b.status === "sent"));
        if (!inPhase.length) return null;
        const received = inPhase.filter((item) => item.status === "received").length;
        const percent = inPhase.length ? Math.round((received / inPhase.length) * 100) : 0;
        const isOpen = open.includes(phase.id);
        return (
          <section key={phase.id}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() =>
                setOpen((prev) => (prev.includes(phase.id) ? prev.filter((id) => id !== phase.id) : [...prev, phase.id]))
              }
              className="w-full text-left rounded-2xl border border-[#40B4E5]/40 bg-[#E8F7FC] px-5 py-4 hover:border-[#40B4E5] transition"
            >
              <span className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  <span className="block text-base font-bold text-gray-900">{phase.label}</span>
                  <span className="block text-xs text-gray-400 mt-0.5">
                    {phase.due ? `Due ${phase.due}` : "Due date to be added"}
                    {phase.current ? " · Current phase" : ""}
                  </span>
                </span>
                <span className="sm:text-right">
                  <span className="block text-xs font-semibold text-gray-500">
                    {inPhase.length ? `${received} of ${inPhase.length} received` : "No items"}
                  </span>
                  <span className="mt-1 block h-1.5 w-full sm:w-28 bg-gray-200 rounded-full overflow-hidden">
                    <span className="block h-full bg-[#40B4E5]" style={{ width: `${percent}%` }} />
                  </span>
                </span>
              </span>
            </button>
            {isOpen ? (
              <div className="mt-3 grid grid-cols-1 lg:grid-cols-3 gap-3">
                {inPhase.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.anchor}`}
                    className="text-left rounded-2xl border border-gray-200 bg-white px-5 py-4 hover:border-gray-900 hover:shadow-sm transition group"
                  >
                    <div className="text-xs font-semibold text-gray-400 mb-1">{item.number}</div>
                    <div className="text-base font-bold text-gray-900">{item.title}</div>
                    <div className="mt-2">
                      <StatusFlag status={item.status} />
                    </div>
                    <div className="text-xs text-gray-400 mt-2">View steps →</div>
                  </a>
                ))}
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

function WebsitePages({ contentDocUrl, pages }: { contentDocUrl: string | null; pages: ContentPage[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <section className="space-y-3">
      {contentDocUrl ? (
        <a href={contentDocUrl} target="_blank" rel="noopener noreferrer" className={btnPrimary}>
          Open your content doc
        </a>
      ) : (
        <p className="text-sm text-gray-500">Brandastic will add the content doc link here.</p>
      )}
      {pages.length === 0 ? (
        <p className="text-sm text-gray-500">Your pages will show here once the content doc tabs are added.</p>
      ) : (
        <ul className="space-y-3">
          {pages.map((page) => (
            <li key={page.id} className="rounded-xl border border-gray-200 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <p className="text-sm font-bold text-gray-900">{page.title}</p>
                <StatusFlag status={page.status} />
              </div>
              {page.status === "needs_changes" && page.note ? (
                <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{page.note}</p>
              ) : null}
              {page.status === "received" ? (
                <p className="mt-3 text-sm text-gray-600">{page.choice ? PAGE_CHOICE[page.choice] : "Received"}</p>
              ) : (
                <form
                  className="mt-3 flex flex-wrap gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const data = new FormData(event.currentTarget, (event.nativeEvent as SubmitEvent).submitter);
                    startTransition(async () => {
                      await chooseContentPage(data);
                      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#website-content`);
                      router.refresh();
                    });
                  }}
                >
                  <input type="hidden" name="pageId" value={page.id} />
                  {(["in_doc", "current_site"] as const).map((choice) => (
                    <button
                      key={choice}
                      type="submit"
                      name="choice"
                      value={choice}
                      disabled={pending}
                      className={
                        page.choice === choice
                          ? "text-xs font-semibold bg-gray-900 text-white px-3 py-1.5 rounded-full"
                          : "text-xs font-semibold border border-gray-300 text-gray-700 px-3 py-1.5 rounded-full hover:border-gray-900"
                      }
                    >
                      {PAGE_CHOICE[choice]}
                    </button>
                  ))}
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

const PAGE_CHOICE = {
  in_doc: "My content is in the doc",
  current_site: "Use my current site",
} as const;

function ItemDetail({
  item,
  previous,
  next,
  contentDocUrl,
  contentPages,
  onBack,
}: {
  item: ChecklistItem & { number: string };
  previous: (ChecklistItem & { number: string }) | null;
  next: (ChecklistItem & { number: string }) | null;
  contentDocUrl: string | null;
  contentPages: ContentPage[];
  onBack: () => void;
}) {
  const isWebsiteContent = item.anchor === "website-content";
  const showSend = !isWebsiteContent && (item.status === "not_started" || item.status === "needs_changes");
  const locked = item.status === "sent" || item.status === "received";
  const [sendError, setSendError] = useState("");
  useEffect(() => {
    setSendError("");
  }, [item.id]);
  const copies = copyRows(item);
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <article id={item.anchor} className="item-card">
      <button type="button" onClick={onBack} className="text-sm font-semibold text-gray-600 hover:text-gray-900 mb-4">
        ← Back to checklist
      </button>
      <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-5">
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-1">{item.number}</p>
            <h2 className="text-xl font-bold">{item.title}</h2>
          </div>
          <StatusFlag status={item.status} />
        </div>

        {copies.length ? (
          <div className="mb-5 p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
            {copies.map((row, index) => (
              <div
                key={row.value}
                className={`flex flex-wrap items-center justify-between gap-3 ${index > 0 ? "pt-3 border-t border-gray-200" : ""}`}
              >
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">{row.label}</p>
                  <p className="text-sm font-bold text-gray-900">{row.value}</p>
                </div>
                <CopyButton
                  text={row.value}
                  label="Copy"
                  className="text-xs font-semibold bg-gray-900 text-white px-3 py-1.5 rounded-full"
                />
              </div>
            ))}
          </div>
        ) : null}

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
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">Folder or doc for this item</p>
                <a
                  href={item.resourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-blue-600 underline break-all"
                >
                  Open the link
                </a>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Brandastic will add the folder or doc link on this card.</p>
            )
          ) : null}
          {item.steps.length ? (
            <section>
              <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide mb-2">Steps</p>
              <GuideSteps steps={item.steps} />
            </section>
          ) : null}
          {isWebsiteContent ? (
            <WebsitePages contentDocUrl={contentDocUrl} pages={contentPages.filter((page) => !page.requested)} />
          ) : null}
          {item.anchor === "menu" ? (
            <MenuForm itemId={item.id} pages={contentPages} initial={item.answers} locked={locked} />
          ) : null}
          {item.anchor !== "menu" && item.cardType === "form" && item.formSchema ? (
            <CardForm itemId={item.id} schema={item.formSchema} initial={item.answers} locked={locked} />
          ) : null}
          {item.cardType === "file" ? (
            <FileCard itemId={item.id} folder={item.fileFolder ?? "Drive"} files={item.files} locked={locked} />
          ) : null}
          <section>
            <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide mb-1.5">Done looks like</p>
            <Paragraphs text={item.doneLooksLike} />
          </section>
        </div>

        {!isWebsiteContent && item.status === "needs_changes" && item.note ? (
          <div className="mt-5 p-4 bg-orange-50 border border-orange-100 rounded-xl">
            <p className="text-[10px] uppercase font-semibold tracking-wide text-orange-800">From Sandy</p>
            <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{item.note}</p>
          </div>
        ) : null}

        {showSend ? (
          <form
            className="mt-6"
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData();
              data.set("itemId", item.id);
              const anchor = item.anchor;
              startTransition(async () => {
                await flushCardSave();
                const result = await markSent(data);
                if (result?.error) {
                  setSendError(result.error);
                  return;
                }
                setSendError("");
                const nextUrl = `${window.location.pathname}${window.location.search}#${anchor}`;
                window.history.replaceState(null, "", nextUrl);
                router.refresh();
              });
            }}
          >
            <button type="submit" className={btnPrimary} disabled={pending}>
              {pending ? "Sending…" : "I sent it"}
            </button>
            {sendError ? <p className="mt-3 text-sm text-rose-700">{sendError}</p> : null}
          </form>
        ) : null}

        {item.status === "sent" ? <p className="mt-6 text-sm text-gray-600">Thanks, we&apos;ll review it.</p> : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        {previous ? (
          <a href={`#${previous.anchor}`} className={btnGhost}>
            ← Previous
          </a>
        ) : (
          <span />
        )}
        {next ? (
          <a href={`#${next.anchor}`} className={btnGhost}>
            Next →
          </a>
        ) : (
          <span />
        )}
      </div>
    </article>
  );
}
