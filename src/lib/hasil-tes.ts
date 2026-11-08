import type { JenisTes, Prisma } from "@prisma/client";

export function filterHasil(sp: { praktikum?: string; jenis?: string; q?: string }) {
  const praktikumId = Number(sp.praktikum) || undefined;
  const jenis: JenisTes | undefined = sp.jenis === "PRETEST" || sp.jenis === "POSTEST" ? sp.jenis : undefined;
  const q = (sp.q ?? "").trim().slice(0, 50);

  const tes: Prisma.TesWhereInput = {};
  if (jenis) tes.jenis = jenis;
  if (praktikumId) tes.judulPraktikum = { praktikumId };
  const filterTes = Object.keys(tes).length > 0 ? tes : undefined;

  const cari = q
    ? [
        { namaPeserta: { contains: q, mode: "insensitive" as const } },
        { npm: { contains: q, mode: "insensitive" as const } },
      ]
    : undefined;

  const where: Prisma.HasilTesWhereInput = { tes: filterTes, OR: cari };
  const whereSesi: Prisma.SesiTesWhereInput = { selesai: false, tes: filterTes, OR: cari };

  return { where, whereSesi, praktikumId, jenis, q };
}
