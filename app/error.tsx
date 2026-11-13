"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="max-w-xl mx-auto px-6 py-20 text-center">
      <h1 className="text-2xl font-extrabold">Something went wrong</h1>
      <p className="text-gray-500 mt-3">Refresh the page and try again. If it keeps happening, email Sandy.</p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 px-5 py-2.5 bg-gray-900 text-white rounded-full text-sm font-semibold"
      >
        Try again
      </button>
    </main>
  );
}
