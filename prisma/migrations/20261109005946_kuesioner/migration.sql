/*
  Warnings:

  - A unique constraint covering the columns `[surveiId,npm]` on the table `ResponSurvei` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[kode,tahun]` on the table `Survei` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PertanyaanSurvei" ADD COLUMN     "kelompok" TEXT;

-- AlterTable
ALTER TABLE "ResponSurvei" ADD COLUMN     "namaPeserta" TEXT,
ADD COLUMN     "npm" TEXT;

-- AlterTable
ALTER TABLE "Survei" ADD COLUMN     "kode" TEXT NOT NULL DEFAULT 'umum',
ADD COLUMN     "tahun" INTEGER NOT NULL DEFAULT 2026;

-- CreateIndex
CREATE UNIQUE INDEX "ResponSurvei_surveiId_npm_key" ON "ResponSurvei"("surveiId", "npm");

-- CreateIndex
CREATE UNIQUE INDEX "Survei_kode_tahun_key" ON "Survei"("kode", "tahun");
