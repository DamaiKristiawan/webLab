import { ambilStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { filterHasil } from "@/lib/hasil-tes";

const WIB = 7 * 60 * 60 * 1000;

function sel(nilai: string | number) {
  let s = String(nilai);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replaceAll('"', '""')}"`;
}

export async function GET(req: Request) {
  const staff = await ambilStaff();
  if (!staff) return new Response("Tidak diizinkan.", { status: 403 });

  const p = new URL(req.url).searchParams;
  const { where } = filterHasil({
    praktikum: p.get("praktikum") ?? undefined,
    jenis: p.get("jenis") ?? undefined,
    q: p.get("q") ?? undefined,
  });

  const baris = await prisma.hasilTes.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 5000,
    include: {
      tes: {
        select: {
          jenis: true,
          judulPraktikum: { select: { urutan: true, judul: true, praktikum: { select: { nama: true } } } },
        },
      },
    },
  });

  const isi = [
    ["Waktu (WIB)", "Nama", "NPM", "Praktikum", "Judul", "Jenis", "Skor", "Benar", "Jumlah soal", "Lewat waktu"]
      .map(sel)
      .join(";"),
    ...baris.map((h) =>
      [
        new Date(h.createdAt.getTime() + WIB).toISOString().slice(0, 16).replace("T", " "),
        h.namaPeserta,
        h.npm,
        h.tes.judulPraktikum.praktikum.nama,
        `Judul ${h.tes.judulPraktikum.urutan}: ${h.tes.judulPraktikum.judul}`,
        h.tes.jenis === "POSTEST" ? "Postest" : "Pretest",
        String(h.skor).replace(".", ","),
        h.jumlahBenar,
        h.jumlahSoal,
        h.terlambat ? "Ya" : "Tidak",
      ]
        .map(sel)
        .join(";"),
    ),
  ].join("\r\n");

  const tgl = new Date(Date.now() + WIB).toISOString().slice(0, 10).replaceAll("-", "");
  return new Response("\uFEFF" + isi, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="hasil-tes-${tgl}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
