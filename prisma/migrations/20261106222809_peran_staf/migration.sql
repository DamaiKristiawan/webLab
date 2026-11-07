/*
  Warnings:

  - A unique constraint covering the columns `[staffId]` on the table `AnggotaLab` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `Staff` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `Staff` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RolStaff" AS ENUM ('ADMIN', 'ASISTEN');

-- AlterEnum
ALTER TYPE "JabatanLab" ADD VALUE 'DOSEN';

-- DropIndex
DROP INDEX "Staff_email_key";

-- AlterTable
ALTER TABLE "AnggotaLab" ADD COLUMN     "angkatan" INTEGER,
ADD COLUMN     "label" TEXT,
ADD COLUMN     "staffId" INTEGER;

-- AlterTable
ALTER TABLE "Staff" ADD COLUMN     "rol" "RolStaff" NOT NULL DEFAULT 'ASISTEN',
ADD COLUMN     "username" TEXT NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AnggotaLab_staffId_key" ON "AnggotaLab"("staffId");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_username_key" ON "Staff"("username");

-- AddForeignKey
ALTER TABLE "AnggotaLab" ADD CONSTRAINT "AnggotaLab_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
