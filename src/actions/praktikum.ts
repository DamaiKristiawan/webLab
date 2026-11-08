"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { wajibStaf } from "@/lib/auth";
import { ambilTeks, kumpulkanGalat, type FormState } from "@/lib/form";
import { slugify } from "@/lib/slug";
import { skemaJudul, skemaPraktikum } from "@/lib/validasi";

const JUMLAH_JUDUL = 6;

async function slugUnik(nama: string) {
  const dasar = slugify(nama);
  for (let i = 1; i < 100; i++) {
    const calon = i === 1 ? dasar : `${dasar}-${i}`;
    const ada = await prisma.praktikum.findUnique({ where: { slug: calon }, select: { id: true } });
    if (!ada) return calon;
  }
  return `${dasar}-${Date.now()}`;
}

export async function simpanPraktikum(_p: FormState, formData: FormData): Promise<FormState> {
  await wajibStaf();
  const id = Number(formData.get("id")) || 0;
  const aktif = formData.get("aktif") === "on";
  const values = { ...ambilTeks(formData, ["nama", "deskripsi", "modulUrl"]), aktif: aktif ? "on" : "" };

  const h = skemaPraktikum.safeParse(values);
  if (!h.success) {
    return { error: "Periksa kembali isian.", fieldErrors: kumpulkanGalat(h.error.issues), values };
  }
  const d = h.data;
  const data = { nama: d.nama, deskripsi: d.deskripsi || null, modulUrl: d.modulUrl || null, aktif };

  if (id) {
    await prisma.praktikum.updateMany({ where: { id }, data });
  } else {
    await prisma.praktikum.create({
      data: {
        ...data,
        slug: await slugUnik(d.nama),
        daftarJudul: {
          create: Array.from({ length: JUMLAH_JUDUL }, (_, i) => ({ urutan: i + 1, judul: `Judul ${i + 1}` })),
        },
      },
    });
  }

  revalidatePath("/admin/praktikum");
  if (id) {
    revalidatePath(`/admin/praktikum/${id}`);
    redirect(`/admin/praktikum/${id}`);
  }
  return { sukses: `Praktikum ditambahkan dengan ${JUMLAH_JUDUL} judul.` };
}

export async function alihkanPraktikum(_p: FormState, formData: FormData): Promise<FormState> {
  await wajibStaf();
  const id = Number(formData.get("id"));
  const p = await prisma.praktikum.findUnique({ where: { id } });
  if (!p) return { error: "Data tidak ditemukan." };
  await prisma.praktikum.update({ where: { id }, data: { aktif: !p.aktif } });
  revalidatePath("/admin/praktikum");
  return {};
}

export async function hapusPraktikum(_p: FormState, formData: FormData): Promise<FormState> {
  await wajibStaf();
  const id = Number(formData.get("id"));
  const hasil = await prisma.hasilTes.count({ where: { tes: { judulPraktikum: { praktikumId: id } } } });
  if (hasil > 0) return { error: "Sudah ada hasil tes peserta. Nonaktifkan saja." };
  await prisma.praktikum.deleteMany({ where: { id } });
  revalidatePath("/admin/praktikum");
  return {};
}

export async function simpanJudul(_p: FormState, formData: FormData): Promise<FormState> {
  await wajibStaf();
  const id = Number(formData.get("id")) || 0;
  const values = ambilTeks(formData, ["judul"]);

  const h = skemaJudul.safeParse(values);
  if (!h.success) {
    return { error: "Periksa kembali isian.", fieldErrors: kumpulkanGalat(h.error.issues), values };
  }

  const judul = await prisma.judulPraktikum.findUnique({ where: { id }, select: { praktikumId: true } });
  if (!judul) return { error: "Judul tidak ditemukan.", values };

  await prisma.judulPraktikum.update({ where: { id }, data: { judul: h.data.judul } });
  revalidatePath(`/admin/praktikum/${judul.praktikumId}`);
  redirect(`/admin/praktikum/${judul.praktikumId}`);
}

async function buatTes(formData: FormData, jenis: "PRETEST" | "POSTEST"): Promise<FormState> {
  await wajibStaf();
  const judulId = Number(formData.get("id"));
  const judul = await prisma.judulPraktikum.findUnique({ where: { id: judulId }, select: { praktikumId: true } });
  if (!judul) return { error: "Judul tidak ditemukan." };

  try {
    await prisma.tes.create({ data: { judulId, jenis } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "Tes ini sudah dibuat." };
    }
    throw e;
  }
  revalidatePath(`/admin/praktikum/${judul.praktikumId}`);
  return {};
}

export async function buatPretest(_p: FormState, formData: FormData) {
  return buatTes(formData, "PRETEST");
}

export async function buatPostest(_p: FormState, formData: FormData) {
  return buatTes(formData, "POSTEST");
}
