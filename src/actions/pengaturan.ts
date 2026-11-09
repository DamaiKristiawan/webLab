"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { wajibAdmin } from "@/lib/auth";
import { KUNCI_PENGATURAN } from "@/lib/pengaturan";
import { hapusGambar, periksaPdf, simpanPdf, type PdfValid } from "@/lib/media";
import type { FormState } from "@/lib/form";

const MAKS = 5000;
const KUNCI_TEKS = KUNCI_PENGATURAN.filter((k) => k !== "template_surat");

export async function simpanPengaturan(_p: FormState, formData: FormData): Promise<FormState> {
  await wajibAdmin();

  const values: Record<string, string> = {};
  for (const k of KUNCI_TEKS) values[k] = String(formData.get(k) ?? "").trim();

  const terlalu = KUNCI_TEKS.find((k) => values[k].length > MAKS);
  if (terlalu) return { error: `Isian "${terlalu}" terlalu panjang (maks ${MAKS} karakter).`, values };

  // Template surat: berkas PDF yang diunggah (bukan tautan)
  const f = formData.get("template_surat_file");
  const berkas = f instanceof File && f.size > 0 ? f : null;
  const hapusLama = formData.get("hapus_template_surat") === "on";
  let pdf: PdfValid | null = null;
  if (berkas) {
    const p = await periksaPdf(berkas);
    if ("error" in p) return { error: `Template surat: ${p.error}`, values };
    pdf = p;
  }

  const lama = await prisma.pengaturan.findUnique({ where: { kunci: "template_surat" } });
  let templateBaru = lama?.nilai ?? "";
  let urlBaru: string | null = null;
  if (pdf) {
    urlBaru = await simpanPdf(pdf);
    templateBaru = urlBaru;
  } else if (hapusLama) {
    templateBaru = "";
  }
  values.template_surat = templateBaru;

  try {
    await prisma.$transaction(
      KUNCI_PENGATURAN.map((kunci) =>
        prisma.pengaturan.upsert({
          where: { kunci },
          update: { nilai: values[kunci] },
          create: { kunci, nilai: values[kunci] },
        }),
      ),
    );
  } catch (e) {
    await hapusGambar(urlBaru); // batalkan unggahan bila database gagal
    throw e;
  }

  if (lama?.nilai && lama.nilai !== templateBaru) await hapusGambar(lama.nilai);

  revalidatePath("/informasi/profil");
  revalidatePath("/admin/pengaturan");
  revalidatePath("/pengajuan", "layout");
  return { sukses: "Pengaturan disimpan.", values };
}