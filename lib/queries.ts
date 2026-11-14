import { getSql, ready } from "@/lib/db";
import { todayInLA } from "@/lib/text";
import type { Answers, CardType, ClientItem, ClientRecord, ClientStats, ContentPage, FormSchema, ItemFile, ItemStatus, LibraryItem, PageChoice, StepBlock } from "@/lib/types";

function asSteps(value: unknown): StepBlock[] {
  if (!Array.isArray(value)) return [];
  return value.filter((step): step is StepBlock => {
    if (!step || typeof step !== "object") return false;
    const block = step as StepBlock;
    return (block.type === "step" || block.type === "heading" || block.type === "note") && typeof block.text === "string";
  });
}

function asPhase(value: number): 1 | 2 | 3 {
  return value === 2 || value === 3 ? value : 1;
}

function asCardType(value: string | null): CardType {
  return value === "form" || value === "file" ? value : "sent";
}

function asSchema(value: unknown): FormSchema | null {
  if (!value || typeof value !== "object" || !Array.isArray((value as FormSchema).fields)) return null;
  return value as FormSchema;
}

function asAnswers(value: unknown): Answers {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Answers) : {};
}

function asPreset(value: string): "A" | "B" | "C" {
  return value === "B" || value === "C" ? value : "A";
}

type LibraryRow = {
  id: string;
  title: string;
  what_we_need: string;
  why: string;
  steps: unknown;
  done_looks_like: string;
  phase: number;
  presets: string[];
  off_by_default: boolean;
  allows_resource_link: boolean;
  sort_order: number;
  card_type: string | null;
  form_schema: unknown;
  file_folder: string | null;
};

function mapLibrary(row: LibraryRow): LibraryItem {
  return {
    id: row.id,
    title: row.title,
    whatWeNeed: row.what_we_need,
    why: row.why,
    steps: asSteps(row.steps),
    doneLooksLike: row.done_looks_like,
    phase: asPhase(row.phase),
    presets: (row.presets ?? []).filter((preset): preset is "A" | "B" | "C" => preset === "A" || preset === "B" || preset === "C"),
    offByDefault: row.off_by_default,
    allowsResourceLink: row.allows_resource_link,
    sortOrder: row.sort_order,
    cardType: asCardType(row.card_type),
    formSchema: asSchema(row.form_schema),
    fileFolder: row.file_folder,
  };
}

type ClientRow = {
  id: string;
  name: string;
  slug: string;
  preset: string;
  drive_url: string | null;
  due_phase_1: string | null;
  due_phase_2: string | null;
  due_phase_3: string | null;
  content_doc_url: string | null;
  created_at: Date | string;
};

