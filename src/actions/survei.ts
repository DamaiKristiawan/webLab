"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { wajibAdmin } from "@/lib/auth";
import { ambilTeks, kumpulkanGalat, type FormState } from "@/lib/form";
import { butirKuesioner, DAFTAR_KUESIONER, deskripsiKuesioner } from "@/lib/kuesioner";

function segarkan(id?: number) {
  revalidatePath("/admin/survei");
  revalidatePath("/survei");
  if (id) revalidatePath(`/admin/survei/${id}`);
}

function tahunValid(n: number) {
  return Number.isInteger(n) && n >= 2000 && n <= 2100;
}

// ---------- Membuat kuesioner ----------

/** Membuat keempat kuesioner standar untuk satu tahun. Yang sudah ada dilewati. */
export async function buatKuesionerStandar(_p: FormState, formData: FormData): Promise<FormState> {
  await wajibAdmin();
  const mentah = String(formData.get("tahun") ?? "");
  const tahun = Number(mentah);
  const values = { tahun: mentah };
  if (!tahunValid(tahun)) return { error: "Isi tahun yang valid, mis. 2026.", values };

  let dibuat = 0;
  for (const k of DAFTAR_KUESIONER) {
    const ada = await prisma.survei.findUnique({
      where: { kode_tahun: { kode: k.kode, tahun } },
      select: { id: true },
    });
    if (ada) continue;

    await prisma.survei.create({
      data: {
        kode: k.kode,
        tahun,
        judul: `${k.judul} ${tahun}`,
        deskripsi: deskripsiKuesioner(),
        pertanyaan: {
          create: butirKuesioner(k.asuransi).map((b, i) => ({
            teks: b.teks,
            kelompok: b.kelompok,
            tipe: "SKALA" as const,
            urutan: i + 1,
          })),
        },
      },
    });
    dibuat++;
  }

  segarkan();
  if (dibuat === 0) return { error: `Keempat kuesioner ${tahun} sudah ada.`, values };
  return { sukses: `${dibuat} kuesioner ${tahun} dibuat.`, values };
}

/**
 * Membuka periode baru dari kuesioner yang ada (id = id kuesioner sumber).
 * Pertanyaan disalin (termasuk perubahan yang pernah dibuat admin), periode lama ditutup,
 * dan semua jawaban lama tetap tersimpan sebagai riwayat. NPM yang sama bisa mengisi lagi di periode baru.
 */
export async function bukaPeriodeBaru(_p: FormState, formData: FormData): Promise<FormState> {
  await wajibAdmin();
  const id = Number(formData.get("id")) || 0;
  const mentah = String(formData.get("tahun") ?? "");
  const tahun = Number(mentah);
  const values = { tahun: mentah };
  if (!tahunValid(tahun)) return { error: "Isi tahun yang valid, mis. 2027.", values };

  const sumber = await prisma.survei.findUnique({
    where: { id },
    include: { pertanyaan: { orderBy: [{ urutan: "asc" }, { id: "asc" }] } },
  });
  if (!sumber) return { error: "Kuesioner tidak ditemukan.", values };

  const sudah = await prisma.survei.findUnique({
    where: { kode_tahun: { kode: sumber.kode, tahun } },
    select: { id: true },
  });
  if (sudah) return { error: `Periode ${tahun} sudah ada untuk kuesioner ini.`, values };

  const baru = await prisma.$transaction(async (tx) => {
    await tx.survei.updateMany({ where: { kode: sumber.kode }, data: { aktif: false } });
    return tx.survei.create({
      data: {
        kode: sumber.kode,
        tahun,
        judul: sumber.judul.replace(String(sumber.tahun), String(tahun)),
        deskripsi: sumber.deskripsi,
        aktif: true,
        pertanyaan: {
          create: sumber.pertanyaan.map((p) => ({
            teks: p.teks,
            tipe: p.tipe,
            kelompok: p.kelompok,
            urutan: p.urutan,
          })),
        },
      },
    });
  });

  segarkan(baru.id);
  redirect(`/admin/survei/${baru.id}`);
}

// ---------- Pengaturan kuesioner ----------

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
  segarkan(id);
  return { sukses: "Pengaturan kuesioner disimpan.", values };
}

/** id = id kuesioner: membuka atau menutup. */
export async function alihkanSurvei(_p: FormState, formData: FormData): Promise<FormState> {
  await wajibAdmin();
  const id = Number(formData.get("id"));
  const s = await prisma.survei.findUnique({ where: { id } });
  if (!s) return { error: "Kuesioner tidak ditemukan." };
  await prisma.survei.update({ where: { id }, data: { aktif: !s.aktif } });
  segarkan(id);
  return {};
}

