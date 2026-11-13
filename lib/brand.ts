export const SANDY_EMAIL = "sandy@brandastic.com";

export const LOGO_SRC =
  "https://brandastic.com/wp-content/uploads/2025/10/Brandastic_black_logo-5.png";

export const PHASES = [
  { id: 1, label: "Phase 1 — Design" },
  { id: 2, label: "Phase 2 — Development" },
  { id: 3, label: "Phase 3 — QA & Launch" },
] as const;

export const PRESETS = [
  {
    id: "A",
    label: "WordPress brochure",
    hint: "A marketing website, no online store",
  },
  {
    id: "B",
    label: "WordPress + e-commerce",
    hint: "WordPress with an online store, such as WooCommerce",
  },
  {
    id: "C",
    label: "Shopify",
    hint: "A Shopify store",
  },
] as const;

export type PresetId = (typeof PRESETS)[number]["id"];
export type PhaseId = (typeof PHASES)[number]["id"];

export function helpMailto(clientName?: string) {
  const subject = clientName
    ? `Website intake help — ${clientName}`
    : "Website intake help";
  return `mailto:${SANDY_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

export function presetLabel(id: string) {
  return PRESETS.find((preset) => preset.id === id)?.label ?? id;
}
