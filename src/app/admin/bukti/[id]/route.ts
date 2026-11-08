import { ambilStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bacaBerkas } from "@/lib/penyimpanan";

// Berkas bukti tidak ada di folder public: hanya admin yang login yang bisa membukanya.
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const staff = await ambilStaff();
  if (!staff || staff.rol !== "ADMIN") return new Response("Tidak diizinkan.", { status: 403 });

  const { id } = await ctx.params;
  const p = await prisma.pengajuan.findUnique({
    where: { id: Number(id) || 0 },
    select: { kode: true, buktiUrl: true },
  });
  if (!p?.buktiUrl) return new Response("Berkas tidak ada.", { status: 404 });

  const berkas = await bacaBerkas(p.buktiUrl);
  if (!berkas) return new Response("Berkas tidak ditemukan.", { status: 404 });

  return new Response(new Uint8Array(berkas.data), {
    headers: {
      "Content-Type": berkas.mime,
      "Content-Disposition": `inline; filename="${p.kode}.${berkas.ekstensi}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}