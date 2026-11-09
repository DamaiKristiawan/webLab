export const JENIS_JADWAL = ["PRAKTIKUM", "SEMINAR", "LAINNYA"] as const;
export type JenisJadwalKey = (typeof JENIS_JADWAL)[number];

export const labelJenis: Record<JenisJadwalKey, string> = {
  PRAKTIKUM: "Praktikum",
  SEMINAR: "Seminar",
  LAINNYA: "Kegiatan lain",
};

export const labelJenisPengajuan = {
  ALAT: "Peminjaman alat",
  RUANGAN: "Peminjaman ruangan",
  PENELITIAN: "Penelitian",
} as const;

export const labelStatus = {
  MENUNGGU: "Menunggu",
  DISETUJUI: "Disetujui",
  DITOLAK: "Ditolak",
  SELESAI: "Selesai",
  DIBATALKAN: "Dibatalkan",
} as const;

export const labelJabatan = {
  KEPALA_LAB: "Kepala Laboratorium",
  DOSEN: "Dosen Laboratorium",
  PLP: "PLP",
  KOORDINATOR: "Koordinator Laboratorium",
  ASISTEN: "Asisten Laboratorium",
} as const;

export const labelRol = {
  ADMIN: "Admin",
  ASISTEN: "Asisten",
} as const;