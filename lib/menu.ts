import type { Answers } from "@/lib/types";

export type MenuChoice = "keep" | "remove" | "rename";

export type MenuPageDecision = { choice: MenuChoice; rename: string; title: string };

export type MenuAddedPage = { id: string; title: string };

const CHOICES = new Set<MenuChoice>(["keep", "remove", "rename"]);

export function readMenuAnswers(answers: Answers | null | undefined) {
  const choices: Record<string, MenuPageDecision> = {};
  const rawChoices =
    answers && typeof answers.choices === "object" && answers.choices && !Array.isArray(answers.choices)
      ? (answers.choices as Record<string, unknown>)
      : {};
  for (const [id, value] of Object.entries(rawChoices)) {
    if (!value || typeof value !== "object") continue;
    const row = value as Record<string, unknown>;
    const choice = typeof row.choice === "string" && CHOICES.has(row.choice as MenuChoice) ? (row.choice as MenuChoice) : null;
    if (!choice) continue;
    choices[id] = {
      choice,
      rename: typeof row.rename === "string" ? row.rename : "",
      title: typeof row.title === "string" ? row.title : "",
    };
  }
  const added: MenuAddedPage[] = [];
  const rawAdded = answers && Array.isArray(answers.added) ? answers.added : [];
  for (const value of rawAdded) {
    if (!value || typeof value !== "object") continue;
    const row = value as Record<string, unknown>;
    if (typeof row.id !== "string" || typeof row.title !== "string") continue;
    added.push({ id: row.id, title: row.title });
  }
  return { choices, added };
}

export function validateMenuAnswers(
  pages: { id: string; title: string; requested: boolean }[],
  answers: Answers,
): string | null {
  const { choices, added } = readMenuAnswers(answers);
  if (added.some((row) => !row.title.trim())) return "Name each page you add, or remove the blank one.";
  const official = pages.filter((page) => !page.requested);
  if (!official.length && !added.length) return "There aren’t any pages to confirm yet.";
  for (const page of official) {
    const row = choices[page.id];
    if (!row) return `Choose Keep, Remove, or Rename for ${page.title}.`;
    if (row.choice === "rename" && !row.rename.trim()) return `Enter the new name for ${page.title}.`;
  }
  return null;
}

const CHOICE_LABEL: Record<MenuChoice, string> = {
  keep: "Keep",
  remove: "Remove",
  rename: "Rename",
};

export function summarizeMenu(answers: Answers) {
  const { choices, added } = readMenuAnswers(answers);
  const lines = Object.values(choices).map((row) => ({
    label: row.title || "Page",
    value: row.choice === "rename" ? `Rename to ${row.rename.trim() || "—"}` : CHOICE_LABEL[row.choice],
  }));
  for (const row of added) {
    const title = row.title.trim();
    if (!title) continue;
    lines.push({ label: title, value: "Requested" });
  }
  return lines;
}
