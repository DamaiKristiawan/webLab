/*
  Warnings:

  - You are about to drop the column `judul` on the `Tes` table. All the data in the column will be lost.
  - You are about to drop the column `modulId` on the `Tes` table. All the data in the column will be lost.
  - You are about to drop the `Modul` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[tesId,npm]` on the table `HasilTes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[judulId,jenis]` on the table `Tes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `judulId` to the `Tes` table without a default value. This is not possible if the table is not empty.
  - Made the column `durasiMenit` on table `Tes` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Modul" DROP CONSTRAINT "Modul_praktikumId_fkey";

-- DropForeignKey
ALTER TABLE "Tes" DROP CONSTRAINT "Tes_modulId_fkey";

-- DropIndex
DROP INDEX "HasilTes_tesId_idx";

-- DropIndex
DROP INDEX "Tes_modulId_jenis_key";

-- AlterTable
ALTER TABLE "HasilTes" ADD COLUMN     "terlambat" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Praktikum" ADD COLUMN     "modulUrl" TEXT;

-- AlterTable
ALTER TABLE "Tes" DROP COLUMN "judul",
DROP COLUMN "modulId",
ADD COLUMN     "judulId" INTEGER NOT NULL,
ADD COLUMN     "kodeAkses" TEXT,
ALTER COLUMN "durasiMenit" SET NOT NULL,
ALTER COLUMN "durasiMenit" SET DEFAULT 30;

-- DropTable
DROP TABLE "Modul";

-- CreateTable
CREATE TABLE "JudulPraktikum" (
    "id" SERIAL NOT NULL,
    "praktikumId" INTEGER NOT NULL,
    "urutan" INTEGER NOT NULL,
    "judul" TEXT NOT NULL,

    CONSTRAINT "JudulPraktikum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SesiTes" (
    "id" SERIAL NOT NULL,
    "tesId" INTEGER NOT NULL,
    "npm" TEXT NOT NULL,
    "namaPeserta" TEXT NOT NULL,
    "mulaiPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "batasPada" TIMESTAMP(3) NOT NULL,
    "selesai" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SesiTes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JudulPraktikum_praktikumId_urutan_key" ON "JudulPraktikum"("praktikumId", "urutan");

-- CreateIndex
CREATE UNIQUE INDEX "SesiTes_tesId_npm_key" ON "SesiTes"("tesId", "npm");

-- CreateIndex
CREATE UNIQUE INDEX "HasilTes_tesId_npm_key" ON "HasilTes"("tesId", "npm");

-- CreateIndex
CREATE UNIQUE INDEX "Tes_judulId_jenis_key" ON "Tes"("judulId", "jenis");

-- AddForeignKey
ALTER TABLE "JudulPraktikum" ADD CONSTRAINT "JudulPraktikum_praktikumId_fkey" FOREIGN KEY ("praktikumId") REFERENCES "Praktikum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tes" ADD CONSTRAINT "Tes_judulId_fkey" FOREIGN KEY ("judulId") REFERENCES "JudulPraktikum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SesiTes" ADD CONSTRAINT "SesiTes_tesId_fkey" FOREIGN KEY ("tesId") REFERENCES "Tes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
