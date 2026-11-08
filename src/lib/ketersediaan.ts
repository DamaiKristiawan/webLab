import { prisma } from "@/lib/prisma";

// Dipakai saat pengajuan masuk (5A) dan saat admin menyetujui (5B).
// Pengajuan yang masih MENUNGGU tidak memblokir; hanya jadwal resmi dan pengajuan DISETUJUI.

export async function bentrokRuangan(
  ruanganId: number,
  mulai: Date,
  selesai: Date,
  kecualiPengajuanId?: number,
) {
  const [jadwal, pengajuan] = await Promise.all([
    prisma.jadwal.findFirst({
      where: { ruanganId, mulai: { lt: selesai }, selesai: { gt: mulai } },
      select: { judul: true, mulai: true, selesai: true },
    }),
    prisma.pengajuan.findFirst({
      where: {
        ruanganId,
        status: "DISETUJUI",
        id: kecualiPengajuanId ? { not: kecualiPengajuanId } : undefined,
        tanggalMulai: { lt: selesai },
        tanggalSelesai: { gt: mulai },
      },
      select: { kode: true, tanggalMulai: true, tanggalSelesai: true },
    }),
  ]);
  return { jadwal, pengajuan };
}

/** Sisa stok sebuah alat pada rentang waktu (stok total dikurangi pengajuan DISETUJUI yang beririsan). */
export async function stokSisa(
  alatId: number,
  mulai: Date,
  selesai: Date,
  kecualiPengajuanId?: number,
) {
  const [alat, terpakai] = await Promise.all([
    prisma.alat.findUnique({ where: { id: alatId }, select: { nama: true, stokTotal: true } }),
    prisma.pengajuanAlat.aggregate({
      _sum: { jumlah: true },
      where: {
        alatId,
        pengajuan: {
          status: "DISETUJUI",
          id: kecualiPengajuanId ? { not: kecualiPengajuanId } : undefined,
          tanggalMulai: { lt: selesai },
          tanggalSelesai: { gt: mulai },
        },
      },
    }),
  ]);
  const dipakai = terpakai._sum.jumlah ?? 0;
  return { nama: alat?.nama ?? "Alat", sisa: Math.max(0, (alat?.stokTotal ?? 0) - dipakai) };
}