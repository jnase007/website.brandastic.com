import { randomInt } from "crypto";
import type { StepBlock } from "@/lib/types";

const ANCHORS: Record<string, string> = {
  "menu navigation": "menu",
  "analytics access": "analytics",
  "google tag manager": "tag-manager",
  "google search console": "search-console",
  "dns access": "dns",
  "server / hosting (wordpress only)": "hosting",
  "shopify collaborator access (shopify only)": "shopify",
  "brand logos": "logos",
  "brand colors or standards": "brand",
  "website content": "website-content",
  "image or video assets": "images",
  "team headshots": "team",
  "team headshots and bios (optional)": "team",
  "website login (existing wordpress site)": "website-login",
  "social accounts": "social",
  "social account urls": "social",
  "form email settings": "form-email",
  "brand style": "brand-style",
  "product export (e-commerce only)": "products",
  "third-party integrations": "integrations",
  "blog import (including media)": "blog",
  "recaptcha keys": "recaptcha",
  "legal pages and footer details": "legal",
  redirects: "redirects",
  "smtp information (optional)": "smtp",
  "customer export (e-commerce only)": "customers",
  "order history export (e-commerce only)": "orders",
  "updated product export for launch (e-commerce only)": "products-launch",
};

const RESOURCE_TITLES = new Set(["menu navigation", "product export (e-commerce only)"]);

export function normalizeTitle(title: string) {
  return title.replace(/\s+/g, " ").trim().toLowerCase();
}

export function anchorForTitle(title: string) {
  return ANCHORS[normalizeTitle(title)] ?? slugify(title);
}

export function allowsResourceLink(title: string) {
  return RESOURCE_TITLES.has(normalizeTitle(title));
}

export function slugify(input: string) {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
}

export function makeClientSlug(name: string) {
  const base = slugify(name) || "client";
  const letters = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const all = letters + digits;
  const chars = [
    digits[randomInt(digits.length)],
    all[randomInt(all.length)],
    all[randomInt(all.length)],
    all[randomInt(all.length)],
  ];
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return `${base}-${chars.join("")}`;
}

export function stepsToText(steps: StepBlock[]) {
  return steps
    .map((step) => {
      if (step.type === "heading") return `## ${step.text}`;
      if (step.type === "note") return `> ${step.text.replace(/\n/g, "\n> ")}`;
      return step.text;
    })
    .join("\n");
}

export function textToSteps(text: string): StepBlock[] {
  const blocks: StepBlock[] = [];
  let note: string[] | null = null;
  const flush = () => {
    if (note && note.join("").trim()) {
      blocks.push({ type: "note", text: note.join("\n").trim() });
    }
    note = null;
  };

  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) {
      if (note) note.push("");
      continue;
    }
    if (line.startsWith("##")) {
      flush();
      blocks.push({ type: "heading", text: line.replace(/^##\s*/, "") });
      continue;
    }
    if (line.startsWith(">")) {
      if (!note) note = [];
      note.push(line.replace(/^>\s?/, ""));
      continue;
    }
    flush();
    blocks.push({ type: "step", text: line.replace(/^\d+[.)]\s*/, "") });
  }
  flush();
  return blocks;
}

export function todayInLA() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function formatDate(iso: string | null) {
  if (!iso) return null;
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatTimestamp(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function cleanHttpUrl(value: string): { url: string | null; error?: string } {
  const trimmed = value.trim();
  if (!trimmed) return { url: null };
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return { url: null, error: "Enter a full link starting with https://" };
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return { url: null, error: "Enter a full link starting with https://" };
  }
  return { url: url.toString() };
}

export function isDateInput(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}
