import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { wajibLogin } from "@/lib/auth";
import { keInputWib } from "@/lib/waktu";
import { FormJadwal } from "@/components/admin/form-jadwal";

export const metadata = { title: "Ubah Jadwal" };

export default async function UbahJadwal({ params }: { params: Promise<{ id: string }> }) {
  await wajibLogin();

  const { id } = await params;
  const nomor = Number(id);
  if (!Number.isInteger(nomor)) notFound();

  const [jadwal, ruangan, praktikum] = await Promise.all([
    prisma.jadwal.findUnique({ where: { id: nomor } }),
    prisma.ruangan.findMany({ where: { aktif: true }, orderBy: { nama: "asc" }, select: { id: true, nama: true } }),
    prisma.praktikum.findMany({ where: { aktif: true }, orderBy: { nama: "asc" }, select: { id: true, nama: true } }),
  ]);
  if (!jadwal) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Ubah Jadwal</h1>
      <FormJadwal
        ruangan={ruangan}
        praktikum={praktikum}
        awal={{
          id: jadwal.id,
          judul: jadwal.judul,
          jenis: jadwal.jenis,
          mulai: keInputWib(jadwal.mulai),
          selesai: keInputWib(jadwal.selesai),
          ruanganId: jadwal.ruanganId ? String(jadwal.ruanganId) : "",
          praktikumId: jadwal.praktikumId ? String(jadwal.praktikumId) : "",
          kelas: jadwal.kelas ?? "",
          pengampu: jadwal.pengampu ?? "",
          keterangan: jadwal.keterangan ?? "",
        }}
      />
    </div>
  );
}