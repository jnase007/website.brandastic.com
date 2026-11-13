"use client";

import { useEffect, useState } from "react";

export function PhaseAccordions({
  current,
  phases,
}: {
  current: number;
  phases: { id: number; anchors: string[]; summary: React.ReactNode; body: React.ReactNode }[];
}) {
  const [open, setOpen] = useState<number[]>([current]);

  const anchorKey = phases.map((phase) => `${phase.id}:${phase.anchors.join(",")}`).join("|");

  useEffect(() => {
    setOpen((prev) => (prev.includes(current) ? prev : [...prev, current]));
  }, [current]);

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;
    const phase = phases.find((entry) => entry.anchors.includes(hash));
    if (phase) {
      setOpen((prev) => (prev.includes(phase.id) ? prev : [...prev, phase.id]));
    }
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({ block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
    // Re-run when the set of anchors changes, not when the element identity does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchorKey]);

  return (
    <div className="space-y-4">
      {phases.map((phase) => {
        const isOpen = open.includes(phase.id);
        return (
          <section key={phase.id}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() =>
                setOpen((prev) => (prev.includes(phase.id) ? prev.filter((id) => id !== phase.id) : [...prev, phase.id]))
              }
              className="w-full text-left rounded-2xl border border-gray-200 bg-white px-5 py-4 hover:border-gray-900 transition"
            >
              {phase.summary}
            </button>
            {isOpen ? <div className="mt-3 space-y-3">{phase.body}</div> : null}
          </section>
        );
      })}
    </div>
  );
}
