"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { wajibAdmin } from "@/lib/auth";
import { ambilTeks, kumpulkanGalat, type FormState } from "@/lib/form";

const skema = z.object({
  nama: z.string().trim().min(2, "Nama minimal 2 karakter.").max(120, "Nama maksimal 120 karakter."),
  jabatan: z.enum(["KEPALA_LAB", "DOSEN", "PLP", "ASISTEN"]),
  label: z.string().trim().max(80, "Maksimal 80 karakter."),
  angkatan: z.string().trim().regex(/^(\d{4})?$/, "Isi 4 digit, mis. 2022."),
  nipNpm: z.string().trim().max(40, "Maksimal 40 karakter."),
  email: z
    .string()
    .trim()
    .max(120)
    .refine((v) => v === "" || /^\S+@\S+\.\S+$/.test(v), "Email tidak valid."),
  kontak: z.string().trim().max(40, "Maksimal 40 karakter."),
  bidang: z.string().trim().max(120, "Maksimal 120 karakter."),
  fotoUrl: z
    .string()
    .trim()
    .max(300)
    .refine((v) => v === "" || /^(https?:\/\/|\/)/.test(v), "Harus diawali http(s):// atau /."),
  urutan: z.string().trim().regex(/^\d{0,4}$/, "Isi dengan angka."),
  staffId: z.string().trim().regex(/^\d*$/, "Tidak valid."),
});

const FIELD = [
  "nama", "jabatan", "label", "angkatan", "nipNpm", "email",
  "kontak", "bidang", "fotoUrl", "urutan", "staffId",
];

export async function simpanAnggota(_p: FormState, formData: FormData): Promise<FormState> {
  await wajibAdmin();
  const id = Number(formData.get("id")) || 0;
  const aktif = formData.get("aktif") === "on";
  const values = { ...ambilTeks(formData, FIELD), aktif: aktif ? "on" : "" };

  const h = skema.safeParse(values);
  if (!h.success) {
    return { error: "Periksa kembali isian.", fieldErrors: kumpulkanGalat(h.error.issues), values };
  }
  const d = h.data;

  const data = {
    nama: d.nama,
    jabatan: d.jabatan,
    label: d.label || null,
    angkatan: d.angkatan ? Number(d.angkatan) : null,
    nipNpm: d.nipNpm || null,
    email: d.email || null,
    kontak: d.kontak || null,
    bidang: d.bidang || null,
    fotoUrl: d.fotoUrl || null,
    urutan: d.urutan ? Number(d.urutan) : 0,
    staffId: d.staffId ? Number(d.staffId) : null,
    aktif,
  };

  try {
    if (id) await prisma.anggotaLab.update({ where: { id }, data });
    else await prisma.anggotaLab.create({ data });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return {
          error: "Akun itu sudah ditautkan ke anggota lain.",
          fieldErrors: { staffId: "Sudah ditautkan." },
          values,
        };
      }
      if (e.code === "P2025") return { error: "Data tidak ditemukan.", values };
    }
    throw e;
  }

  revalidatePath("/admin/anggota");
  revalidatePath("/informasi/struktur");
  if (id) redirect("/admin/anggota");
  return { sukses: "Anggota ditambahkan." };
}

export async function alihkanAnggota(_p: FormState, formData: FormData): Promise<FormState> {
  await wajibAdmin();
  const id = Number(formData.get("id"));
  const a = await prisma.anggotaLab.findUnique({ where: { id } });
  if (!a) return { error: "Data tidak ditemukan." };
  await prisma.anggotaLab.update({ where: { id }, data: { aktif: !a.aktif } });
  revalidatePath("/admin/anggota");
  revalidatePath("/informasi/struktur");
  return {};
}

export async function hapusAnggota(_p: FormState, formData: FormData): Promise<FormState> {
  await wajibAdmin();
  const id = Number(formData.get("id"));
  await prisma.anggotaLab.deleteMany({ where: { id } });
  revalidatePath("/admin/anggota");
  revalidatePath("/informasi/struktur");
  return {};
}