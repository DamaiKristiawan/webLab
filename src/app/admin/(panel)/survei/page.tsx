import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { wajibAdmin } from "@/lib/auth";
import { alihkanSurvei } from "@/actions/survei";
import { FormBuatStandar } from "@/components/admin/form-survei";
import { TombolAksi } from "@/components/admin/tombol-aksi";
import { DAFTAR_KUESIONER } from "@/lib/kuesioner";
import { cn } from "@/lib/utils";

export const metadata = { title: "Kuesioner" };

export default async function HalamanKuesionerAdmin() {
  await wajibAdmin();

  const daftar = await prisma.survei.findMany({
    orderBy: [{ tahun: "desc" }, { id: "asc" }],
    include: { _count: { select: { respon: true, pertanyaan: true } } },
  });

  const tahunAwal = daftar.length ? Math.max(...daftar.map((s) => s.tahun)) + 1 : new Date().getFullYear();
  const namaKode = (k: string) => DAFTAR_KUESIONER.find((d) => d.kode === k)?.judul ?? "Lainnya";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Kuesioner</h1>
          <p className="text-sm text-muted-foreground">
            Jawaban lengkap dengan nama dan NPM, hanya terlihat oleh admin. Satu NPM satu kali per periode.
          </p>
        </div>
        <Link href="/survei" target="_blank" className="btn btn-outline">Lihat halaman publik ↗</Link>
      </div>

      {daftar.length === 0 ? (
        <div className="card p-10 text-center text-sm text-muted-foreground">
          Belum ada kuesioner. Buat keempat kuesioner standar di bawah.
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-3 font-semibold">Kuesioner</th>
                <th className="p-3 font-semibold">Periode</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 text-right font-semibold">Responden</th>
                <th className="p-3 text-right font-semibold">Pertanyaan</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {daftar.map((s) => (
                <tr key={s.id}>
                  <td className="p-3">
                    <p className="font-medium">{s.judul}</p>
                    <p className="label-mono mt-0.5">{namaKode(s.kode)}</p>
                  </td>
                  <td className="p-3 tabular-nums">{s.tahun}</td>
                  <td className="p-3">
                    <span className={cn("pill", s.aktif ? "pill-ok" : "pill-no")}>{s.aktif ? "Dibuka" : "Ditutup"}</span>
                  </td>
                  <td className="p-3 text-right tabular-nums">{s._count.respon.toLocaleString("id-ID")}</td>
                  <td className="p-3 text-right tabular-nums">{s._count.pertanyaan}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Link href={`/admin/survei/${s.id}`} className="btn btn-outline h-8 px-3">Kelola</Link>
                      <TombolAksi aksi={alihkanSurvei} id={s.id} label={s.aktif ? "Tutup" : "Buka"} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="max-w-xl">
        <FormBuatStandar tahunAwal={tahunAwal} />
      </div>
    </div>
  );
}