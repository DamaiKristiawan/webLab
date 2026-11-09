import { bacaGambar } from "@/lib/media";

// Menyajikan foto dan PDF publik. Nama berkas berupa UUID acak dan tidak pernah berubah,
// jadi aman di-cache lama oleh browser.
export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const berkas = await bacaGambar(path.join("/"));
  if (!berkas) return new Response("Tidak ditemukan.", { status: 404 });

  const headers: Record<string, string> = {
    "Content-Type": berkas.mime,
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  };
  if (berkas.mime === "application/pdf") headers["Content-Disposition"] = "inline";

  return new Response(new Uint8Array(berkas.data), { headers });
}