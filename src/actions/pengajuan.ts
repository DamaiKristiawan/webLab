"use server";

import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { kumpulkanGalat, type FormState } from "@/lib/form";
import { ambilIp, batasi, IP_TAK_DIKENAL } from "@/lib/batas";
import { buatKode, parseWib } from "@/lib/pengajuan";
import { bentrokRuangan, stokSisa } from "@/lib/ketersediaan";
import { periksaBerkas, simpanBerkas, type BerkasValid } from "@/lib/penyimpanan";
import { formatJam, formatTanggalPendek } from "@/lib/waktu";

const skema = z.object({
  namaLengkap: z.string().trim().min(3, "Nama minimal 3 karakter.").max(100, "Nama maksimal 100 karakter."),
  npm: z.string().trim().regex(/^[0-9A-Za-z]{5,20}$/, "NPM/NIM 5-20 karakter (huruf atau angka)."),
  programStudi: z.string().trim().min(2, "Isi program studi.").max(100, "Maksimal 100 karakter."),
  email: z.string().trim().max(120, "Maksimal 120 karakter.").regex(/^\S+@\S+\.\S+$/, "Email tidak valid."),
  noHp: z.string().trim().regex(/^[0-9+\-\s]{8,20}$/, "Nomor HP tidak valid."),
  keperluan: z.string().trim().min(10, "Jelaskan keperluan minimal 10 karakter.").max(1000, "Maksimal 1000 karakter."),
  keterangan: z.string().trim().max(1000, "Maksimal 1000 karakter."),
  tanggalMulai: z.string(),
  tanggalSelesai: z.string(),
  ruanganId: z.string().trim().regex(/^\d*$/, "Pilihan tidak valid."),
  judulPenelitian: z.string().trim().max(250, "Maksimal 250 karakter."),
  dosenPembimbing: z.string().trim().max(120, "Maksimal 120 karakter."),
  abstrak: z.string().trim().max(3000, "Maksimal 3000 karakter."),
});

// Kolom yang hanya ada di sebagian jenis formulir: bila tidak dikirim dianggap kosong.
const KOLOM_TEKS = [
  "namaLengkap",
  "npm",
  "programStudi",
  "email",
  "noHp",
  "keperluan",
  "keterangan",
  "tanggalMulai",
  "tanggalSelesai",
  "ruanganId",
  "judulPenelitian",
  "dosenPembimbing",
  "abstrak",
];

const SATU_HARI = 24 * 60 * 60 * 1000;

