import Link from "next/link";
import { deleteLibraryItem } from "@/lib/actions";
import { PHASES } from "@/lib/brand";
import { listLibrary } from "@/lib/queries";
import { ConfirmForm } from "@/components/ConfirmForm";
import { btnPrimary } from "@/components/Shell";

export default async function LibraryPage() {
  const items = await listLibrary();

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold">Item library</h1>
          <p className="text-gray-500 mt-1">Edits apply to new clients. Existing clients keep the items they already have.</p>
        </div>
        <Link href="/admin/library/new" className={btnPrimary}>
          Add item
        </Link>
      </div>

      <div className="space-y-6">
        {PHASES.map((phase) => (
          <section key={phase.id}>
            <h2 className="text-sm font-bold mb-2">{phase.label}</h2>
            <div className="space-y-2">
              {items
                .filter((item) => item.phase === phase.id)
                .map((item) => (
                  <article key={item.id} className="rounded-2xl border border-gray-200 bg-white px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        #{item.id} · Presets {item.presets.join(", ") || "none"}
                        {item.offByDefault ? " · off by default" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/library/${item.id}`} className="text-sm font-semibold text-gray-900">
                        Edit
                      </Link>
                      <ConfirmForm action={deleteLibraryItem} message={`Remove “${item.title}” from the library? Existing clients keep their copy.`}>
                        <input type="hidden" name="id" value={item.id} />
                        <button type="submit" className="text-sm font-semibold text-gray-400 hover:text-gray-900">
                          Remove
                        </button>
                      </ConfirmForm>
                    </div>
                  </article>
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
