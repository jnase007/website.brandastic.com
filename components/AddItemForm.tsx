"use client";

import { useState } from "react";
import { addClientItem } from "@/lib/actions";
import type { LibraryItem } from "@/lib/types";
import { btnPrimary, fieldClass } from "@/components/Shell";

export function AddItemForm({ slug, items }: { slug: string; items: LibraryItem[] }) {
  const [libraryId, setLibraryId] = useState(items[0]?.id ?? "");
  const selected = items.find((item) => item.id === libraryId);
  if (!items.length) return <p className="text-sm text-gray-500">Every library item is already on this client.</p>;

  return (
    <form action={addClientItem} className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
      <input type="hidden" name="slug" value={slug} />
      <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">Add an item</p>
      <select name="libraryId" value={libraryId} onChange={(event) => setLibraryId(event.target.value)} className={fieldClass}>
        {items.map((item) => (
          <option key={item.id} value={item.id}>
            Phase {item.phase} · {item.title}
          </option>
        ))}
      </select>
      {selected?.allowsResourceLink ? (
        <input name="resourceUrl" placeholder="Optional Google Drive folder or Google Doc link" className={fieldClass} />
      ) : null}
      <button type="submit" className={btnPrimary}>
        Add item
      </button>
    </form>
  );
}
