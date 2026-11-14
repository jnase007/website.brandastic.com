import type { CardType, FormField, FormSchema } from "@/lib/types";

const SOCIAL = ["Facebook", "Instagram", "LinkedIn", "X", "YouTube", "TikTok", "Pinterest", "Google Business Profile"];

const FORMS: Record<string, FormSchema> = {
  "brand-style": {
    fields: [
      {
        kind: "repeat",
        name: "sites",
        addLabel: "Add a site",
        min: 3,
        max: 3,
        fields: [
          { kind: "url", name: "url", label: "Site you like", required: true },
          { kind: "text", name: "why", label: "Why you like it", required: true },
        ],
      },
      {
        kind: "text",
        name: "words",
        label: "3 words that describe your brand",
        required: true,
        help: "Separate the three words with commas.",
      },
      { kind: "textarea", name: "avoid", label: "Anything to avoid" },
    ],
  },
  brand: {
    fields: [{ kind: "colors", name: "colors", max: 5, orName: "useLogo", orLabel: "Use our logo colors" }],
  },
  "form-email": {
    fields: [
      {
        kind: "repeat",
        name: "forms",
        addLabel: "Add a form",
        min: 1,
        fields: [
          { kind: "text", name: "name", label: "Form name", required: true },
          {
            kind: "email",
            name: "sendTo",
            label: "Send-to email(s)",
            required: true,
            help: "Separate more than one address with a comma.",
          },
        ],
      },
      {
        kind: "email",
        name: "fromEmail",
        label: "From email",
        required: true,
        help: "Usually matches your sending mailbox, e.g. info@yourcompany.com",
      },
      { kind: "note", text: "Replies go to the person who filled out the form." },
      {
        kind: "group",
        label: "Email sending",
        presets: ["A", "B"],
        fields: [
          {
            kind: "select",
            name: "provider",
            label: "Email provider",
            required: true,
            options: ["Microsoft 365", "Google Workspace", "Other", "Not sure"],
          },
          { kind: "email", name: "mailbox", label: "Sending mailbox", required: true },
          { kind: "text", name: "itName", label: "IT contact name" },
          { kind: "email", name: "itEmail", label: "IT contact email" },
        ],
      },
    ],
  },
  social: {
    fields: SOCIAL.map((label) => ({ kind: "url-na" as const, name: label.toLowerCase().replace(/\s+/g, "-"), label })),
  },
  integrations: {
    fields: [
      { kind: "checkbox", name: "none", label: "We don't have any tools to connect" },
      {
        kind: "repeat",
        name: "tools",
        addLabel: "Add a tool",
        fields: [
          { kind: "text", name: "name", label: "Tool name", required: true },
          { kind: "text", name: "use", label: "What it's used for", required: true },
          { kind: "checkbox", name: "access", label: "I sent access" },
        ],
      },
    ],
  },
};

export function formSchemaFor(anchor: string, cardType: CardType): FormSchema | null {
  if (cardType !== "form") return null;
  return FORMS[anchor] ?? null;
}

export function schemaForPreset(schema: FormSchema | null, preset: "A" | "B" | "C"): FormSchema | null {
  if (!schema) return null;
  return { fields: filterFields(schema.fields, preset) };
}

function filterFields(fields: FormField[], preset: "A" | "B" | "C"): FormField[] {
  const kept: FormField[] = [];
  for (const field of fields) {
    if (field.kind === "group") {
      if (field.presets && !field.presets.includes(preset)) continue;
      kept.push({ ...field, fields: filterFields(field.fields, preset) });
      continue;
    }
    kept.push(field);
  }
  return kept;
}
