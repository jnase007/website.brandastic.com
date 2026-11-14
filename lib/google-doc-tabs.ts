export type DocTab = { id: string; title: string };

export function googleDocId(url: string) {
  const match = url.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/);
  return match?.[1] ?? null;
}

export async function listGoogleDocTabs(url: string): Promise<DocTab[]> {
  const id = googleDocId(url);
  if (!id) throw new Error("Paste a Google Doc link to pull the page tabs.");

  const response = await fetch(`https://docs.google.com/document/d/${id}/edit`, {
    headers: { "User-Agent": "Mozilla/5.0" },
    redirect: "follow",
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Could not open that Google Doc.");
  const html = await response.text();

  const tabs: DocTab[] = [];
  const seen = new Set<string>();
  const pattern = /\{"ty":"ac","d":\["(t\.[^"]+)",\[1,"((?:\\.|[^"\\])*)"/g;
  for (const match of html.matchAll(pattern)) {
    const tabId = match[1];
    if (seen.has(tabId)) continue;
    seen.add(tabId);
    const title = JSON.parse(`"${match[2]}"`).trim().slice(0, 120);
    if (title) tabs.push({ id: tabId, title });
  }

  if (!tabs.length) {
    throw new Error("No document tabs were found. Share the doc so anyone with the link can view it, then save again.");
  }
  return tabs;
}
