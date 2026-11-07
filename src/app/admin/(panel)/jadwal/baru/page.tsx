import { prisma } from "@/lib/prisma";
import { wajibLogin } from "@/lib/auth";
import { FormJadwal } from "@/components/admin/form-jadwal";

export const metadata = { title: "Tambah Jadwal" };

export default async function JadwalBaru() {
  await wajibLogin();

  const [ruangan, praktikum] = await Promise.all([
    prisma.ruangan.findMany({ where: { aktif: true }, orderBy: { nama: "asc" }, select: { id: true, nama: true } }),
    prisma.praktikum.findMany({ where: { aktif: true }, orderBy: { nama: "asc" }, select: { id: true, nama: true } }),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Tambah Jadwal</h1>
      <FormJadwal ruangan={ruangan} praktikum={praktikum} />
    </div>
  );
}