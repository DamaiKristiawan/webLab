"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { wajibAdmin } from "@/lib/auth";
import { ambilTeks, kumpulkanGalat, type FormState } from "@/lib/form";

const angka = (maks: number) => new RegExp(`^\\d{0,${maks}}$`);

const skemaRuangan = z.object({
  nama: z.string().trim().min(2, "Nama minimal 2 karakter.").max(100, "Nama maksimal 100 karakter."),
  kapasitas: z.string().trim().regex(angka(4), "Isi dengan angka."),
  deskripsi: z.string().trim().max(300, "Maksimal 300 karakter."),
});

const skemaAlat = z.object({
  nama: z.string().trim().min(2, "Nama minimal 2 karakter.").max(100, "Nama maksimal 100 karakter."),
  kategori: z.string().trim().max(60, "Maksimal 60 karakter."),
  stokTotal: z.string().trim().regex(/^\d{1,4}$/, "Isi dengan angka (0-9999)."),
  kondisi: z.string().trim().max(60, "Maksimal 60 karakter."),
  deskripsi: z.string().trim().max(300, "Maksimal 300 karakter."),
});

// ---------- Ruangan ----------

export async function simpanRuangan(_p: FormState, formData: FormData): Promise<FormState> {
  await wajibAdmin();
  const id = Number(formData.get("id")) || 0;
  const values = ambilTeks(formData, ["nama", "kapasitas", "deskripsi"]);

  const h = skemaRuangan.safeParse(values);
  if (!h.success) {
    return { error: "Periksa kembali isian.", fieldErrors: kumpulkanGalat(h.error.issues), values };
  }
  const d = h.data;
  const data = {
    nama: d.nama,
    kapasitas: d.kapasitas ? Number(d.kapasitas) : null,
    deskripsi: d.deskripsi || null,
  };

  if (id) await prisma.ruangan.updateMany({ where: { id }, data });
  else await prisma.ruangan.create({ data });

  revalidatePath("/admin/inventaris");
  if (id) redirect("/admin/inventaris");
  return { sukses: "Ruangan ditambahkan." };
}

export async function alihkanRuangan(_p: FormState, formData: FormData): Promise<FormState> {
  await wajibAdmin();
  const id = Number(formData.get("id"));
  const r = await prisma.ruangan.findUnique({ where: { id } });
  if (!r) return { error: "Data tidak ditemukan." };
  await prisma.ruangan.update({ where: { id }, data: { aktif: !r.aktif } });
  revalidatePath("/admin/inventaris");
  return {};
}

export async function hapusRuangan(_p: FormState, formData: FormData): Promise<FormState> {
  await wajibAdmin();
  const id = Number(formData.get("id"));
  const [jadwal, pengajuan] = await Promise.all([
    prisma.jadwal.count({ where: { ruanganId: id } }),
    prisma.pengajuan.count({ where: { ruanganId: id } }),
  ]);
  if (jadwal + pengajuan > 0) {
    return { error: "Sudah dipakai di jadwal/pengajuan. Nonaktifkan saja." };
  }
  await prisma.ruangan.deleteMany({ where: { id } });
  revalidatePath("/admin/inventaris");
  return {};
}

// ---------- Alat ----------

export async function simpanAlat(_p: FormState, formData: FormData): Promise<FormState> {
  await wajibAdmin();
  const id = Number(formData.get("id")) || 0;
  const values = ambilTeks(formData, ["nama", "kategori", "stokTotal", "kondisi", "deskripsi"]);

  const h = skemaAlat.safeParse(values);
  if (!h.success) {
    return { error: "Periksa kembali isian.", fieldErrors: kumpulkanGalat(h.error.issues), values };
  }
  const d = h.data;
  const data = {
    nama: d.nama,
    kategori: d.kategori || null,
    stokTotal: Number(d.stokTotal),
    kondisi: d.kondisi || null,
    deskripsi: d.deskripsi || null,
  };

  if (id) await prisma.alat.updateMany({ where: { id }, data });
  else await prisma.alat.create({ data });

  revalidatePath("/admin/inventaris");
  if (id) redirect("/admin/inventaris");
  return { sukses: "Alat ditambahkan." };
}

export async function alihkanAlat(_p: FormState, formData: FormData): Promise<FormState> {
  await wajibAdmin();
  const id = Number(formData.get("id"));
  const a = await prisma.alat.findUnique({ where: { id } });
  if (!a) return { error: "Data tidak ditemukan." };
  await prisma.alat.update({ where: { id }, data: { aktif: !a.aktif } });
  revalidatePath("/admin/inventaris");
  return {};
}

export async function hapusAlat(_p: FormState, formData: FormData): Promise<FormState> {
  await wajibAdmin();
  const id = Number(formData.get("id"));
  const dipakai = await prisma.pengajuanAlat.count({ where: { alatId: id } });
  if (dipakai > 0) return { error: "Sudah dipakai di pengajuan. Nonaktifkan saja." };
  await prisma.alat.deleteMany({ where: { id } });
  revalidatePath("/admin/inventaris");
  return {};
}