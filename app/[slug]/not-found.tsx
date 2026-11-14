import { helpMailto } from "@/lib/brand";
import { Shell } from "@/components/Shell";

export default function ClientNotFound() {
  return (
    <Shell>
      <div className="max-w-xl mx-auto text-center py-10">
        <h1 className="text-3xl font-extrabold">We couldn’t find that link</h1>
        <p className="text-gray-500 mt-3">
          Check the address with your Brandastic contact, or email Sandy and we’ll send a fresh one.
        </p>
        <a href={helpMailto()} className="inline-flex mt-6 text-sm font-semibold bg-gray-900 text-white px-4 py-2.5 rounded-full">
          Need help? Email Sandy
        </a>
      </div>
    </Shell>
  );
}
