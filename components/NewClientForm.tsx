"use client";

import { useActionState, useMemo, useState } from "react";
import { createClient, type ActionState } from "@/lib/actions";
import { PHASES, PRESETS, type PresetId } from "@/lib/brand";
import type { LibraryItem } from "@/lib/types";
import { btnPrimary, fieldClass } from "@/components/Shell";

function initialChecks(items: LibraryItem[], preset: PresetId) {
  const checked: Record<string, boolean> = {};
  for (const item of items) {
    checked[item.id] = item.presets.includes(preset) && !item.offByDefault;
  }
  return checked;
}

export function NewClientForm({ items }: { items: LibraryItem[] }) {
  const [state, action, pending] = useActionState(createClient, {} as ActionState);
  const [preset, setPreset] = useState<PresetId>("A");
  const [checked, setChecked] = useState<Record<string, boolean>>(() => initialChecks(items, "A"));

  const grouped = useMemo(
    () => PHASES.map((phase) => ({ ...phase, items: items.filter((item) => item.phase === phase.id) })),
    [items],
  );

  return (
    <form action={action} className="space-y-8">
      {state.error ? (
        <p className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800">{state.error}</p>
      ) : null}

      <label className="block">
        <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">Client name</span>
        <input name="name" required className={`${fieldClass} mt-1.5`} placeholder="NextMod" />
      </label>

      <fieldset>
        <legend className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide mb-2">Preset</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {PRESETS.map((option) => (
            <label
              key={option.id}
              className={`rounded-2xl border px-4 py-3 cursor-pointer ${preset === option.id ? "border-gray-900 bg-white" : "border-gray-200 bg-white"}`}
            >
              <input
                type="radio"
                name="preset"
                value={option.id}
                checked={preset === option.id}
                onChange={() => {
                  setPreset(option.id);
                  setChecked(initialChecks(items, option.id));
                }}
                className="sr-only"
              />
              <span className="block text-xs font-semibold text-gray-400">{option.id}</span>
              <span className="block text-sm font-bold mt-0.5">{option.label}</span>
              <span className="block text-xs text-gray-500 mt-1">{option.hint}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">Switching preset checks that preset’s items again. Items that are off by default stay unchecked.</p>
      </fieldset>

      <div className="space-y-6">
        {grouped.map((phase) => (
          <section key={phase.id}>
            <h2 className="text-sm font-bold mb-2">{phase.label}</h2>
            <div className="space-y-2">
              {phase.items.map((item) => {
                const on = Boolean(checked[item.id]);
                return (
                  <label key={item.id} className="block rounded-2xl border border-gray-200 bg-white px-4 py-3">
                    <span className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        name="item"
                        value={item.id}
                        checked={on}
                        onChange={(event) => setChecked((prev) => ({ ...prev, [item.id]: event.target.checked }))}
                        className="mt-1"
                      />
                      <span>
                        <span className="block text-sm font-semibold">{item.title}</span>
                        <span className="block text-xs text-gray-400 mt-0.5">
                          Presets {item.presets.join(", ")}
                          {item.offByDefault ? " · off by default" : ""}
                        </span>
                      </span>
                    </span>
                    {on && item.allowsResourceLink ? (
                      <input
                        name={`resource_${item.id}`}
                        placeholder="Optional Google Drive folder or Google Doc link"
                        className={`${fieldClass} mt-3`}
                        onClick={(event) => event.stopPropagation()}
                      />
                    ) : null}
                  </label>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <label className="block">
        <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">Google Drive folder</span>
        <input name="driveUrl" type="url" placeholder="https://" className={`${fieldClass} mt-1.5`} />
      </label>

      <div className="grid gap-3 sm:grid-cols-3">
        {PHASES.map((phase, index) => (
          <label key={phase.id} className="block">
            <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">{phase.label} due</span>
            <input name={`due${index + 1}`} type="date" className={`${fieldClass} mt-1.5`} />
          </label>
        ))}
      </div>

      <button type="submit" disabled={pending} className={btnPrimary}>
        {pending ? "Saving…" : "Save and copy link"}
      </button>
    </form>
  );
}
