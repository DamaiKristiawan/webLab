/*
  Warnings:

  - You are about to drop the column `email` on the `AnggotaLab` table. All the data in the column will be lost.
  - You are about to drop the column `kontak` on the `AnggotaLab` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "JabatanLab" ADD VALUE 'KOORDINATOR';

-- AlterTable
ALTER TABLE "AnggotaLab" DROP COLUMN "email",
DROP COLUMN "kontak";