/** id = id kuesioner. Pertanyaan dan semua jawabannya ikut terhapus. */
export async function hapusSurvei(_p: FormState, formData: FormData): Promise<FormState> {
  await wajibAdmin();
  const id = Number(formData.get("id"));
  await prisma.survei.deleteMany({ where: { id } });
  segarkan();
  redirect("/admin/survei");
}

// ---------- Pertanyaan ----------

const skemaPertanyaan = z.object({
  teks: z.string().trim().min(5, "Pertanyaan minimal 5 karakter.").max(300, "Maksimal 300 karakter."),
  tipe: z.enum(["SKALA", "TEKS"]),
  kelompok: z.string().trim().max(60, "Maksimal 60 karakter."),
  urutan: z.string().trim().regex(/^\d{0,4}$/, "Isi dengan angka."),
});

export async function simpanPertanyaan(_p: FormState, formData: FormData): Promise<FormState> {
  await wajibAdmin();
  const id = Number(formData.get("id")) || 0;
  const surveiId = Number(formData.get("surveiId")) || 0;
  const values = ambilTeks(formData, ["teks", "tipe", "kelompok", "urutan"]);

  const h = skemaPertanyaan.safeParse(values);
  if (!h.success) {
    return { error: "Periksa kembali isian.", fieldErrors: kumpulkanGalat(h.error.issues), values };
  }
  const d = h.data;

  const survei = await prisma.survei.findUnique({ where: { id: surveiId }, select: { id: true } });
  if (!survei) return { error: "Kuesioner tidak ditemukan.", values };

  if (id) {
    const lama = await prisma.pertanyaanSurvei.findFirst({ where: { id, surveiId } });
    if (!lama) return { error: "Pertanyaan tidak ditemukan.", values };
    if (lama.tipe !== d.tipe && (await prisma.jawabanSurvei.count({ where: { pertanyaanId: id } })) > 0) {
      return {
        error: "Jenis jawaban tidak bisa diubah karena pertanyaan ini sudah dijawab. Hapus semua respon dulu.",
        values,
      };
    }
    await prisma.pertanyaanSurvei.update({
      where: { id },
      data: {
        teks: d.teks,
        tipe: d.tipe,
        kelompok: d.kelompok || null,
        urutan: d.urutan ? Number(d.urutan) : lama.urutan,
      },
    });
  } else {
    let urutan: number;
    if (d.urutan) urutan = Number(d.urutan);
    else {
      const maks = await prisma.pertanyaanSurvei.aggregate({ where: { surveiId }, _max: { urutan: true } });
      urutan = (maks._max.urutan ?? 0) + 1;
    }
    await prisma.pertanyaanSurvei.create({
      data: { surveiId, teks: d.teks, tipe: d.tipe, kelompok: d.kelompok || null, urutan },
    });
  }

  segarkan(surveiId);
  if (id) redirect(`/admin/survei/${surveiId}`);
  return { sukses: "Pertanyaan ditambahkan." };
}

export async function hapusPertanyaan(_p: FormState, formData: FormData): Promise<FormState> {
  await wajibAdmin();
  const id = Number(formData.get("id"));
  const p = await prisma.pertanyaanSurvei.findUnique({ where: { id }, select: { surveiId: true } });
  if (!p) return {};
  if ((await prisma.jawabanSurvei.count({ where: { pertanyaanId: id } })) > 0) {
    return { error: "Sudah ada jawaban. Hapus semua respon dulu bila ingin menghapus pertanyaan ini." };
  }
  await prisma.pertanyaanSurvei.deleteMany({ where: { id } });
  segarkan(p.surveiId);
  return {};
}

// ---------- Respon ----------

/** id = id respon. NPM tersebut bisa mengisi kuesioner ini lagi. */
export async function hapusRespon(_p: FormState, formData: FormData): Promise<FormState> {
  await wajibAdmin();
  const id = Number(formData.get("id"));
  const r = await prisma.responSurvei.findUnique({ where: { id }, select: { surveiId: true } });
  if (!r) return {};
  await prisma.responSurvei.deleteMany({ where: { id } });
  segarkan(r.surveiId);
  return {};
}

/** id = id kuesioner. */
export async function hapusSemuaRespon(_p: FormState, formData: FormData): Promise<FormState> {
  await wajibAdmin();
  const id = Number(formData.get("id"));
  await prisma.responSurvei.deleteMany({ where: { surveiId: id } });
  segarkan(id);
  return {};
}