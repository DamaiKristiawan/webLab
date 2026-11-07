"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { wajibAdmin } from "@/lib/auth";
import { KUNCI_PENGATURAN } from "@/lib/pengaturan";
import type { FormState } from "@/lib/form";

const MAKS = 5000;

export async function simpanPengaturan(_p: FormState, formData: FormData): Promise<FormState> {
  await wajibAdmin();

  const values: Record<string, string> = {};
  for (const k of KUNCI_PENGATURAN) values[k] = String(formData.get(k) ?? "").trim();

  const terlalu = KUNCI_PENGATURAN.find((k) => values[k].length > MAKS);
  if (terlalu) return { error: `Isian "${terlalu}" terlalu panjang (maks ${MAKS} karakter).`, values };

  await prisma.$transaction(
    KUNCI_PENGATURAN.map((kunci) =>
      prisma.pengaturan.upsert({
        where: { kunci },
        update: { nilai: values[kunci] },
        create: { kunci, nilai: values[kunci] },
      }),
    ),
  );

  revalidatePath("/informasi/profil");
  revalidatePath("/admin/pengaturan");
  return { sukses: "Pengaturan disimpan.", values };
}