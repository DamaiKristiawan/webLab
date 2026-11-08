import { prisma } from "@/lib/prisma";

export const HARI_PIKET = [
  { no: 1, nama: "Senin" },
  { no: 2, nama: "Selasa" },
  { no: 3, nama: "Rabu" },
  { no: 4, nama: "Kamis" },
  { no: 5, nama: "Jumat" },
] as const;

// Jadwal piket disimpan di tabel Pengaturan: kunci piket_1 ... piket_5, isinya satu nama per baris.
export function kunciPiket(no: number) {
  return `piket_${no}`;
}

export function pecahNama(nilai: string | undefined) {
  return (nilai ?? "")
    .split(/\r?\n/)
    .map((s) => s.trim().replace(/\s+/g, " "))
    .filter(Boolean);
}

/** { 1: [nama, ...], 2: [...], ... } */
export async function ambilPiket() {
  const baris = await prisma.pengaturan.findMany({
    where: { kunci: { in: HARI_PIKET.map((h) => kunciPiket(h.no)) } },
  });
  const peta = new Map(baris.map((b) => [b.kunci, b.nilai]));
  return Object.fromEntries(
    HARI_PIKET.map((h) => [h.no, pecahNama(peta.get(kunciPiket(h.no)))]),
  ) as Record<number, string[]>;
}

/** Hari dalam seminggu menurut WIB: 0 = Minggu, 1 = Senin, ... 6 = Sabtu. */
export function hariIniWib(sekarang = Date.now()) {
  return new Date(sekarang + 7 * 60 * 60 * 1000).getUTCDay();
}