import { LibraryForm } from "@/components/LibraryForm";

export default function NewLibraryItemPage() {
  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-2">Add library item</h1>
      <p className="text-gray-500 mb-6">New clients can include this item. It is not added to clients you already created.</p>
      <LibraryForm />
    </div>
  );
}
