"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAdminCookie, passwordsMatch, requireAdmin, setAdminCookie } from "@/lib/auth";
import { getSql, ready } from "@/lib/db";
import { RESERVED_SLUGS } from "@/lib/legacy-channels";
import { getLibraryItem, listLibrary } from "@/lib/queries";
import { cleanHttpUrl, isDateInput, makeClientSlug, slugify, textToSteps } from "@/lib/text";
import type { ItemStatus, LibraryItem } from "@/lib/types";

export type ActionState = { error?: string };

function dateOrNull(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  return isDateInput(text) ? text : null;
}

async function uniqueSlug(name: string) {
  const sql = getSql();
  for (let attempt = 0; attempt < 8; attempt++) {
    const slug = makeClientSlug(name);
    if (RESERVED_SLUGS.has(slug)) continue;
    const existing = await sql`select 1 from clients where slug = ${slug}`;
    if (existing.length === 0) return slug;
  }
  throw new Error("Could not make a unique client link");
}

function snapshot(item: LibraryItem, clientId: string, resourceUrl: string | null) {
  return {
    id: randomUUID(),
    clientId,
    libraryItemId: item.id,
    anchor: item.id,
    title: item.title,
    whatWeNeed: item.whatWeNeed,
    why: item.why,
    steps: item.steps,
    doneLooksLike: item.doneLooksLike,
    phase: item.phase,
    sortOrder: item.sortOrder,
    allowsResourceLink: item.allowsResourceLink,
    resourceUrl: item.allowsResourceLink ? resourceUrl : null,
  };
}

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !process.env.SESSION_SECRET) {
    return { error: "Admin access is not configured yet." };
  }
  const password = String(formData.get("password") ?? "");
  if (!passwordsMatch(password, expected)) return { error: "That password doesn’t match." };
  await setAdminCookie();
  redirect("/onboarding/admin");
}

export async function logout() {
  await clearAdminCookie();
  redirect("/onboarding/admin/login");
}

export async function createClient(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  await ready();
  const name = String(formData.get("name") ?? "").trim();
  const preset = String(formData.get("preset") ?? "");
  if (!name) return { error: "Enter the client name." };
  if (preset !== "A" && preset !== "B" && preset !== "C") return { error: "Choose a preset." };

  const drive = cleanHttpUrl(String(formData.get("driveUrl") ?? ""));
  if (drive.error) return { error: `Google Drive link: ${drive.error}` };
  const due1 = dateOrNull(formData.get("due1"));
  const due2 = dateOrNull(formData.get("due2"));
  const due3 = dateOrNull(formData.get("due3"));
  if (String(formData.get("due1") ?? "").trim() && !due1) return { error: "Phase 1 due date is not a real date." };
  if (String(formData.get("due2") ?? "").trim() && !due2) return { error: "Phase 2 due date is not a real date." };
  if (String(formData.get("due3") ?? "").trim() && !due3) return { error: "Phase 3 due date is not a real date." };

  const selected = new Set(formData.getAll("item").map(String));
  if (selected.size === 0) return { error: "Choose at least one item." };
  const library = await listLibrary();
  const chosen = library.filter((item) => selected.has(item.id));
  if (chosen.length === 0) return { error: "Choose at least one item." };

  for (const item of chosen) {
    if (!item.allowsResourceLink) continue;
    const link = cleanHttpUrl(String(formData.get(`resource_${item.id}`) ?? ""));
    if (link.error) return { error: `${item.title}: ${link.error}` };
  }

  const sql = getSql();
  const clientId = randomUUID();
  const slug = await uniqueSlug(name);
  await sql.begin(async (tx) => {
    await tx`
      insert into clients (id, name, slug, preset, drive_url, due_phase_1, due_phase_2, due_phase_3)
      values (${clientId}, ${name}, ${slug}, ${preset}, ${drive.url}, ${due1}, ${due2}, ${due3})
    `;
    for (const item of chosen) {
      const link = item.allowsResourceLink
        ? cleanHttpUrl(String(formData.get(`resource_${item.id}`) ?? "")).url
        : null;
      const row = snapshot(item, clientId, link);
      await tx`
        insert into client_items (
          id, client_id, library_item_id, anchor, title, what_we_need, why, steps, done_looks_like,
          phase, sort_order, allows_resource_link, resource_url
        ) values (
          ${row.id}, ${row.clientId}, ${row.libraryItemId}, ${row.anchor}, ${row.title}, ${row.whatWeNeed},
          ${row.why}, ${tx.json(row.steps)}, ${row.doneLooksLike}, ${row.phase}, ${row.sortOrder},
          ${row.allowsResourceLink}, ${row.resourceUrl}
        )
      `;
    }
  });

  revalidatePath("/onboarding/admin");
  redirect(`/onboarding/admin/clients/${slug}?created=1`);
}

