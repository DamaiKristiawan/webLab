import { prisma } from "@/lib/prisma";

export type KuesionerGrafik = {
  id: number;
  kode: string;
  judul: string;
  jumlahRespon: number;
  nilai: (number | null)[];
};

export type DataGrafik = {
  dimensi: string[];
  kuesioner: KuesionerGrafik[];
};

const TANPA_DIMENSI = "Tanpa dimensi";

export async function ambilDataGrafik(tahun: number): Promise<DataGrafik> {
  const daftar = await prisma.survei.findMany({
    where: { tahun },
    orderBy: { id: "asc" },
    select: { id: true, kode: true, judul: true, _count: { select: { respon: true } } },
  });
  const ids = daftar.map((s) => s.id);

  const [pertanyaan, agregat] = await Promise.all([
    prisma.pertanyaanSurvei.findMany({
      where: { surveiId: { in: ids }, tipe: "SKALA" },
      orderBy: [{ surveiId: "asc" }, { urutan: "asc" }, { id: "asc" }],
      select: { id: true, surveiId: true, kelompok: true },
    }),
    prisma.jawabanSurvei.groupBy({
      by: ["pertanyaanId"],
      where: { nilai: { not: null }, pertanyaan: { surveiId: { in: ids }, tipe: "SKALA" } },
      _sum: { nilai: true },
      _count: { nilai: true },
    }),
  ]);

  const dimensi: string[] = [];
  for (const p of pertanyaan) {
    const k = p.kelompok ?? TANPA_DIMENSI;
    if (!dimensi.includes(k)) dimensi.push(k);
  }

  const total = new Map<number, { jumlah: number; n: number }>();
  for (const a of agregat) {
    total.set(a.pertanyaanId, { jumlah: a._sum.nilai ?? 0, n: a._count.nilai });
  }

  const kuesioner: KuesionerGrafik[] = daftar.map((s) => ({
    id: s.id,
    kode: s.kode,
    judul: s.judul,
    jumlahRespon: s._count.respon,
    nilai: dimensi.map((d) => {
      let jumlah = 0;
      let n = 0;
      for (const p of pertanyaan) {
        if (p.surveiId !== s.id || (p.kelompok ?? TANPA_DIMENSI) !== d) continue;
        const t = total.get(p.id);
        if (t) {
          jumlah += t.jumlah;
          n += t.n;
        }
      }
      return n ? jumlah / n : null;
    }),
  }));

  return { dimensi, kuesioner };
}