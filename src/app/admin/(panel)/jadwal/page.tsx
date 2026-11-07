import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { wajibLogin } from "@/lib/auth";
import { hapusJadwal } from "@/actions/jadwal";
import { TombolHapus } from "@/components/admin/tombol-hapus";
import { labelJenis } from "@/lib/konstanta";
import { formatJam, formatTanggalPendek } from "@/lib/waktu";

export const metadata = { title: "Kelola Jadwal" };

export default async function AdminJadwal() {
  await wajibLogin();

  const daftar = await prisma.jadwal.findMany({
    orderBy: { mulai: "desc" },
    take: 200,
    include: { ruangan: { select: { nama: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Jadwal</h1>
          <p className="text-sm text-muted-foreground">Praktikum, seminar, dan kegiatan lab.</p>
        </div>
        <Link href="/admin/jadwal/baru" className="btn btn-primary">
          <Plus className="h-4 w-4" />
          Tambah Jadwal
        </Link>
      </div>

      {daftar.length === 0 ? (
        <div className="card p-8 text-center text-sm text-muted-foreground">
          Belum ada jadwal. Klik &quot;Tambah Jadwal&quot; untuk mulai.
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Waktu</th>
                <th className="px-4 py-3">Kegiatan</th>
                <th className="px-4 py-3">Jenis</th>
                <th className="px-4 py-3">Ruangan</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {daftar.map((j) => {
                const meta = [j.kelas ? `Kelas ${j.kelas}` : null, j.pengampu]
                  .filter(Boolean)
                  .join(" · ");
                return (
                  <tr key={j.id}>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums">
                      <p className="font-medium">{formatTanggalPendek(j.mulai)}</p>
                      <p className="text-muted-foreground">
                        {formatJam(j.mulai)}-{formatJam(j.selesai)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{j.judul}</p>
                      {meta && <p className="text-muted-foreground">{meta}</p>}
                    </td>
                    <td className="px-4 py-3">{labelJenis[j.jenis]}</td>
                    <td className="px-4 py-3">{j.ruangan?.nama ?? "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/jadwal/${j.id}`} className="btn btn-outline h-8 px-3">
                          <Pencil className="h-4 w-4" />
                          Ubah
                        </Link>
                        <TombolHapus
                          aksi={hapusJadwal}
                          id={j.id}
                          pesan={`Hapus jadwal "${j.judul}"?`}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}