/*
  Warnings:

  - A unique constraint covering the columns `[pengajuanId]` on the table `Jadwal` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Jadwal" ADD COLUMN     "pengajuanId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Jadwal_pengajuanId_key" ON "Jadwal"("pengajuanId");

-- AddForeignKey
ALTER TABLE "Jadwal" ADD CONSTRAINT "Jadwal_pengajuanId_fkey" FOREIGN KEY ("pengajuanId") REFERENCES "Pengajuan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
