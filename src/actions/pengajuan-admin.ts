"use server";

import { revalidatePath } from "next/cache";
import type { StatusPengajuan } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { wajibAdmin } from "@/lib/auth";
import { bentrokRuangan, stokSisa } from "@/lib/ketersediaan";
import { labelStatus } from "@/lib/konstanta";
import { formatJam, formatTanggalPendek } from "@/lib/waktu";
import type { FormState } from "@/lib/form";

// Peralihan status yang diizinkan
const ATURAN: Record<string, { dari: StatusPengajuan[]; ke: StatusPengajuan; wajibCatatan: boolean }> = {
  SETUJUI: { dari: ["MENUNGGU"], ke: "DISETUJUI", wajibCatatan: false },
  TOLAK: { dari: ["MENUNGGU"], ke: "DITOLAK", wajibCatatan: true },
  SELESAI: { dari: ["DISETUJUI"], ke: "SELESAI", wajibCatatan: false },
  BATALKAN: { dari: ["MENUNGGU", "DISETUJUI"], ke: "DIBATALKAN", wajibCatatan: true },
};

export async function prosesPengajuan(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await wajibAdmin();

  const id = Number(formData.get("id")) || 0;
  const aksi = String(formData.get("aksi") ?? "");
  const catatan = String(formData.get("catatan") ?? "").trim();
  const values = { catatan };

  const aturan = ATURAN[aksi];
  if (!aturan) return { error: "Aksi tidak dikenal.", values };
  if (catatan.length > 1000) return { error: "Catatan maksimal 1000 karakter.", values };
  if (aturan.wajibCatatan && catatan.length < 5) {
    return { error: "Isi catatan (alasan) minimal 5 karakter.", values };
  }

  const p = await prisma.pengajuan.findUnique({ where: { id }, include: { alat: true } });
  if (!p) return { error: "Pengajuan tidak ditemukan.", values };
  if (!aturan.dari.includes(p.status)) {
    return { error: `Pengajuan sudah berstatus ${labelStatus[p.status]}. Muat ulang halaman.`, values };
  }

  // Saat menyetujui, periksa ulang ketersediaan: bisa saja sudah ada jadwal/persetujuan lain.
  if (aksi === "SETUJUI") {
    if (p.jenis === "RUANGAN" && p.ruanganId) {
      const { jadwal, pengajuan } = await bentrokRuangan(p.ruanganId, p.tanggalMulai, p.tanggalSelesai, p.id);
      if (jadwal) {
        return {
          error: `Tidak bisa disetujui: ruangan bentrok dengan "${jadwal.judul}" (${formatTanggalPendek(jadwal.mulai)}, ${formatJam(jadwal.mulai)}-${formatJam(jadwal.selesai)} WIB).`,
          values,
        };
      }
      if (pengajuan) {
        return { error: `Tidak bisa disetujui: ruangan bentrok dengan pengajuan ${pengajuan.kode} yang sudah disetujui.`, values };
      }
    }
    for (const a of p.alat) {
      const { nama, sisa } = await stokSisa(a.alatId, p.tanggalMulai, p.tanggalSelesai, p.id);
      if (a.jumlah > sisa) {
        return { error: `Tidak bisa disetujui: stok ${nama} pada waktu itu tinggal ${sisa} unit (diminta ${a.jumlah}).`, values };
      }
    }
  }

  const berhasil = await prisma.$transaction(async (tx) => {
    // Syarat status ikut diperiksa agar dua admin tidak saling menimpa
    const r = await tx.pengajuan.updateMany({
      where: { id, status: p.status },
      data: {
        status: aturan.ke,
        catatanAdmin: catatan || p.catatanAdmin,
        diprosesOlehId: admin.id,
        diprosesPada: new Date(),
      },
    });
    if (r.count === 0) return false;

    if (aksi === "SETUJUI" && p.jenis === "RUANGAN" && p.ruanganId) {
      await tx.jadwal.create({
        data: {
          judul: "Peminjaman ruangan",
          jenis: "LAINNYA",
          mulai: p.tanggalMulai,
          selesai: p.tanggalSelesai,
          ruanganId: p.ruanganId,
          pengajuanId: p.id,
        },
      });
    }
    if (aksi === "BATALKAN") {
      await tx.jadwal.deleteMany({ where: { pengajuanId: p.id } });
    }
    return true;
  });

  if (!berhasil) return { error: "Status pengajuan baru saja berubah. Muat ulang halaman.", values };

  revalidatePath("/admin/pengajuan");
  revalidatePath(`/admin/pengajuan/${id}`);
  revalidatePath("/admin");
  revalidatePath("/admin/jadwal");
  revalidatePath("/jadwal");

  return { sukses: `Status diubah menjadi ${labelStatus[aturan.ke]}.` };
}