export async function kirimPengajuan(_prev: FormState, formData: FormData): Promise<FormState> {
  const jenis = String(formData.get("jenis") ?? "");
  if (jenis !== "ALAT" && jenis !== "RUANGAN" && jenis !== "PENELITIAN") {
    return { error: "Jenis pengajuan tidak valid." };
  }

  // Jebakan bot: kolom ini tersembunyi, manusia tidak akan mengisinya.
  if (String(formData.get("website") ?? "") !== "") redirect("/pengajuan/status");

  // Nilai yang dikembalikan ke formulir bila gagal (berkas tidak bisa dikembalikan)
  const values: Record<string, string> = {};
  for (const [k, v] of formData.entries()) if (typeof v === "string") values[k] = v;
  for (const k of KOLOM_TEKS) values[k] ??= "";

  const hasil = skema.safeParse(values);
  const galat: Record<string, string> = hasil.success ? {} : kumpulkanGalat(hasil.error.issues);
  const d = hasil.success ? hasil.data : null;

  // ---- Waktu ----
  const mulai = parseWib(values.tanggalMulai);
  const selesai = parseWib(values.tanggalSelesai);
  if (!mulai) galat.tanggalMulai = "Isi tanggal dan jam mulai.";
  if (!selesai) galat.tanggalSelesai = "Isi tanggal dan jam selesai.";
  if (mulai && selesai) {
    if (mulai.getTime() < Date.now() - 5 * 60 * 1000) galat.tanggalMulai = "Waktu mulai tidak boleh di masa lalu.";
    else if (selesai.getTime() <= mulai.getTime()) galat.tanggalSelesai = "Waktu selesai harus setelah waktu mulai.";
    else {
      const batas = jenis === "RUANGAN" ? 1 : 90;
      if (selesai.getTime() - mulai.getTime() > batas * SATU_HARI) {
        galat.tanggalSelesai =
          jenis === "RUANGAN" ? "Peminjaman ruangan maksimal 24 jam." : "Rentang waktu maksimal 90 hari.";
      }
    }
  }

  // ---- Khusus jenis ----
  let ruanganId = 0;
  if (jenis === "RUANGAN") {
    ruanganId = Number(values.ruanganId) || 0;
    if (!ruanganId) galat.ruanganId = "Pilih ruangan.";
  }
  if (jenis === "PENELITIAN") {
    if (values.judulPenelitian.trim().length < 10) galat.judulPenelitian = "Isi judul penelitian (minimal 10 karakter).";
    if (values.dosenPembimbing.trim().length < 3) galat.dosenPembimbing = "Isi nama dosen pembimbing.";
  }

  // ---- Alat (name="alat_<id>", jumlah) ----
  const item: { alatId: number; jumlah: number }[] = [];
  for (const [k, v] of formData.entries()) {
    const m = /^alat_(\d+)$/.exec(k);
    if (!m || typeof v !== "string" || v.trim() === "") continue;
    const n = Number(v);
    if (!Number.isInteger(n) || n < 0 || n > 999) {
      galat.alat = "Jumlah alat tidak valid.";
      continue;
    }
    if (n > 0) item.push({ alatId: Number(m[1]), jumlah: n });
  }
  if (jenis === "ALAT" && item.length === 0 && !galat.alat) galat.alat = "Pilih minimal satu alat.";
  if (jenis === "RUANGAN" && item.length > 0) item.length = 0;

  // ---- Bukti ----
  const f = formData.get("bukti");
  const berkas = f instanceof File && f.size > 0 ? f : null;
  let valid: BerkasValid | null = null;
  if (berkas) {
    const p = await periksaBerkas(berkas);
    if ("error" in p) galat.bukti = p.error;
    else valid = p;
  }
  if (!berkas) galat.bukti = "Unggah surat permohonan (PDF, JPG, atau PNG).";

  if (Object.keys(galat).length > 0 || !d || !mulai || !selesai) {
    return { error: "Periksa kembali isian formulir.", fieldErrors: galat, values };
  }

  // ---- Ketersediaan (data di database) ----
  if (jenis === "RUANGAN") {
    const ada = await prisma.ruangan.findFirst({ where: { id: ruanganId, aktif: true }, select: { id: true } });
    if (!ada) galat.ruanganId = "Ruangan tidak tersedia.";
    else {
      const { jadwal, pengajuan } = await bentrokRuangan(ruanganId, mulai, selesai);
      if (jadwal) {
        galat.ruanganId = `Ruangan sudah terpakai: ${jadwal.judul} (${formatTanggalPendek(jadwal.mulai)}, ${formatJam(jadwal.mulai)}-${formatJam(jadwal.selesai)} WIB). Pilih waktu lain.`;
      } else if (pengajuan) {
        galat.ruanganId = `Ruangan sudah dipesan pada ${formatTanggalPendek(pengajuan.tanggalMulai)}, ${formatJam(pengajuan.tanggalMulai)}-${formatJam(pengajuan.tanggalSelesai)} WIB. Pilih waktu lain.`;
      }
    }
  }

  if (item.length > 0) {
    const valids = await prisma.alat.findMany({
      where: { id: { in: item.map((i) => i.alatId) }, aktif: true },
      select: { id: true },
    });
    if (valids.length !== item.length) {
      galat.alat = "Ada alat yang tidak tersedia. Muat ulang halaman dan coba lagi.";
    } else {
      for (const i of item) {
        const { nama, sisa } = await stokSisa(i.alatId, mulai, selesai);
        if (i.jumlah > sisa) {
          galat.alat = `Stok ${nama} pada waktu itu tinggal ${sisa} unit (diminta ${i.jumlah}).`;
          break;
        }
      }
    }
  }

  if (Object.keys(galat).length > 0) {
    return { error: "Pengajuan belum bisa dikirim.", fieldErrors: galat, values };
  }

  // ---- Pembatas spam ----
  const ip = await ambilIp();
  // Tanpa header IP semua pengunjung berbagi satu hitungan, jadi batasnya dilonggarkan.
  const maks = ip === IP_TAK_DIKENAL ? 100 : 5;
  if (!batasi(`kirim:${ip}`, maks, 60 * 60 * 1000)) {
    return { error: "Terlalu banyak pengajuan dari jaringan Anda. Coba lagi dalam satu jam.", values };
  }

  // ---- Simpan ----
  const kunciBerkas = valid ? await simpanBerkas(valid) : null;

  let kode = "";
  for (let percobaan = 0; percobaan < 5 && !kode; percobaan++) {
    const calon = buatKode();
    try {
      await prisma.pengajuan.create({
        data: {
          kode: calon,
          jenis,
          namaLengkap: d.namaLengkap,
          npm: d.npm,
          programStudi: d.programStudi,
          email: d.email,
          noHp: d.noHp,
          keperluan: d.keperluan,
          keterangan: d.keterangan || null,
          tanggalMulai: mulai,
          tanggalSelesai: selesai,
          ruanganId: jenis === "RUANGAN" ? ruanganId : null,
          judulPenelitian: jenis === "PENELITIAN" ? d.judulPenelitian : null,
          dosenPembimbing: jenis === "PENELITIAN" ? d.dosenPembimbing : null,
          abstrak: jenis === "PENELITIAN" ? d.abstrak || null : null,
          buktiUrl: kunciBerkas,
          alat: item.length > 0 ? { create: item } : undefined,
        },
      });
      kode = calon;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") continue; // kode bentrok, coba lagi
      throw e;
    }
  }
  if (!kode) return { error: "Gagal membuat kode pengajuan. Silakan coba lagi.", values };

  redirect(`/pengajuan/status?kode=${kode}&baru=1`);
}