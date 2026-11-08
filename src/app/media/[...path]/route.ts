import { bacaGambar } from "@/lib/media";

// Menyajikan foto dokumentasi. Nama berkas berupa UUID acak dan tidak pernah berubah,
// jadi aman di-cache lama oleh browser.
export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const foto = await bacaGambar(path.join("/"));
  if (!foto) return new Response("Tidak ditemukan.", { status: 404 });

  return new Response(new Uint8Array(foto.data), {
    headers: {
      "Content-Type": foto.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}