import { revalidatePath } from "next/cache";
import { getSql, ready } from "@/lib/db";
import { readMenuAnswers } from "@/lib/menu";
import type { Answers } from "@/lib/types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function persistAnswers(itemId: string, answers: Answers) {
  await ready();
  const sql = getSql();
  const rows = await sql<{ id: string; slug: string; anchor: string }[]>`
    update client_items i
    set answers = ${sql.json(JSON.parse(JSON.stringify(answers)))}, updated_at = now()
    from clients c
    where i.id = ${itemId}
      and i.client_id = c.id
      and (i.card_type = 'form' or i.anchor = 'menu')
      and i.status in ('not_started', 'needs_changes')
    returning c.id, c.slug, i.anchor
  `;
  const row = rows[0];
  if (!row) return { error: "This item can no longer be edited." };
  if (row.anchor === "menu") await syncRequestedPages(row.id, answers);
  revalidatePath(`/admin/clients/${row.slug}`);
  return {};
}

async function syncRequestedPages(clientId: string, answers: Answers) {
  const { added } = readMenuAnswers(answers);
  const sql = getSql();
  const ids: string[] = [];
  const orderRow = await sql<{ next: number }[]>`
    select coalesce(max(sort_order), 0) as next from content_pages where client_id = ${clientId}
  `;
  let order = orderRow[0]?.next ?? 0;

  for (const row of added) {
    const title = row.title.trim().slice(0, 120);
    if (!title || !UUID.test(row.id)) continue;
    ids.push(row.id);
    const updated = await sql`
      update content_pages
      set title = ${title}, requested = true, updated_at = now()
      where id = ${row.id} and client_id = ${clientId} and requested = true
      returning id
    `;
    if (updated.length) continue;
    const exists = await sql`select 1 from content_pages where id = ${row.id}`;
    if (exists.length) continue;
    order += 1;
    await sql`
      insert into content_pages (id, client_id, title, sort_order, requested)
      values (${row.id}, ${clientId}, ${title}, ${order}, true)
    `;
  }

  const keep = ids.length ? ids : ["00000000-0000-0000-0000-000000000000"];
  await sql`
    delete from content_pages
    where client_id = ${clientId}
      and requested = true
      and status = 'not_started'
      and choice is null
      and not (id::text = any(${keep}))
  `;
}
