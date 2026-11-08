"use server";

import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { wajibStaf } from "@/lib/auth";
import { ambilTeks, kumpulkanGalat, type FormState } from "@/lib/form";
import { skemaTes } from "@/lib/validasi";

export async function simpanTes(_p: FormState, formData: FormData): Promise<FormState> {
  await wajibStaf();
  const id = Number(formData.get("id")) || 0;
  const aktif = formData.get("aktif") === "on";
  const values = { ...ambilTeks(formData, ["durasiMenit"]), aktif: aktif ? "on" : "" };

  const h = skemaTes.safeParse(values);
  if (!h.success) {
    return { error: "Periksa kembali isian.", fieldErrors: kumpulkanGalat(h.error.issues), values };
  }

  await prisma.tes.updateMany({ where: { id }, data: { durasiMenit: Number(h.data.durasiMenit), aktif } });
  revalidatePath(`/admin/praktikum/tes/${id}`);
  return { sukses: "Pengaturan tes disimpan. Durasi baru berlaku untuk peserta yang mulai setelah ini." };
}

export async function alihkanTes(_p: FormState, formData: FormData): Promise<FormState> {
  await wajibStaf();
  const id = Number(formData.get("id"));
  const t = await prisma.tes.findUnique({
    where: { id },
    include: { judulPraktikum: { select: { praktikumId: true } } },
  });
  if (!t) return { error: "Data tidak ditemukan." };
  await prisma.tes.update({ where: { id }, data: { aktif: !t.aktif } });
  revalidatePath(`/admin/praktikum/${t.judulPraktikum.praktikumId}`);
  revalidatePath(`/admin/praktikum/tes/${id}`);
  return {};
}

export async function hapusTes(_p: FormState, formData: FormData): Promise<FormState> {
  await wajibStaf();
  const id = Number(formData.get("id"));
  const t = await prisma.tes.findUnique({
    where: { id },
    include: { judulPraktikum: { select: { praktikumId: true } } },
  });
  if (!t) return {};
  const hasil = await prisma.hasilTes.count({ where: { tesId: id } });
  if (hasil > 0) return { error: "Sudah ada hasil tes peserta. Nonaktifkan saja." };
  await prisma.tes.delete({ where: { id } });
  revalidatePath(`/admin/praktikum/${t.judulPraktikum.praktikumId}`);
  redirect(`/admin/praktikum/${t.judulPraktikum.praktikumId}`);
}

const HURUF_KODE = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function buatKode() {
  return Array.from({ length: 6 }, () => HURUF_KODE[randomInt(HURUF_KODE.length)]).join("");
}

async function aturKode(formData: FormData, kode: string | null): Promise<FormState> {
  await wajibStaf();
  const id = Number(formData.get("id"));
  const t = await prisma.tes.findUnique({
    where: { id },
    select: { judulPraktikum: { select: { praktikumId: true } } },
  });
  if (!t) return { error: "Data tidak ditemukan." };
  await prisma.tes.update({ where: { id }, data: { kodeAkses: kode } });
  revalidatePath(`/admin/praktikum/${t.judulPraktikum.praktikumId}`);
  revalidatePath(`/admin/praktikum/tes/${id}`);
  return {};
}

export async function buatKodeTes(_p: FormState, formData: FormData): Promise<FormState> {
  return aturKode(formData, buatKode());
}

export async function tutupKodeTes(_p: FormState, formData: FormData): Promise<FormState> {
  return aturKode(formData, null);
}

const NAMA_OPSI = ["opsi0", "opsi1", "opsi2", "opsi3", "opsi4"];

export async function simpanSoal(_p: FormState, formData: FormData): Promise<FormState> {
  await wajibStaf();
  const id = Number(formData.get("id")) || 0;
  const tesId = Number(formData.get("tesId")) || 0;

  const values = ambilTeks(formData, ["pertanyaan", "benar", ...NAMA_OPSI]);
  const galat: Record<string, string> = {};

  const pertanyaan = values.pertanyaan.trim();
  if (pertanyaan.length < 5) galat.pertanyaan = "Pertanyaan minimal 5 karakter.";
  else if (pertanyaan.length > 2000) galat.pertanyaan = "Maksimal 2000 karakter.";

  const opsi = NAMA_OPSI.map((n) => values[n].trim());
  if (opsi.some((o) => o.length > 300)) galat.opsi = "Setiap opsi maksimal 300 karakter.";

  const terisi = opsi.map((teks, posisi) => ({ teks, posisi })).filter((o) => o.teks !== "");
  if (terisi.length < 2) galat.opsi = "Isi minimal 2 opsi jawaban.";

  const posisiBenar = values.benar === "" ? -1 : Number(values.benar);
  if (!(posisiBenar >= 0 && posisiBenar <= 4) || opsi[posisiBenar] === "") {
    galat.benar = "Pilih jawaban yang benar (dari opsi yang terisi).";
  }

  if (Object.keys(galat).length > 0) {
    return { error: "Periksa kembali isian.", fieldErrors: galat, values };
  }

  const tes = await prisma.tes.findUnique({ where: { id: tesId }, select: { id: true } });
  if (!tes) return { error: "Tes tidak ditemukan.", values };

  const daftarOpsi = terisi.map((o) => o.teks);
  const jawabanBenar = terisi.findIndex((o) => o.posisi === posisiBenar);

  if (id) {
    await prisma.soal.updateMany({ where: { id, tesId }, data: { pertanyaan, opsi: daftarOpsi, jawabanBenar } });
  } else {
    const maks = await prisma.soal.aggregate({ where: { tesId }, _max: { urutan: true } });
    await prisma.soal.create({
      data: { tesId, pertanyaan, opsi: daftarOpsi, jawabanBenar, urutan: (maks._max.urutan ?? 0) + 1 },
    });
  }

  revalidatePath(`/admin/praktikum/tes/${tesId}`);
  if (id) redirect(`/admin/praktikum/tes/${tesId}`);
  return { sukses: "Soal ditambahkan." };
}

export async function hapusSoal(_p: FormState, formData: FormData): Promise<FormState> {
  await wajibStaf();
  const id = Number(formData.get("id"));
  const s = await prisma.soal.findUnique({ where: { id }, select: { tesId: true } });
  if (!s) return {};
  await prisma.soal.delete({ where: { id } });
  revalidatePath(`/admin/praktikum/tes/${s.tesId}`);
  return {};
}
