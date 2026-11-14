"use client";

import { useState } from "react";
import type { Answers } from "@/lib/types";

let chain = Promise.resolve();
let pendingSave = Promise.resolve();
let timer = 0;
let token = 0;

export function flushCardSave() {
  return pendingSave;
}

async function postAnswers(itemId: string, answers: Answers) {
  const response = await fetch("/api/answers", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ itemId, answers }),
  });
  const body = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok || body.error) throw new Error(body.error || "Couldn’t save. Try again.");
}

export function useAutosave(itemId: string, locked: boolean) {
  const [saved, setSaved] = useState<boolean | null>(null);
  const [error, setError] = useState("");

  function save(next: Answers) {
    if (locked) return;
    setSaved(false);
    setError("");
    window.clearTimeout(timer);
    const generation = ++token;
    pendingSave = new Promise((resolve) => {
      timer = window.setTimeout(() => {
        chain = chain
          .catch(() => undefined)
          .then(async () => {
            try {
              await postAnswers(itemId, next);
              if (generation === token) {
                setSaved(true);
                setError("");
              }
            } catch (err) {
              if (generation === token) {
                setSaved(null);
                setError(err instanceof Error ? err.message : "Couldn’t save. Try again.");
              }
            }
          })
          .finally(resolve);
      }, 400);
    });
  }

  return { saved, error, save };
}
