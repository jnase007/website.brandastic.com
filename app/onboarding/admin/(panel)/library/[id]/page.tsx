import { notFound } from "next/navigation";
import { getLibraryItem } from "@/lib/queries";
import { LibraryForm } from "@/components/LibraryForm";

export default async function EditLibraryItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getLibraryItem(id);
  if (!item) notFound();

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-2">Edit item</h1>
      <p className="text-gray-500 mb-6">This updates the master list. Clients who already have the item keep the previous wording.</p>
      <LibraryForm item={item} />
    </div>
  );
}
