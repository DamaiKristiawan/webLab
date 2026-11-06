-- CreateEnum
CREATE TYPE "JabatanLab" AS ENUM ('KEPALA_LAB', 'PLP', 'ASISTEN');

-- CreateEnum
CREATE TYPE "JenisJadwal" AS ENUM ('PRAKTIKUM', 'SEMINAR', 'LAINNYA');

-- CreateEnum
CREATE TYPE "JenisPengajuan" AS ENUM ('ALAT', 'RUANGAN', 'PENELITIAN');

-- CreateEnum
CREATE TYPE "StatusPengajuan" AS ENUM ('MENUNGGU', 'DISETUJUI', 'DITOLAK', 'SELESAI', 'DIBATALKAN');

-- CreateEnum
CREATE TYPE "JenisTes" AS ENUM ('PRETEST', 'POSTEST');

-- CreateEnum
CREATE TYPE "TipePertanyaan" AS ENUM ('SKALA', 'TEKS');

-- CreateTable
CREATE TABLE "Staff" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnggotaLab" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "jabatan" "JabatanLab" NOT NULL,
    "nipNpm" TEXT,
    "email" TEXT,
    "kontak" TEXT,
    "bidang" TEXT,
    "fotoUrl" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "aktif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AnggotaLab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pengaturan" (
    "id" SERIAL NOT NULL,
    "kunci" TEXT NOT NULL,
    "nilai" TEXT NOT NULL,

    CONSTRAINT "Pengaturan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pengumuman" (
    "id" SERIAL NOT NULL,
    "judul" TEXT NOT NULL,
    "isi" TEXT NOT NULL,
    "mulaiTampil" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "selesaiTampil" TIMESTAMP(3),
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pengumuman_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ruangan" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "kapasitas" INTEGER,
    "deskripsi" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Ruangan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alat" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "kategori" TEXT,
    "stokTotal" INTEGER NOT NULL DEFAULT 1,
    "kondisi" TEXT DEFAULT 'Baik',
    "deskripsi" TEXT,
    "fotoUrl" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Alat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jadwal" (
    "id" SERIAL NOT NULL,
    "judul" TEXT NOT NULL,
    "jenis" "JenisJadwal" NOT NULL DEFAULT 'PRAKTIKUM',
    "mulai" TIMESTAMP(3) NOT NULL,
    "selesai" TIMESTAMP(3) NOT NULL,
    "ruanganId" INTEGER,
    "praktikumId" INTEGER,
    "kelas" TEXT,
    "pengampu" TEXT,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Jadwal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pengajuan" (
    "id" SERIAL NOT NULL,
    "kode" TEXT NOT NULL,
    "jenis" "JenisPengajuan" NOT NULL,
    "status" "StatusPengajuan" NOT NULL DEFAULT 'MENUNGGU',
    "namaLengkap" TEXT NOT NULL,
    "npm" TEXT NOT NULL,
    "programStudi" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "noHp" TEXT NOT NULL,
    "keperluan" TEXT NOT NULL,
    "keterangan" TEXT,
    "tanggalMulai" TIMESTAMP(3) NOT NULL,
    "tanggalSelesai" TIMESTAMP(3) NOT NULL,
    "ruanganId" INTEGER,
    "judulPenelitian" TEXT,
    "dosenPembimbing" TEXT,
    "abstrak" TEXT,
    "buktiUrl" TEXT,
    "buktiLink" TEXT,
    "catatanAdmin" TEXT,
    "diprosesOlehId" INTEGER,
    "diprosesPada" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pengajuan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PengajuanAlat" (
    "id" SERIAL NOT NULL,
    "pengajuanId" INTEGER NOT NULL,
    "alatId" INTEGER NOT NULL,
    "jumlah" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "PengajuanAlat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Praktikum" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "deskripsi" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Praktikum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Modul" (
    "id" SERIAL NOT NULL,
    "praktikumId" INTEGER NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT,
    "fileUrl" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Modul_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tes" (
    "id" SERIAL NOT NULL,
    "modulId" INTEGER NOT NULL,
    "jenis" "JenisTes" NOT NULL,
    "judul" TEXT NOT NULL,
    "durasiMenit" INTEGER,
    "aktif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Tes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Soal" (
    "id" SERIAL NOT NULL,
    "tesId" INTEGER NOT NULL,
    "pertanyaan" TEXT NOT NULL,
    "opsi" JSONB NOT NULL,
    "jawabanBenar" INTEGER NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Soal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HasilTes" (
    "id" SERIAL NOT NULL,
    "tesId" INTEGER NOT NULL,
    "namaPeserta" TEXT NOT NULL,
    "npm" TEXT NOT NULL,
    "skor" DOUBLE PRECISION NOT NULL,
    "jumlahBenar" INTEGER NOT NULL,
    "jumlahSoal" INTEGER NOT NULL,
    "jawaban" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HasilTes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Survei" (
    "id" SERIAL NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Survei_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PertanyaanSurvei" (
    "id" SERIAL NOT NULL,
    "surveiId" INTEGER NOT NULL,
    "teks" TEXT NOT NULL,
    "tipe" "TipePertanyaan" NOT NULL DEFAULT 'SKALA',
    "urutan" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PertanyaanSurvei_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResponSurvei" (
    "id" SERIAL NOT NULL,
    "surveiId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResponSurvei_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JawabanSurvei" (
    "id" SERIAL NOT NULL,
    "responId" INTEGER NOT NULL,
    "pertanyaanId" INTEGER NOT NULL,
    "nilai" INTEGER,
    "teks" TEXT,

    CONSTRAINT "JawabanSurvei_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dokumentasi" (
    "id" SERIAL NOT NULL,
    "judul" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ringkasan" TEXT,
    "isi" TEXT,
    "coverUrl" TEXT,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "terbit" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dokumentasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DokumentasiFoto" (
    "id" SERIAL NOT NULL,
    "dokumentasiId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DokumentasiFoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Staff_email_key" ON "Staff"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Pengaturan_kunci_key" ON "Pengaturan"("kunci");

-- CreateIndex
CREATE INDEX "Jadwal_mulai_idx" ON "Jadwal"("mulai");

-- CreateIndex
CREATE UNIQUE INDEX "Pengajuan_kode_key" ON "Pengajuan"("kode");

-- CreateIndex
CREATE INDEX "Pengajuan_status_idx" ON "Pengajuan"("status");

-- CreateIndex
CREATE INDEX "Pengajuan_jenis_idx" ON "Pengajuan"("jenis");

-- CreateIndex
CREATE INDEX "Pengajuan_tanggalMulai_idx" ON "Pengajuan"("tanggalMulai");

-- CreateIndex
CREATE UNIQUE INDEX "PengajuanAlat_pengajuanId_alatId_key" ON "PengajuanAlat"("pengajuanId", "alatId");

-- CreateIndex
CREATE UNIQUE INDEX "Praktikum_slug_key" ON "Praktikum"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Tes_modulId_jenis_key" ON "Tes"("modulId", "jenis");

-- CreateIndex
CREATE INDEX "HasilTes_tesId_idx" ON "HasilTes"("tesId");

-- CreateIndex
CREATE UNIQUE INDEX "Dokumentasi_slug_key" ON "Dokumentasi"("slug");

-- AddForeignKey
ALTER TABLE "Jadwal" ADD CONSTRAINT "Jadwal_ruanganId_fkey" FOREIGN KEY ("ruanganId") REFERENCES "Ruangan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Jadwal" ADD CONSTRAINT "Jadwal_praktikumId_fkey" FOREIGN KEY ("praktikumId") REFERENCES "Praktikum"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pengajuan" ADD CONSTRAINT "Pengajuan_ruanganId_fkey" FOREIGN KEY ("ruanganId") REFERENCES "Ruangan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pengajuan" ADD CONSTRAINT "Pengajuan_diprosesOlehId_fkey" FOREIGN KEY ("diprosesOlehId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengajuanAlat" ADD CONSTRAINT "PengajuanAlat_pengajuanId_fkey" FOREIGN KEY ("pengajuanId") REFERENCES "Pengajuan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengajuanAlat" ADD CONSTRAINT "PengajuanAlat_alatId_fkey" FOREIGN KEY ("alatId") REFERENCES "Alat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Modul" ADD CONSTRAINT "Modul_praktikumId_fkey" FOREIGN KEY ("praktikumId") REFERENCES "Praktikum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tes" ADD CONSTRAINT "Tes_modulId_fkey" FOREIGN KEY ("modulId") REFERENCES "Modul"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Soal" ADD CONSTRAINT "Soal_tesId_fkey" FOREIGN KEY ("tesId") REFERENCES "Tes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HasilTes" ADD CONSTRAINT "HasilTes_tesId_fkey" FOREIGN KEY ("tesId") REFERENCES "Tes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PertanyaanSurvei" ADD CONSTRAINT "PertanyaanSurvei_surveiId_fkey" FOREIGN KEY ("surveiId") REFERENCES "Survei"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResponSurvei" ADD CONSTRAINT "ResponSurvei_surveiId_fkey" FOREIGN KEY ("surveiId") REFERENCES "Survei"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JawabanSurvei" ADD CONSTRAINT "JawabanSurvei_responId_fkey" FOREIGN KEY ("responId") REFERENCES "ResponSurvei"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JawabanSurvei" ADD CONSTRAINT "JawabanSurvei_pertanyaanId_fkey" FOREIGN KEY ("pertanyaanId") REFERENCES "PertanyaanSurvei"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DokumentasiFoto" ADD CONSTRAINT "DokumentasiFoto_dokumentasiId_fkey" FOREIGN KEY ("dokumentasiId") REFERENCES "Dokumentasi"("id") ON DELETE CASCADE ON UPDATE CASCADE;
