import { getSql, ready } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await ready();
  const rows = await getSql()<{ filename: string; mime: string; bytes: Buffer }[]>`
    select filename, mime, bytes from client_files where id = ${id}
  `;
  const file = rows[0];
  if (!file) return new Response("Not found", { status: 404 });
  const filename = file.filename.replace(/["\r\n]/g, "");
  return new Response(new Uint8Array(file.bytes), {
    headers: {
      "Content-Type": file.mime || "application/octet-stream",
      "Content-Disposition": `inline; filename="${filename}"`,
      "X-Robots-Tag": "noindex",
    },
  });
}
