"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { TipePertanyaan } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { wajibAdmin } from "@/lib/auth";
import { ambilTeks, kumpulkanGalat, type FormState } from "@/lib/form";

const STANDAR: { teks: string; tipe: TipePertanyaan }[] = [
  { teks: "Kemudahan mendapatkan informasi jadwal dan layanan laboratorium", tipe: "SKALA" },
  { teks: "Kecepatan respons terhadap pengajuan peminjaman", tipe: "SKALA" },
  { teks: "Kondisi dan kelengkapan alat serta ruangan", tipe: "SKALA" },
  { teks: "Keramahan dan kemampuan petugas serta asisten", tipe: "SKALA" },
  { teks: "Kepuasan Anda secara keseluruhan terhadap layanan laboratorium", tipe: "SKALA" },
  { teks: "Saran dan masukan untuk laboratorium", tipe: "TEKS" },
];

function segarkan() {
  revalidatePath("/admin/survei");
  revalidatePath("/survei");
}

export async function buatSurveiStandar(_p: FormState, _formData: FormData): Promise<FormState> {
  await wajibAdmin();
  if ((await prisma.survei.count()) > 0) return { error: "Survei sudah ada." };

  await prisma.survei.create({
    data: {
      judul: "Survei Kepuasan Layanan Laboratorium",
      deskripsi: "Pendapat Anda membantu kami meningkatkan layanan. Survei ini anonim.",
      pertanyaan: { create: STANDAR.map((p, i) => ({ ...p, urutan: i + 1 })) },
    },
  });
  segarkan();
  return {};
}

const skemaSurvei = z.object({
  judul: z.string().trim().min(3, "Judul minimal 3 karakter.").max(150, "Maksimal 150 karakter."),
  deskripsi: z.string().trim().max(500, "Maksimal 500 karakter."),
});

export async function simpanSurvei(_p: FormState, formData: FormData): Promise<FormState> {
  await wajibAdmin();
  const id = Number(formData.get("id")) || 0;
  const aktif = formData.get("aktif") === "on";
  const values = { ...ambilTeks(formData, ["judul", "deskripsi"]), aktif: aktif ? "on" : "" };

  const h = skemaSurvei.safeParse(values);
  if (!h.success) {
    return { error: "Periksa kembali isian.", fieldErrors: kumpulkanGalat(h.error.issues), values };
  }

  await prisma.survei.updateMany({
    where: { id },
    data: { judul: h.data.judul, deskripsi: h.data.deskripsi || null, aktif },
  });
  segarkan();
  return { sukses: "Pengaturan survei disimpan.", values };
}

const skemaPertanyaan = z.object({
  teks: z.string().trim().min(5, "Pertanyaan minimal 5 karakter.").max(300, "Maksimal 300 karakter."),
  tipe: z.enum(["SKALA", "TEKS"]),
  urutan: z.string().trim().regex(/^\d{0,4}$/, "Isi dengan angka."),
});

export async function simpanPertanyaan(_p: FormState, formData: FormData): Promise<FormState> {
  await wajibAdmin();
  const id = Number(formData.get("id")) || 0;
  const surveiId = Number(formData.get("surveiId")) || 0;
  const values = ambilTeks(formData, ["teks", "tipe", "urutan"]);

  const h = skemaPertanyaan.safeParse(values);
  if (!h.success) {
    return { error: "Periksa kembali isian.", fieldErrors: kumpulkanGalat(h.error.issues), values };
  }
  const d = h.data;

  const survei = await prisma.survei.findUnique({ where: { id: surveiId }, select: { id: true } });
  if (!survei) return { error: "Survei tidak ditemukan.", values };

  if (id) {
    const lama = await prisma.pertanyaanSurvei.findFirst({ where: { id, surveiId } });
    if (!lama) return { error: "Pertanyaan tidak ditemukan.", values };
    if (lama.tipe !== d.tipe && (await prisma.jawabanSurvei.count({ where: { pertanyaanId: id } })) > 0) {
      return {
        error: "Tipe tidak bisa diubah karena pertanyaan ini sudah dijawab. Hapus semua respon dulu.",
        values,
      };
    }
    await prisma.pertanyaanSurvei.update({
      where: { id },
      data: { teks: d.teks, tipe: d.tipe, urutan: d.urutan ? Number(d.urutan) : lama.urutan },
    });
  } else {
    let urutan: number;
    if (d.urutan) urutan = Number(d.urutan);
    else {
      const maks = await prisma.pertanyaanSurvei.aggregate({ where: { surveiId }, _max: { urutan: true } });
      urutan = (maks._max.urutan ?? 0) + 1;
    }
    await prisma.pertanyaanSurvei.create({ data: { surveiId, teks: d.teks, tipe: d.tipe, urutan } });
  }

  segarkan();
  if (id) redirect("/admin/survei");
  return { sukses: "Pertanyaan ditambahkan." };
}

export async function hapusPertanyaan(_p: FormState, formData: FormData): Promise<FormState> {
  await wajibAdmin();
  const id = Number(formData.get("id"));
  if ((await prisma.jawabanSurvei.count({ where: { pertanyaanId: id } })) > 0) {
    return { error: "Sudah ada jawaban. Hapus semua respon dulu bila ingin menghapus pertanyaan ini." };
  }
  await prisma.pertanyaanSurvei.deleteMany({ where: { id } });
  segarkan();
  return {};
}

// id = id survei
export async function hapusSemuaRespon(_p: FormState, formData: FormData): Promise<FormState> {
  await wajibAdmin();
  const id = Number(formData.get("id"));
  await prisma.responSurvei.deleteMany({ where: { surveiId: id } });
  segarkan();
  return {};
}