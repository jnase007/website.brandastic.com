"use client";

import { useActionState } from "react";
import { saveLibraryItem, type ActionState } from "@/lib/actions";
import { PHASES, PRESETS } from "@/lib/brand";
import type { LibraryItem } from "@/lib/types";
import { stepsToText } from "@/lib/text";
import { btnPrimary, fieldClass } from "@/components/Shell";

export function LibraryForm({ item }: { item?: LibraryItem }) {
  const [state, action, pending] = useActionState(saveLibraryItem, {} as ActionState);

  return (
    <form action={action} className="space-y-4">
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      {state.error ? (
        <p className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800">{state.error}</p>
      ) : null}

      <label className="block">
        <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">Title</span>
        <input name="title" required defaultValue={item?.title ?? ""} className={`${fieldClass} mt-1.5`} />
      </label>
      {item ? <p className="text-xs text-gray-400">Link anchor: #{item.id}. Existing clients keep the copy they already have.</p> : null}

      <label className="block">
        <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">What we need</span>
        <textarea name="what" required rows={4} defaultValue={item?.whatWeNeed ?? ""} className={`${fieldClass} mt-1.5`} />
      </label>
      <label className="block">
        <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">Why we need it</span>
        <textarea name="why" required rows={3} defaultValue={item?.why ?? ""} className={`${fieldClass} mt-1.5`} />
      </label>
      <label className="block">
        <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">Steps</span>
        <textarea name="steps" required rows={10} defaultValue={item ? stepsToText(item.steps) : ""} className={`${fieldClass} mt-1.5 font-mono text-[13px]`} />
        <span className="block text-xs text-gray-400 mt-1">One step per line. Start a line with ## for a heading, or &gt; for a note.</span>
      </label>
      <label className="block">
        <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">Done looks like</span>
        <textarea name="done" required rows={3} defaultValue={item?.doneLooksLike ?? ""} className={`${fieldClass} mt-1.5`} />
      </label>

      <label className="block">
        <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">Phase</span>
        <select name="phase" defaultValue={String(item?.phase ?? 1)} className={`${fieldClass} mt-1.5`}>
          {PHASES.map((phase) => (
            <option key={phase.id} value={phase.id}>
              {phase.label}
            </option>
          ))}
        </select>
      </label>

      <fieldset>
        <legend className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide mb-2">Presets</legend>
        <div className="flex flex-wrap gap-3">
          {PRESETS.map((preset) => (
            <label key={preset.id} className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" name="preset" value={preset.id} defaultChecked={item ? item.presets.includes(preset.id) : true} />
              {preset.id} · {preset.label}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="off" defaultChecked={item?.offByDefault ?? false} />
        Off by default (listed, but not checked for new clients)
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="resource" defaultChecked={item?.allowsResourceLink ?? false} />
        This card can have a Google Drive or Google Doc link
      </label>

      <button type="submit" disabled={pending} className={btnPrimary}>
        {pending ? "Saving…" : "Save item"}
      </button>
    </form>
  );
}
