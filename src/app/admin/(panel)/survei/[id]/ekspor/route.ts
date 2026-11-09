import { ambilStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buatXlsx, type SelXlsx } from "@/lib/xlsx";

const WIB = 7 * 60 * 60 * 1000;

// Sel CSV yang diawali = + - @ bisa dibaca Excel sebagai rumus; diberi tanda petik agar aman.
function sel(nilai: string | number) {
  let s = String(nilai);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replaceAll('"', '""')}"`;
}

// Berisi nama dan NPM responden, jadi hanya untuk admin.
// /ekspor            -> Excel (.xlsx)
// /ekspor?format=csv -> CSV (titik koma, untuk Excel berbahasa Indonesia)
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const staf = await ambilStaff();
  if (!staf || staf.rol !== "ADMIN") return new Response("Tidak diizinkan.", { status: 403 });

  const id = Number((await params).id) || 0;
  const survei = await prisma.survei.findUnique({
    where: { id },
    include: { pertanyaan: { orderBy: [{ urutan: "asc" }, { id: "asc" }] } },
  });
  if (!survei) return new Response("Kuesioner tidak ditemukan.", { status: 404 });

  const respon = await prisma.responSurvei.findMany({
    where: { surveiId: id },
    orderBy: { createdAt: "asc" },
    take: 10000,
    include: { jawaban: true },
  });

  const skala = survei.pertanyaan.filter((p) => p.tipe === "SKALA");
  const kepala = ["Waktu (WIB)", "Nama", "NPM", ...survei.pertanyaan.map((p, i) => `${i + 1}. ${p.teks}`), "Rata-rata"];

  const baris: SelXlsx[][] = respon.map((r) => {
    const peta = new Map(r.jawaban.map((j) => [j.pertanyaanId, j]));
    const nilai = skala.map((p) => peta.get(p.id)?.nilai).filter((n): n is number => typeof n === "number");
    const rata = nilai.length ? Math.round((nilai.reduce((a, b) => a + b, 0) / nilai.length) * 100) / 100 : null;
    return [
      new Date(r.createdAt.getTime() + WIB).toISOString().slice(0, 16).replace("T", " "),
      r.namaPeserta ?? "",
      r.npm ?? "",
      ...survei.pertanyaan.map((p) => {
        const j = peta.get(p.id);
        return p.tipe === "SKALA" ? (j?.nilai ?? null) : (j?.teks ?? "");
      }),
      rata,
    ];
  });

  const nama = `${survei.kode}-${survei.tahun}`;
  const url = new URL(req.url);

  if (url.searchParams.get("format") === "csv") {
    const isi = [
      kepala.map(sel).join(";"),
      ...baris.map((b) =>
        b.map((v) => sel(typeof v === "number" ? String(v).replace(".", ",") : (v ?? ""))).join(";"),
      ),
    ].join("\r\n");
    return new Response("﻿" + isi, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${nama}.csv"`,
        "Cache-Control": "private, no-store",
      },
    });
  }

  const lebar = [17, 26, 14, ...survei.pertanyaan.map(() => 18), 11];
  const berkas = buatXlsx(survei.judul, [kepala, ...baris], lebar);
  return new Response(new Uint8Array(berkas), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${nama}.xlsx"`,
      "Cache-Control": "private, no-store",
    },
  });
}