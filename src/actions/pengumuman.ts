"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { wajibLogin } from "@/lib/auth";
import { dariInputWib } from "@/lib/waktu";

export type PengumumanState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
};

const KUNCI = ["id", "judul", "isi", "mulaiTampil", "selesaiTampil", "aktif"] as const;

const skema = z.object({
  id: z.string().optional(),
  judul: z
    .string()
    .trim()
    .min(3, "Judul minimal 3 karakter.")
    .max(150, "Judul maksimal 150 karakter."),
  isi: z
    .string()
    .trim()
    .min(3, "Isi pengumuman wajib diisi.")
    .max(2000, "Isi maksimal 2000 karakter."),
  mulaiTampil: z.string().optional(),
  selesaiTampil: z.string().optional(),
  aktif: z.string().optional(),
});

export async function simpanPengumuman(
  _prev: PengumumanState,
  formData: FormData,
): Promise<PengumumanState> {
  await wajibLogin();

  const values: Record<string, string> = {};
  for (const k of KUNCI) values[k] = String(formData.get(k) ?? "");

  const hasil = skema.safeParse(values);
  if (!hasil.success) {
    const fieldErrors: Record<string, string> = {};
    for (const isu of hasil.error.issues) {
      const k = String(isu.path[0] ?? "");
      if (k && !fieldErrors[k]) fieldErrors[k] = isu.message;
    }
    return { error: "Periksa kembali isian formulir.", fieldErrors, values };
  }
  const d = hasil.data;

  const mulai = d.mulaiTampil ? dariInputWib(d.mulaiTampil) : null;
  const selesai = d.selesaiTampil ? dariInputWib(d.selesaiTampil) : null;
  if ((d.mulaiTampil && !mulai) || (d.selesaiTampil && !selesai)) {
    return { error: "Format waktu tidak valid.", values };
  }
  if (mulai && selesai && selesai <= mulai) {
    return {
      error: "Waktu selesai harus setelah waktu mulai.",
      fieldErrors: { selesaiTampil: "Harus setelah waktu mulai." },
      values,
    };
  }

  const id = d.id ? Number(d.id) : null;
  if (id !== null && !Number.isInteger(id)) return { error: "Data tidak valid.", values };

  const aktif = d.aktif === "1";

  if (id) {
    await prisma.pengumuman.update({
      where: { id },
      data: {
        judul: d.judul,
        isi: d.isi,
        aktif,
        selesaiTampil: selesai,
        ...(mulai ? { mulaiTampil: mulai } : {}),
      },
    });
  } else {
    await prisma.pengumuman.create({
      data: {
        judul: d.judul,
        isi: d.isi,
        aktif,
        mulaiTampil: mulai ?? new Date(),
        selesaiTampil: selesai,
      },
    });
  }

  redirect("/admin/pengumuman");
}

export async function alihkanPengumuman(formData: FormData) {
  await wajibLogin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;

  const p = await prisma.pengumuman.findUnique({ where: { id }, select: { aktif: true } });
  if (!p) return;

  await prisma.pengumuman.update({ where: { id }, data: { aktif: !p.aktif } });
  revalidatePath("/admin/pengumuman");
}

export async function hapusPengumuman(formData: FormData) {
  await wajibLogin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;
  await prisma.pengumuman.deleteMany({ where: { id } });
  revalidatePath("/admin/pengumuman");
}