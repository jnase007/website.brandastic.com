import { readFile } from "fs/promises";
import path from "path";
import postgres from "postgres";
import { parseLibrary } from "@/lib/parse-library";

const globalForSql = globalThis as unknown as { intakeSql?: ReturnType<typeof postgres> };

export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  if (!globalForSql.intakeSql) {
    globalForSql.intakeSql = postgres(url, {
      ssl: "require",
      prepare: false,
      max: 1,
      idle_timeout: 20,
      onnotice: () => {},
      types: {
        date: {
          to: 1082,
          from: [1082],
          serialize: (value: string) => value,
          parse: (value: string) => value,
        },
      },
    });
  }
  return globalForSql.intakeSql;
}

let readyPromise: Promise<void> | null = null;

export function ready() {
  if (!readyPromise) {
    readyPromise = setup().catch((error) => {
      readyPromise = null;
      throw error;
    });
  }
  return readyPromise;
}

async function setup() {
  const sql = getSql();
  await sql`
    create table if not exists library_items (
      id text primary key,
      title text not null,
      what_we_need text not null,
      why text not null,
      steps jsonb not null,
      done_looks_like text not null,
      phase integer not null check (phase in (1, 2, 3)),
      presets text[] not null,
      off_by_default boolean not null default false,
      allows_resource_link boolean not null default false,
      sort_order integer not null,
      updated_at timestamptz not null default now()
    )
  `;
  await sql`
    create table if not exists clients (
      id uuid primary key,
      name text not null,
      slug text not null unique,
      preset text not null check (preset in ('A', 'B', 'C')),
      drive_url text,
      due_phase_1 date,
      due_phase_2 date,
      due_phase_3 date,
      created_at timestamptz not null default now()
    )
  `;
  await sql`
    create table if not exists client_items (
      id uuid primary key,
      client_id uuid not null references clients(id) on delete cascade,
      library_item_id text,
      anchor text not null,
      title text not null,
      what_we_need text not null,
      why text not null,
      steps jsonb not null,
      done_looks_like text not null,
      phase integer not null check (phase in (1, 2, 3)),
      sort_order integer not null,
      allows_resource_link boolean not null default false,
      resource_url text,
      status text not null default 'not_started' check (status in ('not_started', 'sent', 'received', 'needs_changes')),
      sent_at timestamptz,
      note text,
      updated_at timestamptz not null default now(),
      unique (client_id, anchor)
    )
  `;
  await sql`create index if not exists client_items_client_id_idx on client_items (client_id)`;
  await sql`alter table clients add column if not exists content_doc_url text`;
  await sql`
    create table if not exists content_pages (
      id uuid primary key,
      client_id uuid not null references clients(id) on delete cascade,
      title text not null,
      sort_order integer not null,
      choice text check (choice in ('in_doc', 'current_site')),
      status text not null default 'not_started' check (status in ('not_started', 'sent', 'received', 'needs_changes')),
      sent_at timestamptz,
      note text,
      updated_at timestamptz not null default now()
    )
  `;
  await sql`create index if not exists content_pages_client_id_idx on content_pages (client_id)`;

  const existing = await sql<{ count: string }[]>`select count(*)::text as count from library_items`;
  if (existing[0]?.count !== "0") return;

  const markdown = await readFile(path.join(process.cwd(), "item-library.md"), "utf8");
  const items = parseLibrary(markdown);
  if (items.length !== 25) {
    throw new Error(`Expected 25 library items from item-library.md, parsed ${items.length}`);
  }

  await sql.begin(async (tx) => {
    for (const item of items) {
      await tx`
        insert into library_items (
          id, title, what_we_need, why, steps, done_looks_like, phase, presets,
          off_by_default, allows_resource_link, sort_order
        ) values (
          ${item.id},
          ${item.title},
          ${item.whatWeNeed},
          ${item.why},
          ${tx.json(item.steps)},
          ${item.doneLooksLike},
          ${item.phase},
          ${tx.array(item.presets)},
          ${item.offByDefault},
          ${item.allowsResourceLink},
          ${item.sortOrder}
        )
        on conflict (id) do nothing
      `;
    }
  });
}
