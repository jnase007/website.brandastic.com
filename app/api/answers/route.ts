import { persistAnswers } from "@/lib/save-answers";
import type { Answers } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { itemId?: unknown; answers?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Could not save." }, { status: 400 });
  }
  if (typeof body.itemId !== "string" || !body.answers || typeof body.answers !== "object" || Array.isArray(body.answers)) {
    return Response.json({ error: "Could not save." }, { status: 400 });
  }
  const result = await persistAnswers(body.itemId, body.answers as Answers);
  if (result.error) {
    return Response.json(result, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
