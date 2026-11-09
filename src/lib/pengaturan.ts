import { prisma } from "@/lib/prisma";

export const KUNCI_PENGATURAN = [
  "visi",
  "misi",
  "sejarah",
  "alamat",
  "email",
  "instagram",
  "jam_layanan",
  "template_surat",
] as const;

export type KunciPengaturan = (typeof KUNCI_PENGATURAN)[number];

export async function ambilPengaturan() {
  const baris = await prisma.pengaturan.findMany();
  return Object.fromEntries(baris.map((b) => [b.kunci, b.nilai])) as Record<string, string>;
}

/** Nilai dianggap kosong bila belum diisi atau masih teks bawaan seed. */
export function terisi(nilai: string | undefined): nilai is string {
  return !!nilai && nilai.trim() !== "" && nilai.trim() !== "Belum diisi.";
}