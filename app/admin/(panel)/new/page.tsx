import { listLibrary } from "@/lib/queries";
import { NewClientForm } from "@/components/NewClientForm";

export default async function NewClientPage() {
  const items = await listLibrary();
  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-2">New client</h1>
      <p className="text-gray-500 mb-6">Pick a preset, then add or remove items. The private link is created when you save.</p>
      <NewClientForm items={items} />
    </div>
  );
}
