"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { wajibAdmin } from "@/lib/auth";
import { HARI_PIKET, kunciPiket, pecahNama } from "@/lib/piket";
import type { FormState } from "@/lib/form";

export async function simpanPiket(_prev: FormState, formData: FormData): Promise<FormState> {
  await wajibAdmin();

  const values: Record<string, string> = {};
  const simpan: { kunci: string; nilai: string }[] = [];

  for (const h of HARI_PIKET) {
    const nama = pecahNama(String(formData.get(`hari${h.no}`) ?? ""));
    values[`hari${h.no}`] = nama.join("\n");

    if (nama.some((n) => n.length > 80)) {
      return { error: `${h.nama}: setiap nama maksimal 80 karakter.`, values };
    }
    if (nama.length > 40) return { error: `${h.nama}: maksimal 40 nama.`, values };

    // Buang nama ganda dalam satu hari (huruf besar/kecil dianggap sama)
    const unik = nama.filter((n, i) => nama.findIndex((x) => x.toLowerCase() === n.toLowerCase()) === i);
    values[`hari${h.no}`] = unik.join("\n");
    simpan.push({ kunci: kunciPiket(h.no), nilai: unik.join("\n") });
  }

  await prisma.$transaction(
    simpan.map((s) =>
      prisma.pengaturan.upsert({ where: { kunci: s.kunci }, update: { nilai: s.nilai }, create: s }),
    ),
  );

  revalidatePath("/admin/piket");
  revalidatePath("/jadwal/piket");
  return { sukses: "Jadwal piket disimpan.", values };
}