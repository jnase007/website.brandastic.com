import type { Metadata } from "next";
import { helpMailto } from "@/lib/brand";
import { Shell } from "@/components/Shell";

export const metadata: Metadata = {
  title: "Welcome to Brandastic Website Onboarding",
};

export default function HomePage() {
  return (
    <Shell
      footer={
        <a href="/admin" className="hover:text-gray-600">
          Team login
        </a>
      }
    >
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold">Welcome to Brandastic Website Onboarding</h1>
        <p className="text-gray-500 mt-2">Everything we need from you to build your new website, with simple steps.</p>
        <div className="mt-8 mx-auto max-w-xl bg-white rounded-2xl border border-gray-200 p-5 sm:p-8 text-left">
          <h2 className="text-xl font-bold">Your website checklist</h2>
          <p className="text-sm text-gray-700 mt-2 leading-relaxed">
            Use the private link Sandy sent you to see your checklist and track what’s been received.
          </p>
        </div>
        <p className="mt-4">
          <a href={helpMailto()} className="text-sm font-semibold text-gray-600 hover:text-gray-900">
            Can’t find your link? Email Sandy
          </a>
        </p>
      </div>
    </Shell>
  );
}
