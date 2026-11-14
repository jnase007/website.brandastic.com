"use client";

import { useState } from "react";
import { readMenuAnswers, type MenuChoice } from "@/lib/menu";
import type { Answers, ContentPage } from "@/lib/types";
import { fieldClass } from "@/components/Shell";
import { useAutosave } from "@/components/useAutosave";

const CHOICES: { id: MenuChoice; label: string }[] = [
  { id: "keep", label: "Keep" },
  { id: "remove", label: "Remove" },
  { id: "rename", label: "Rename" },
];

type Decision = { choice: MenuChoice | ""; rename: string };

export function MenuForm({
  itemId,
  pages,
  initial,
  locked,
}: {
  itemId: string;
  pages: ContentPage[];
  initial: Answers;
  locked: boolean;
}) {
  const official = pages.filter((page) => !page.requested);
  const requested = pages.filter((page) => page.requested);
  const parsed = readMenuAnswers(initial);
  const [choices, setChoices] = useState<Record<string, Decision>>(() => {
    const map: Record<string, Decision> = {};
    for (const page of official) {
      const saved = parsed.choices[page.id];
      map[page.id] = { choice: saved?.choice ?? "", rename: saved?.rename ?? "" };
    }
    return map;
  });
  const [added, setAdded] = useState(() => {
    if (parsed.added.length) return parsed.added;
    return requested.map((page) => ({ id: page.id, title: page.title }));
  });
  const { saved, error, save } = useAutosave(itemId, locked);

  function payload(nextChoices: Record<string, Decision>, nextAdded: { id: string; title: string }[]): Answers {
    const stored: Record<string, unknown> = {};
    for (const page of official) {
      const row = nextChoices[page.id];
      if (!row?.choice) continue;
      stored[page.id] = { choice: row.choice, rename: row.rename, title: page.title };
    }
    return { choices: stored, added: nextAdded };
  }

  function updateChoices(pageId: string, patch: Partial<Decision>) {
    const current = choices[pageId] ?? { choice: "" as const, rename: "" };
    const next = { ...choices, [pageId]: { ...current, ...patch } };
    setChoices(next);
    save(payload(next, added));
  }

  function updateAdded(nextAdded: { id: string; title: string }[]) {
    setAdded(nextAdded);
    save(payload(choices, nextAdded));
  }

  return (
    <div className="space-y-4">
      {official.length === 0 ? (
        <p className="text-sm text-gray-500">Your page list will show here once Brandastic adds it. You can still add a page below.</p>
      ) : (
        official.map((page) => {
          const row = choices[page.id] ?? { choice: "", rename: "" };
          return (
            <fieldset key={page.id} className="space-y-3 rounded-xl border border-gray-200 p-4" disabled={locked}>
              <legend className="px-1 text-sm font-bold text-gray-900">{page.title}</legend>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {CHOICES.map((option) => (
                  <label key={option.id} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <input
                      type="radio"
                      name={`choice-${page.id}`}
                      checked={row.choice === option.id}
                      onChange={() => updateChoices(page.id, { choice: option.id })}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
              {row.choice === "rename" ? (
                <label className="block">
                  <span className="text-[10px] uppercase font-semibold tracking-wide text-gray-400">New name</span>
                  <input
                    value={row.rename}
                    onChange={(event) => updateChoices(page.id, { rename: event.target.value })}
                    className={`${fieldClass} mt-1.5`}
                    placeholder="New page name"
                  />
                </label>
              ) : null}
            </fieldset>
          );
        })
      )}

      <div className="space-y-3">
        {added.map((row, index) => (
          <div key={row.id} className="space-y-2 rounded-xl border border-gray-200 p-4">
            <label className="block">
              <span className="text-[10px] uppercase font-semibold tracking-wide text-gray-400">Page to add</span>
              <input
                value={row.title}
                disabled={locked}
                onChange={(event) =>
                  updateAdded(added.map((entry, entryIndex) => (entryIndex === index ? { ...entry, title: event.target.value } : entry)))
                }
                className={`${fieldClass} mt-1.5`}
                placeholder="Page name"
              />
            </label>
            {locked ? null : (
              <button
                type="button"
                className="text-xs font-semibold text-gray-400 hover:text-gray-900"
                onClick={() => updateAdded(added.filter((_, entryIndex) => entryIndex !== index))}
              >
                Remove
              </button>
            )}
          </div>
        ))}
        {locked ? null : (
          <button
            type="button"
            className="text-sm font-semibold text-gray-700"
            onClick={() => updateAdded([...added, { id: crypto.randomUUID(), title: "" }])}
          >
            Add a page
          </button>
        )}
      </div>

      <p className={`text-xs ${error ? "text-rose-700" : "text-gray-400"}`}>
        {locked ? "Sent for review." : error ? error : saved === null ? "" : saved ? "Saved" : "Saving…"}
      </p>
    </div>
  );
}
