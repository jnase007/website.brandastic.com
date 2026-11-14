import type { Answers, FormField, FormSchema } from "@/lib/types";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validEmail(value: string) {
  return EMAIL.test(value.trim());
}

export function validEmailList(value: string) {
  const parts = value
    .split(/[,;]+/)
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length > 0 && parts.every(validEmail);
}

export function validUrl(value: string) {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function text(answers: Answers, name: string) {
  const value = answers[name];
  return typeof value === "string" ? value.trim() : "";
}

function checked(answers: Answers, name: string) {
  return answers[name] === true;
}

function rows(answers: Answers, name: string) {
  const value = answers[name];
  return Array.isArray(value) ? (value as Answers[]) : [];
}

export function blankAnswers(schema: FormSchema): Answers {
  const answers: Answers = {};
  fill(schema.fields, answers);
  return answers;
}

function fill(fields: FormField[], answers: Answers) {
  for (const field of fields) {
    if (field.kind === "note") continue;
    if (field.kind === "group") {
      fill(field.fields, answers);
      continue;
    }
    if (field.kind === "repeat") {
      const count = field.min ?? 1;
      answers[field.name] = Array.from({ length: count }, () => {
        const row: Answers = {};
        fill(field.fields, row);
        return row;
      });
      continue;
    }
    if (field.kind === "checkbox") answers[field.name] = false;
    else if (field.kind === "colors") answers[field.name] = { useLogo: false, colors: ["#111111"] };
    else if (field.kind === "url-na") answers[field.name] = { url: "", na: false };
    else answers[field.name] = "";
  }
}

export function mergeAnswers(schema: FormSchema, saved: Answers | null): Answers {
  const base = blankAnswers(schema);
  if (!saved) return base;
  return { ...base, ...saved };
}

export function validateAnswers(schema: FormSchema, answers: Answers): string | null {
  return check(schema.fields, answers);
}

function check(fields: FormField[], answers: Answers): string | null {
  const none = checked(answers, "none");
  for (const field of fields) {
    if (field.kind === "note") continue;
    if (field.kind === "group") {
      const error = check(field.fields, answers);
      if (error) return error;
      continue;
    }
    if (field.kind === "checkbox") continue;
    if (field.kind === "repeat") {
      if (none && field.name === "tools") continue;
      const list = rows(answers, field.name);
      const needed = field.min ?? 0;
      if (list.length < needed) {
        const error = check(field.fields, list[0] ?? {});
        if (error) return error;
        return "Fill in every row.";
      }
      for (const row of list) {
        const error = check(field.fields, row);
        if (error) return error;
        if (field.name === "tools" && row.access !== true) return "Check “I sent access” for each tool, or tell us you don't have any.";
      }
      if (field.name === "tools" && !none && list.length === 0) return "Add a tool, or tell us you don't have any.";
      continue;
    }
    if (field.kind === "colors") {
      const value = answers[field.name] as { useLogo?: boolean; colors?: string[] } | undefined;
      if (value?.useLogo) continue;
      const colors = (value?.colors ?? []).map((color) => color.trim()).filter(Boolean);
      if (colors.length < 1 || colors.length > field.max) return `Add 1 to ${field.max} colors, or use your logo colors.`;
      if (colors.some((color) => !/^#[0-9a-fA-F]{6}$/.test(color))) return "Use a color picker for each brand color.";
      continue;
    }
    if (field.kind === "url-na") {
      const value = answers[field.name] as { url?: string; na?: boolean } | undefined;
      if (value?.na) continue;
      if (!validUrl(value?.url ?? "")) return `Enter a full web address for ${field.label}, or mark it N/A.`;
      continue;
    }
    const value = text(answers, field.name);
    if (field.kind === "email") {
      if (!field.required && !value) continue;
      const list = field.name === "sendTo";
      if (list ? !validEmailList(value) : !validEmail(value)) return `Enter a valid email for ${field.label}.`;
      continue;
    }
    if (field.kind === "url") {
      if (!field.required && !value) continue;
      if (!validUrl(value)) return `Enter a full web address for ${field.label}, starting with https://.`;
      continue;
    }
    if (field.kind === "select") {
      if (field.required && !value) return `Choose ${field.label}.`;
      continue;
    }
    if (field.name === "words") {
      const tokens = value.includes(",")
        ? value.split(",").map((part) => part.trim()).filter(Boolean)
        : value.split(/\s+/).filter(Boolean);
      if (tokens.length < 3) return "Enter 3 words that describe your brand.";
      continue;
    }
    if (field.required && !value) return `Fill in ${field.label}.`;
  }
  return null;
}

export type AnswerLine = { label: string; value: string };

export function summarizeAnswers(schema: FormSchema, answers: Answers): AnswerLine[] {
  const lines: AnswerLine[] = [];
  walk(schema.fields, answers, lines, "");
  return lines;
}

function walk(fields: FormField[], answers: Answers, lines: AnswerLine[], prefix: string) {
  for (const field of fields) {
    if (field.kind === "note") continue;
    if (field.kind === "group") {
      walk(field.fields, answers, lines, prefix);
      continue;
    }
    if (field.kind === "checkbox") {
      lines.push({ label: field.label, value: checked(answers, field.name) ? "Yes" : "No" });
      continue;
    }
    if (field.kind === "repeat") {
      rows(answers, field.name).forEach((row, index) => {
        walk(field.fields, row, lines, `${prefix}${index + 1}. `);
      });
      continue;
    }
    if (field.kind === "colors") {
      const value = answers[field.name] as { useLogo?: boolean; colors?: string[] } | undefined;
      lines.push({
        label: "Brand colors",
        value: value?.useLogo ? "Use our logo colors" : (value?.colors ?? []).filter(Boolean).join(", ") || "—",
      });
      continue;
    }
    if (field.kind === "url-na") {
      const value = answers[field.name] as { url?: string; na?: boolean } | undefined;
      lines.push({ label: field.label, value: value?.na ? "N/A" : value?.url?.trim() || "—" });
      continue;
    }
    lines.push({ label: `${prefix}${field.label}`, value: text(answers, field.name) || "—" });
  }
}