function mapClient(row: ClientRow): ClientRecord {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    preset: asPreset(row.preset),
    driveUrl: row.drive_url,
    duePhase1: row.due_phase_1 ? String(row.due_phase_1).slice(0, 10) : null,
    duePhase2: row.due_phase_2 ? String(row.due_phase_2).slice(0, 10) : null,
    duePhase3: row.due_phase_3 ? String(row.due_phase_3).slice(0, 10) : null,
    contentDocUrl: row.content_doc_url,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

type ItemRow = {
  id: string;
  client_id: string;
  library_item_id: string | null;
  anchor: string;
  title: string;
  what_we_need: string;
  why: string;
  steps: unknown;
  done_looks_like: string;
  phase: number;
  sort_order: number;
  allows_resource_link: boolean;
  resource_url: string | null;
  status: ItemStatus;
  sent_at: Date | string | null;
  note: string | null;
  card_type: string | null;
  form_schema: unknown;
  file_folder: string | null;
  answers: unknown;
};

function mapItem(row: ItemRow, files: ItemFile[] = []): ClientItem {
  return {
    id: row.id,
    clientId: row.client_id,
    libraryItemId: row.library_item_id,
    anchor: row.anchor,
    title: row.title,
    whatWeNeed: row.what_we_need,
    why: row.why,
    steps: asSteps(row.steps),
    doneLooksLike: row.done_looks_like,
    phase: asPhase(row.phase),
    sortOrder: row.sort_order,
    allowsResourceLink: row.allows_resource_link,
    resourceUrl: row.resource_url,
    status: row.status,
    sentAt: row.sent_at ? new Date(row.sent_at).toISOString() : null,
    note: row.note,
    cardType: asCardType(row.card_type),
    formSchema: asSchema(row.form_schema),
    fileFolder: row.file_folder,
    answers: asAnswers(row.answers),
    files,
  };
}

export async function listLibrary() {
  await ready();
  const rows = await getSql()<LibraryRow[]>`
    select * from library_items order by phase, sort_order, title
  `;
  return rows.map(mapLibrary);
}

export async function getLibraryItem(id: string) {
  await ready();
  const rows = await getSql()<LibraryRow[]>`select * from library_items where id = ${id}`;
  return rows[0] ? mapLibrary(rows[0]) : null;
}

export async function getClientBySlug(slug: string) {
  await ready();
  const rows = await getSql()<ClientRow[]>`select * from clients where slug = ${slug}`;
  return rows[0] ? mapClient(rows[0]) : null;
}

function asChoice(value: string | null): PageChoice | null {
  return value === "in_doc" || value === "current_site" ? value : null;
}

export async function listContentPages(clientId: string) {
  await ready();
  const rows = await getSql()<
    {
      id: string;
      client_id: string;
      title: string;
      sort_order: number;
      choice: string | null;
      status: ItemStatus;
      note: string | null;
      requested: boolean;
    }[]
  >`
    select id, client_id, title, sort_order, choice, status, note, requested
    from content_pages
    where client_id = ${clientId}
    order by sort_order, title
  `;
  return rows.map(
    (row): ContentPage => ({
      id: row.id,
      clientId: row.client_id,
      title: row.title,
      sortOrder: row.sort_order,
      choice: asChoice(row.choice),
      status: row.status,
      note: row.note,
      requested: row.requested,
    }),
  );
}

export async function listClientItems(clientId: string) {
  await ready();
  const sql = getSql();
  const rows = await sql<ItemRow[]>`
    select * from client_items where client_id = ${clientId} order by phase, sort_order, title
  `;
  const files = await sql<{ id: string; client_item_id: string; filename: string }[]>`
    select f.id, f.client_item_id, f.filename
    from client_files f
    join client_items i on i.id = f.client_item_id
    where i.client_id = ${clientId}
    order by f.created_at
  `;
  return rows.map((row) =>
    mapItem(
      row,
      files.filter((file) => file.client_item_id === row.id).map((file) => ({ id: file.id, filename: file.filename })),
    ),
  );
}

export async function listClientsWithStats(): Promise<ClientStats[]> {
  await ready();
  const sql = getSql();
  const clients = await sql<ClientRow[]>`select * from clients order by created_at desc`;
  const items = await sql<{ client_id: string; phase: number; status: ItemStatus }[]>`
    select client_id, phase, status from client_items
  `;
  const today = todayInLA();

  return clients.map((row) => {
    const client = mapClient(row);
    const mine = items.filter((item) => item.client_id === client.id);
    const overduePhases = [1, 2, 3].filter((phase) => {
      const due = phase === 1 ? client.duePhase1 : phase === 2 ? client.duePhase2 : client.duePhase3;
      if (!due || due >= today) return false;
      const inPhase = mine.filter((item) => item.phase === phase);
      return inPhase.some((item) => item.status !== "received");
    });
    return {
      ...client,
      total: mine.length,
      received: mine.filter((item) => item.status === "received").length,
      waitingClient: mine.filter((item) => item.status === "not_started" || item.status === "needs_changes").length,
      waitingSandy: mine.filter((item) => item.status === "sent").length,
      overduePhases,
    };
  });
}

export function dueForPhase(client: ClientRecord, phase: 1 | 2 | 3) {
  if (phase === 1) return client.duePhase1;
  if (phase === 2) return client.duePhase2;
  return client.duePhase3;
}

export function currentPhase(items: ClientItem[]) {
  for (const phase of [1, 2, 3] as const) {
    const inPhase = items.filter((item) => item.phase === phase);
    if (inPhase.length && inPhase.some((item) => item.status !== "received")) return phase;
  }
  const present = [1, 2, 3].filter((phase) => items.some((item) => item.phase === phase));
  return (present.at(-1) ?? 1) as 1 | 2 | 3;
}
