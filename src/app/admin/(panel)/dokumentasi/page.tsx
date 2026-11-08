import Image from "next/image";
import Link from "next/link";
import { ImageIcon, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { wajibAdmin } from "@/lib/auth";
import { alihkanTerbit, hapusDokumentasi } from "@/actions/dokumentasi";
import { TombolAksi } from "@/components/admin/tombol-aksi";
import { formatTanggalPendek } from "@/lib/waktu";
import { cn } from "@/lib/utils";

export const metadata = { title: "Dokumentasi" };

export default async function HalamanDokumentasiAdmin() {
  await wajibAdmin();
  const daftar = await prisma.dokumentasi.findMany({
    orderBy: { tanggal: "desc" },
    include: { _count: { select: { foto: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Dokumentasi</h1>
          <p className="text-sm text-muted-foreground">Foto dan uraian kegiatan laboratorium.</p>
        </div>
        <Link href="/admin/dokumentasi/baru" className="btn btn-primary">
          <Plus className="h-4 w-4" />
          Kegiatan baru
        </Link>
      </div>

      {daftar.length === 0 ? (
        <p className="card p-10 text-center text-sm text-muted-foreground">Belum ada kegiatan.</p>
      ) : (
        <ul className="space-y-3">
          {daftar.map((k) => (
            <li key={k.id} className={cn("card flex flex-col gap-4 p-4 sm:flex-row sm:items-center", !k.terbit && "opacity-70")}>
              <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:w-44">
                {k.coverUrl ? (
                  <Image src={k.coverUrl} alt="" fill unoptimized sizes="176px" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{k.judul}</p>
                  <span className={cn("pill", k.terbit ? "pill-done" : "pill-no")}>{k.terbit ? "Tampil" : "Disembunyikan"}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatTanggalPendek(k.tanggal)} · {k._count.foto} foto
                </p>
                {k.ringkasan && <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{k.ringkasan}</p>}
                <div className="mt-3 flex flex-wrap items-start gap-2">
                  <Link href={`/admin/dokumentasi/${k.id}`} className="btn btn-outline h-8 px-3">Ubah</Link>
                  <TombolAksi aksi={alihkanTerbit} id={k.id} label={k.terbit ? "Sembunyikan" : "Tampilkan"} />
                  <TombolAksi
                    aksi={hapusDokumentasi}
                    id={k.id}
                    label="Hapus"
                    bahaya
                    konfirmasi={`Hapus kegiatan "${k.judul}" beserta semua fotonya?`}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}