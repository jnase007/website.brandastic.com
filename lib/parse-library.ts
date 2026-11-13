import { allowsResourceLink, anchorForTitle } from "@/lib/text";
import type { LibraryItem, StepBlock } from "@/lib/types";

function unescapeMarkdown(value: string) {
  return value.replace(/\\(.)/g, "$1").trim();
}

function section(body: string, label: string, nextLabels: string[]) {
  const lines = body.split("\n");
  const start = lines.findIndex((line) => line.trim() === `**${label}**`);
  if (start === -1) return "";
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (nextLabels.some((next) => trimmed === `**${next}**`)) {
      end = i;
      break;
    }
    if (trimmed.startsWith("**Presets") || trimmed.startsWith("**Default phase")) {
      end = i;
      break;
    }
  }
  return lines.slice(start + 1, end).join("\n").trim();
}

function parseSteps(raw: string): StepBlock[] {
  const blocks: StepBlock[] = [];
  let note: string[] | null = null;
  const flush = () => {
    if (note && note.join("").trim()) {
      blocks.push({ type: "note", text: note.join("\n").trim() });
    }
    note = null;
  };

  for (const rawLine of raw.split("\n")) {
    const line = rawLine.trim();
    if (!line) {
      if (note) note.push("");
      continue;
    }
    const heading = line.match(/^###\s+\*\*(.+?)\*\*\s*$/);
    if (heading) {
      flush();
      blocks.push({ type: "heading", text: unescapeMarkdown(heading[1]) });
      continue;
    }
    if (/^\*\*Note\b/i.test(line)) {
      flush();
      note = [unescapeMarkdown(line.replace(/^\*\*/, "").replace(/\*\*$/, ""))];
      continue;
    }
    if (note && /^[*-]\s+/.test(line)) {
      note.push(unescapeMarkdown(line.replace(/^[*-]\s+/, "")));
      continue;
    }
    if (note) {
      note.push(unescapeMarkdown(line));
      continue;
    }
    const step = line.match(/^\d+\.\s+(.*)$/);
    if (step) {
      blocks.push({ type: "step", text: unescapeMarkdown(step[1]) });
      continue;
    }
    const previous = blocks[blocks.length - 1];
    const text = unescapeMarkdown(line);
    if (previous?.type === "step") previous.text = `${previous.text} ${text}`;
    else blocks.push({ type: "step", text });
  }
  flush();
  return blocks.filter((block) => block.text.trim());
}

function parsePresets(body: string) {
  const line = body.split("\n").find((entry) => entry.includes("**Presets"));
  if (!line) return { presets: [] as Array<"A" | "B" | "C">, offByDefault: false };
  const presets: Array<"A" | "B" | "C"> = [];
  if (/\bA\b/.test(line)) presets.push("A");
  if (/\bB\b/.test(line)) presets.push("B");
  if (/\bC\b/.test(line)) presets.push("C");
  return { presets, offByDefault: /off by default/i.test(line) };
}

export function parseLibrary(markdown: string): LibraryItem[] {
  const source = markdown.replace(/\r\n/g, "\n");
  const appliedAt = source.search(/^# Applied\s*$/m);
  const usable = appliedAt === -1 ? source : source.slice(0, appliedAt);
  const matches = [...usable.matchAll(/^## \*\*(.+?)\*\*\s*$/gm)];
  const items: LibraryItem[] = [];

  matches.forEach((match, index) => {
    const title = match[1].trim();
    const start = (match.index ?? 0) + match[0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index ?? usable.length : usable.length;
    const body = usable.slice(start, end);
    if (!body.includes("**What we need**")) return;

    const whatWeNeed = section(body, "What we need", ["Why we need it", "Steps", "Done looks like"]);
    const why = section(body, "Why we need it", ["Steps", "Done looks like"]);
    const steps = parseSteps(section(body, "Steps", ["Done looks like"]));
    const doneLooksLike = section(body, "Done looks like", []);
    const { presets, offByDefault } = parsePresets(body);
    const phaseMatch = body.match(/\*\*Default phase:\*\*\s*Phase\s+([123])/);
    const phase = Number(phaseMatch?.[1] ?? 0) as 1 | 2 | 3;

    if (!whatWeNeed || !why || !doneLooksLike || !presets.length || ![1, 2, 3].includes(phase)) {
      throw new Error(`Could not parse library item "${title}"`);
    }

    items.push({
      id: anchorForTitle(title),
      title,
      whatWeNeed,
      why,
      steps,
      doneLooksLike,
      phase,
      presets,
      offByDefault,
      allowsResourceLink: allowsResourceLink(title),
      sortOrder: items.length + 1,
    });
  });

  const ids = new Set<string>();
  for (const item of items) {
    if (ids.has(item.id)) throw new Error(`Duplicate anchor #${item.id}`);
    ids.add(item.id);
  }
  return items;
}
