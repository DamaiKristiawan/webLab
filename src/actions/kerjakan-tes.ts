"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { kumpulkanGalat, type FormState } from "@/lib/form";
import { ambilIp, batasi, IP_TAK_DIKENAL } from "@/lib/batas";
import { skemaPeserta } from "@/lib/validasi";

const TOLERANSI_MS = 30_000;
const SATU_JAM = 60 * 60 * 1000;

export type SoalPublik = { id: number; pertanyaan: string; opsi: string[] };

export type MulaiState = FormState & {
  sesi?: { soal: SoalPublik[]; sisaDetik: number; nama: string; npm: string };
};

export type KirimState = FormState & { terkirim?: boolean };

function adaGalatUnik(e: unknown) {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
}

async function lolosBatas(awalan: string) {
  const ip = await ambilIp();
  const maks = ip === IP_TAK_DIKENAL ? 600 : 300;
  return batasi(`${awalan}:${ip}`, maks, SATU_JAM);
}

export async function mulaiTes(_prev: MulaiState, formData: FormData): Promise<MulaiState> {
  const tesId = Number(formData.get("tesId")) || 0;
  const kode = String(formData.get("kode") ?? "").trim().toUpperCase();
  const values = {
    namaPeserta: String(formData.get("namaPeserta") ?? ""),
    npm: String(formData.get("npm") ?? ""),
  };

  const h = skemaPeserta.safeParse(values);
  if (!h.success) {
    return { error: "Periksa kembali isian.", fieldErrors: kumpulkanGalat(h.error.issues), values };
  }
  const { namaPeserta, npm } = h.data;

  const tes = await prisma.tes.findFirst({
    where: { id: tesId, aktif: true, judulPraktikum: { praktikum: { aktif: true } } },
    include: { soal: { orderBy: [{ urutan: "asc" }, { id: "asc" }], select: { id: true, pertanyaan: true, opsi: true } } },
  });
  if (!tes || tes.soal.length === 0) return { error: "Tes ini tidak tersedia.", values };

  if (!(await lolosBatas("mulai"))) {
    return { error: "Terlalu banyak permintaan dari jaringan Anda. Coba lagi nanti.", values };
  }

  const sudah = await prisma.hasilTes.findUnique({
    where: { tesId_npm: { tesId, npm } },
    select: { id: true },
  });
  if (sudah) {
    return { error: "NPM ini sudah mengerjakan tes ini. Tes hanya dapat dikerjakan satu kali.", values };
  }

  let sesi = await prisma.sesiTes.findUnique({ where: { tesId_npm: { tesId, npm } } });
  if (!sesi) {
    if (!tes.kodeAkses) {
      return { error: "Tes ini belum dibuka oleh asisten. Minta kode akses kepada asisten.", values };
    }
    if (kode !== tes.kodeAkses) {
      return { error: "Kode akses salah. Minta kode yang benar kepada asisten.", values };
    }
    try {
      sesi = await prisma.sesiTes.create({
        data: { tesId, npm, namaPeserta, batasPada: new Date(Date.now() + tes.durasiMenit * 60_000) },
      });
    } catch (e) {
      if (!adaGalatUnik(e)) throw e;
      sesi = await prisma.sesiTes.findUnique({ where: { tesId_npm: { tesId, npm } } });
    }
  }
  if (!sesi) return { error: "Gagal memulai tes. Coba lagi.", values };

  const sisaDetik = Math.floor((sesi.batasPada.getTime() - Date.now()) / 1000);
  if (sesi.selesai || sisaDetik <= 0) {
    return {
      error: "Waktu tes untuk NPM ini sudah habis atau sudah dikumpulkan. Hubungi asisten bila ada kendala.",
      values,
    };
  }

  return {
    values,
    sesi: {
      soal: tes.soal.map((s) => ({
        id: s.id,
        pertanyaan: s.pertanyaan,
        opsi: (Array.isArray(s.opsi) ? s.opsi : []).map(String),
      })),
      sisaDetik,
      nama: sesi.namaPeserta,
      npm: sesi.npm,
    },
  };
}

export async function kirimTes(_prev: KirimState, formData: FormData): Promise<KirimState> {
  const tesId = Number(formData.get("tesId")) || 0;
  const npm = String(formData.get("npm") ?? "").trim().toUpperCase();

  if (!(await lolosBatas("kirim"))) {
    return { error: "Terlalu banyak pengiriman dari jaringan Anda. Coba lagi sebentar lagi." };
  }

  const sesi = await prisma.sesiTes.findUnique({ where: { tesId_npm: { tesId, npm } } });
  if (!sesi) return { error: "Sesi tes tidak ditemukan. Muat ulang halaman dan mulai kembali." };
  if (sesi.selesai) return { sukses: "Jawaban sudah terkirim.", terkirim: true };

  const tes = await prisma.tes.findUnique({
    where: { id: tesId },
    include: { soal: { select: { id: true, jawabanBenar: true } } },
  });
  if (!tes || tes.soal.length === 0) return { error: "Tes ini tidak tersedia." };

  const jawaban: Record<string, number | null> = {};
  let benar = 0;
  for (const s of tes.soal) {
    const mentah = formData.get(`j_${s.id}`);
    const n = mentah === null || mentah === "" ? null : Number(mentah);
    const sah = n !== null && Number.isInteger(n) && n >= 0 && n <= 4 ? n : null;
    jawaban[String(s.id)] = sah;
    if (sah !== null && sah === s.jawabanBenar) benar++;
  }

  const jumlah = tes.soal.length;
  const skor = Math.round((benar / jumlah) * 10000) / 100;
  const terlambat = Date.now() > sesi.batasPada.getTime() + TOLERANSI_MS;

  try {
    await prisma.$transaction([
      prisma.hasilTes.create({
        data: {
          tesId,
          namaPeserta: sesi.namaPeserta,
          npm: sesi.npm,
          skor,
          jumlahBenar: benar,
          jumlahSoal: jumlah,
          jawaban,
          terlambat,
        },
      }),
      prisma.sesiTes.update({ where: { id: sesi.id }, data: { selesai: true } }),
    ]);
  } catch (e) {
    if (adaGalatUnik(e)) return { sukses: "Jawaban sudah terkirim.", terkirim: true };
    throw e;
  }

  return { sukses: "Jawaban terkirim.", terkirim: true };
}