export async function updateClient(formData: FormData) {
  await requireAdmin();
  await ready();
  const slug = String(formData.get("slug") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const drive = cleanHttpUrl(String(formData.get("driveUrl") ?? ""));
  if (!name) redirect(`/onboarding/admin/clients/${slug}?error=${encodeURIComponent("Enter the client name.")}`);
  if (drive.error) redirect(`/onboarding/admin/clients/${slug}?error=${encodeURIComponent(drive.error)}`);
  const due1 = dateOrNull(formData.get("due1"));
  const due2 = dateOrNull(formData.get("due2"));
  const due3 = dateOrNull(formData.get("due3"));
  await getSql()`
    update clients
    set name = ${name}, drive_url = ${drive.url}, due_phase_1 = ${due1}, due_phase_2 = ${due2}, due_phase_3 = ${due3}
    where slug = ${slug}
  `;
  revalidatePath("/onboarding/admin");
  revalidatePath(`/onboarding/admin/clients/${slug}`);
  revalidatePath(`/onboarding/${slug}`);
  redirect(`/onboarding/admin/clients/${slug}`);
}

export async function addClientItem(formData: FormData) {
  await requireAdmin();
  await ready();
  const slug = String(formData.get("slug") ?? "");
  const libraryId = String(formData.get("libraryId") ?? "");
  const item = await getLibraryItem(libraryId);
  if (!item) redirect(`/onboarding/admin/clients/${slug}?error=${encodeURIComponent("That item is no longer in the library.")}`);
  const link = cleanHttpUrl(String(formData.get("resourceUrl") ?? ""));
  if (link.error) redirect(`/onboarding/admin/clients/${slug}?error=${encodeURIComponent(link.error)}`);

  const sql = getSql();
  const clients = await sql<{ id: string }[]>`select id from clients where slug = ${slug}`;
  const client = clients[0];
  if (!client) redirect("/onboarding/admin");
  const existing = await sql`select 1 from client_items where client_id = ${client.id} and anchor = ${item.id}`;
  if (existing.length) {
    redirect(`/onboarding/admin/clients/${slug}?error=${encodeURIComponent("That item is already on this client.")}`);
  }
  const row = snapshot(item, client.id, item.allowsResourceLink ? link.url : null);
  await sql`
    insert into client_items (
      id, client_id, library_item_id, anchor, title, what_we_need, why, steps, done_looks_like,
      phase, sort_order, allows_resource_link, resource_url
    ) values (
      ${row.id}, ${row.clientId}, ${row.libraryItemId}, ${row.anchor}, ${row.title}, ${row.whatWeNeed},
      ${row.why}, ${sql.json(row.steps)}, ${row.doneLooksLike}, ${row.phase}, ${row.sortOrder},
      ${row.allowsResourceLink}, ${row.resourceUrl}
    )
  `;
  revalidatePath(`/onboarding/admin/clients/${slug}`);
  revalidatePath(`/onboarding/${slug}`);
  revalidatePath("/onboarding/admin");
  redirect(`/onboarding/admin/clients/${slug}`);
}

export async function removeClientItem(formData: FormData) {
  await requireAdmin();
  await ready();
  const slug = String(formData.get("slug") ?? "");
  const itemId = String(formData.get("itemId") ?? "");
  await getSql()`
    delete from client_items
    where id = ${itemId}
      and client_id = (select id from clients where slug = ${slug})
  `;
  revalidatePath(`/onboarding/admin/clients/${slug}`);
  revalidatePath(`/onboarding/${slug}`);
  revalidatePath("/onboarding/admin");
}

export async function updateResourceUrl(formData: FormData) {
  await requireAdmin();
  await ready();
  const slug = String(formData.get("slug") ?? "");
  const itemId = String(formData.get("itemId") ?? "");
  const link = cleanHttpUrl(String(formData.get("resourceUrl") ?? ""));
  if (link.error) redirect(`/onboarding/admin/clients/${slug}?error=${encodeURIComponent(link.error)}`);
  await getSql()`
    update client_items
    set resource_url = ${link.url}, updated_at = now()
    where id = ${itemId}
      and allows_resource_link = true
      and client_id = (select id from clients where slug = ${slug})
  `;
  revalidatePath(`/onboarding/admin/clients/${slug}`);
  revalidatePath(`/onboarding/${slug}`);
  redirect(`/onboarding/admin/clients/${slug}#${String(formData.get("anchor") ?? "")}`);
}

async function clientSlugForItem(itemId: string) {
  const rows = await getSql()<{ slug: string }[]>`
    select c.slug
    from client_items i
    join clients c on c.id = i.client_id
    where i.id = ${itemId}
  `;
  return rows[0]?.slug ?? null;
}

export async function markSent(formData: FormData) {
  await ready();
  const itemId = String(formData.get("itemId") ?? "");
  await getSql()`
    update client_items
    set status = 'sent', sent_at = now(), updated_at = now()
    where id = ${itemId} and status in ('not_started', 'needs_changes')
  `;
  const slug = await clientSlugForItem(itemId);
  if (!slug) return;
  revalidatePath(`/onboarding/${slug}`);
  revalidatePath(`/onboarding/admin/clients/${slug}`);
  revalidatePath("/onboarding/admin");
}

export async function markReceived(formData: FormData) {
  await requireAdmin();
  await ready();
  const itemId = String(formData.get("itemId") ?? "");
  await getSql()`
    update client_items
    set status = 'received', note = null, updated_at = now()
    where id = ${itemId}
  `;
  const slug = await clientSlugForItem(itemId);
  if (!slug) return;
  revalidatePath(`/onboarding/${slug}`);
  revalidatePath(`/onboarding/admin/clients/${slug}`);
  revalidatePath("/onboarding/admin");
}

export async function markNeedsChanges(formData: FormData) {
  await requireAdmin();
  await ready();
  const itemId = String(formData.get("itemId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  if (!note) {
    redirect(`/onboarding/admin/clients/${slug}?error=${encodeURIComponent("Add a short note about what needs to change.")}`);
  }
  await getSql()`
    update client_items
    set status = 'needs_changes', note = ${note.slice(0, 2000)}, updated_at = now()
    where id = ${itemId}
  `;
  const pathSlug = (await clientSlugForItem(itemId)) ?? slug;
  revalidatePath(`/onboarding/${pathSlug}`);
  revalidatePath(`/onboarding/admin/clients/${pathSlug}`);
  revalidatePath("/onboarding/admin");
  redirect(`/onboarding/admin/clients/${pathSlug}#${String(formData.get("anchor") ?? "")}`);
}

function libraryFields(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const whatWeNeed = String(formData.get("what") ?? "").trim();
  const why = String(formData.get("why") ?? "").trim();
  const doneLooksLike = String(formData.get("done") ?? "").trim();
  const phase = Number(formData.get("phase"));
  const presets = formData.getAll("preset").map(String).filter((preset): preset is "A" | "B" | "C" => preset === "A" || preset === "B" || preset === "C");
  const steps = textToSteps(String(formData.get("steps") ?? ""));
  const offByDefault = formData.get("off") === "on";
  const allowsResource = formData.get("resource") === "on";
  if (!title) return { error: "Enter a title." };
  if (!whatWeNeed) return { error: "Enter what we need." };
  if (!why) return { error: "Enter why we need it." };
  if (!doneLooksLike) return { error: "Enter what done looks like." };
  if (phase !== 1 && phase !== 2 && phase !== 3) return { error: "Choose a phase." };
  if (!presets.length) return { error: "Choose at least one preset." };
  if (!steps.some((step) => step.type === "step")) return { error: "Add at least one step." };
  return { title, whatWeNeed, why, doneLooksLike, phase: phase as 1 | 2 | 3, presets, steps, offByDefault, allowsResource };
}

async function freshAnchor(title: string) {
  const sql = getSql();
  const base = slugify(title) || "item";
  let id = base;
  let n = 2;
  while (n < 50) {
    const taken = await sql`select 1 from library_items where id = ${id}`;
    if (!taken.length && !RESERVED_SLUGS.has(id)) return id;
    id = `${base}-${n}`;
    n += 1;
  }
  return `${base}-${randomUUID().slice(0, 8)}`;
}

export async function saveLibraryItem(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  await ready();
  const parsed = libraryFields(formData);
  if ("error" in parsed) return parsed;
  const sql = getSql();
  const existingId = String(formData.get("id") ?? "").trim();

  if (existingId) {
    await sql`
      update library_items set
        title = ${parsed.title},
        what_we_need = ${parsed.whatWeNeed},
        why = ${parsed.why},
        steps = ${sql.json(parsed.steps)},
        done_looks_like = ${parsed.doneLooksLike},
        phase = ${parsed.phase},
        presets = ${sql.array(parsed.presets)},
        off_by_default = ${parsed.offByDefault},
        allows_resource_link = ${parsed.allowsResource},
        updated_at = now()
      where id = ${existingId}
    `;
  } else {
    const id = await freshAnchor(parsed.title);
    const order = await sql<{ next: number }[]>`select coalesce(max(sort_order), 0) + 1 as next from library_items`;
    await sql`
      insert into library_items (
        id, title, what_we_need, why, steps, done_looks_like, phase, presets,
        off_by_default, allows_resource_link, sort_order
      ) values (
        ${id}, ${parsed.title}, ${parsed.whatWeNeed}, ${parsed.why}, ${sql.json(parsed.steps)},
        ${parsed.doneLooksLike}, ${parsed.phase}, ${sql.array(parsed.presets)},
        ${parsed.offByDefault}, ${parsed.allowsResource}, ${order[0]?.next ?? 1}
      )
    `;
  }

  revalidatePath("/onboarding/admin/library");
  revalidatePath("/onboarding/admin/new");
  redirect("/onboarding/admin/library");
}

export async function deleteLibraryItem(formData: FormData) {
  await requireAdmin();
  await ready();
  const id = String(formData.get("id") ?? "");
  await getSql()`delete from library_items where id = ${id}`;
  revalidatePath("/onboarding/admin/library");
  revalidatePath("/onboarding/admin/new");
  redirect("/onboarding/admin/library");
}

async function clientSlug(clientId: string) {
  const rows = await getSql()<{ slug: string }[]>`select slug from clients where id = ${clientId}`;
  return rows[0]?.slug ?? null;
}

async function syncWebsiteContent(clientId: string) {
  const sql = getSql();
  const pages = await sql<{ status: ItemStatus }[]>`select status from content_pages where client_id = ${clientId}`;
  let status: ItemStatus = "not_started";
  if (pages.length > 0 && pages.every((page) => page.status === "received")) status = "received";
  else if (pages.some((page) => page.status === "needs_changes")) status = "needs_changes";
  else if (pages.length > 0 && pages.every((page) => page.status === "sent" || page.status === "received")) status = "sent";
  await sql`
    update client_items
    set status = ${status}, note = null, updated_at = now()
    where client_id = ${clientId} and anchor = 'website-content'
  `;
}

function revalidateClient(slug: string) {
  revalidatePath("/onboarding/admin");
  revalidatePath(`/onboarding/admin/clients/${slug}`);
  revalidatePath(`/onboarding/${slug}`);
}

export async function saveContentDocUrl(formData: FormData) {
  await requireAdmin();
  await ready();
  const slug = String(formData.get("slug") ?? "");
  const link = cleanHttpUrl(String(formData.get("contentDocUrl") ?? ""));
  if (link.error) redirect(`/onboarding/admin/clients/${slug}?error=${encodeURIComponent(`Content doc: ${link.error}`)}`);
  await getSql()`update clients set content_doc_url = ${link.url} where slug = ${slug}`;
  revalidateClient(slug);
  redirect(`/onboarding/admin/clients/${slug}`);
}

export async function addContentPage(formData: FormData) {
  await requireAdmin();
  await ready();
  const slug = String(formData.get("slug") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!title) redirect(`/onboarding/admin/clients/${slug}?error=${encodeURIComponent("Enter a page name.")}`);
  const sql = getSql();
  const clients = await sql<{ id: string }[]>`select id from clients where slug = ${slug}`;
  const client = clients[0];
  if (!client) redirect("/onboarding/admin");
  const order = await sql<{ next: number }[]>`select coalesce(max(sort_order), 0) + 1 as next from content_pages where client_id = ${client.id}`;
  await sql`
    insert into content_pages (id, client_id, title, sort_order)
    values (${randomUUID()}, ${client.id}, ${title.slice(0, 120)}, ${order[0]?.next ?? 1})
  `;
  await syncWebsiteContent(client.id);
  revalidateClient(slug);
  redirect(`/onboarding/admin/clients/${slug}`);
}

export async function removeContentPage(formData: FormData) {
  await requireAdmin();
  await ready();
  const slug = String(formData.get("slug") ?? "");
  const pageId = String(formData.get("pageId") ?? "");
  const sql = getSql();
  const rows = await sql<{ client_id: string }[]>`delete from content_pages where id = ${pageId} returning client_id`;
  if (rows[0]) await syncWebsiteContent(rows[0].client_id);
  revalidateClient(slug);
  redirect(`/onboarding/admin/clients/${slug}`);
}

export async function chooseContentPage(formData: FormData) {
  await ready();
  const pageId = String(formData.get("pageId") ?? "");
  const choice = String(formData.get("choice") ?? "");
  if (choice !== "in_doc" && choice !== "current_site") return;
  const sql = getSql();
  const rows = await sql<{ client_id: string }[]>`
    update content_pages
    set choice = ${choice}, status = 'sent', sent_at = now(), note = null, updated_at = now()
    where id = ${pageId} and status <> 'received'
    returning client_id
  `;
  const clientId = rows[0]?.client_id;
  if (!clientId) return;
  await syncWebsiteContent(clientId);
  const slug = await clientSlug(clientId);
  if (slug) revalidateClient(slug);
}

export async function markPageReceived(formData: FormData) {
  await requireAdmin();
  await ready();
  const slug = String(formData.get("slug") ?? "");
  const pageId = String(formData.get("pageId") ?? "");
  const sql = getSql();
  const rows = await sql<{ client_id: string }[]>`
    update content_pages
    set status = 'received', note = null, updated_at = now()
    where id = ${pageId}
    returning client_id
  `;
  if (rows[0]) await syncWebsiteContent(rows[0].client_id);
  revalidateClient(slug);
  redirect(`/onboarding/admin/clients/${slug}`);
}

export async function markPageNeedsChanges(formData: FormData) {
  await requireAdmin();
  await ready();
  const slug = String(formData.get("slug") ?? "");
  const pageId = String(formData.get("pageId") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  if (!note) redirect(`/onboarding/admin/clients/${slug}?error=${encodeURIComponent("Add a short note about what needs to change.")}`);
  const sql = getSql();
  const rows = await sql<{ client_id: string }[]>`
    update content_pages
    set status = 'needs_changes', note = ${note.slice(0, 2000)}, updated_at = now()
    where id = ${pageId}
    returning client_id
  `;
  if (rows[0]) await syncWebsiteContent(rows[0].client_id);
  revalidateClient(slug);
  redirect(`/onboarding/admin/clients/${slug}`);
}
