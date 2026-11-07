import Link from "next/link";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { wajibLogin } from "@/lib/auth";
import { alihkanPengumuman, hapusPengumuman } from "@/actions/pengumuman";
import { FormPengumuman } from "@/components/admin/form-pengumuman";
import { TombolHapus } from "@/components/admin/tombol-hapus";
import { keInputWib, formatTanggalPendek } from "@/lib/waktu";
import { cn } from "@/lib/utils";

export const metadata = { title: "Kelola Pengumuman" };

type Params = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminPengumuman({ searchParams }: { searchParams: Params }) {
  await wajibLogin();

  const sp = await searchParams;
  const ubahParam = Array.isArray(sp.ubah) ? sp.ubah[0] : sp.ubah;
  const ubahId = Number(ubahParam) || null;

  const [daftar, sedangUbah] = await Promise.all([
    prisma.pengumuman.findMany({ orderBy: { mulaiTampil: "desc" }, take: 100 }),
    ubahId ? prisma.pengumuman.findUnique({ where: { id: ubahId } }) : Promise.resolve(null),
  ]);

  const sekarang = new Date();

  function status(p: (typeof daftar)[number]) {
    if (!p.aktif) return "Nonaktif";
    if (p.mulaiTampil > sekarang) return "Terjadwal";
    if (p.selesaiTampil && p.selesaiTampil < sekarang) return "Berakhir";
    return "Tayang";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pengumuman</h1>
        <p className="text-sm text-muted-foreground">
          Pengumuman yang sedang tayang muncul di beranda.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        <div>
          <h2 className="mb-3 font-semibold">
            {sedangUbah ? "Ubah pengumuman" : "Pengumuman baru"}
          </h2>
          <FormPengumuman
            key={sedangUbah?.id ?? "baru"}
            awal={
              sedangUbah
                ? {
                    id: sedangUbah.id,
                    judul: sedangUbah.judul,
                    isi: sedangUbah.isi,
                    mulaiTampil: keInputWib(sedangUbah.mulaiTampil),
                    selesaiTampil: sedangUbah.selesaiTampil ? keInputWib(sedangUbah.selesaiTampil) : "",
                    aktif: sedangUbah.aktif ? "1" : "",
                  }
                : undefined
            }
          />
        </div>

        <div>
          <h2 className="mb-3 font-semibold">Daftar pengumuman</h2>
          {daftar.length === 0 ? (
            <div className="card p-8 text-center text-sm text-muted-foreground">
              Belum ada pengumuman.
            </div>
          ) : (
            <ul className="space-y-3">
              {daftar.map((p) => {
                const st = status(p);
                return (
                  <li key={p.id} className="card p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          st === "Tayang"
                            ? "bg-primary text-primary-foreground"
                            : "border border-border text-muted-foreground",
                        )}
                      >
                        {st}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTanggalPendek(p.mulaiTampil)} -{" "}
                        {p.selesaiTampil ? formatTanggalPendek(p.selesaiTampil) : "tanpa batas"}
                      </span>
                    </div>
                    <p className="mt-2 font-medium">{p.judul}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.isi}</p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        href={`/admin/pengumuman?ubah=${p.id}`}
                        className="btn btn-outline h-8 px-3"
                      >
                        <Pencil className="h-4 w-4" />
                        Ubah
                      </Link>
                      <form action={alihkanPengumuman}>
                        <input type="hidden" name="id" value={p.id} />
                        <button type="submit" className="btn btn-outline h-8 px-3">
                          {p.aktif ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                      </form>
                      <TombolHapus
                        aksi={hapusPengumuman}
                        id={p.id}
                        pesan={`Hapus pengumuman "${p.judul}"?`}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}