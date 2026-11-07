import { prisma } from "@/lib/prisma";
import { wajibAdmin } from "@/lib/auth";
import { alihkanAlat, alihkanRuangan, hapusAlat, hapusRuangan } from "@/actions/inventaris";
import { FormAlat, FormRuangan } from "@/components/admin/form-inventaris";
import { TombolAksi } from "@/components/admin/tombol-aksi";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const metadata = { title: "Inventaris" };

export default async function HalamanInventaris({
  searchParams,
}: {
  searchParams: Promise<{ r?: string; a?: string }>;
}) {
  await wajibAdmin();
  const sp = await searchParams;
  const rid = Number(sp.r) || 0;
  const aid = Number(sp.a) || 0;

  const [ruangan, alat] = await Promise.all([
    prisma.ruangan.findMany({ orderBy: { nama: "asc" } }),
    prisma.alat.findMany({ orderBy: { nama: "asc" } }),
  ]);
  const rEdit = ruangan.find((x) => x.id === rid);
  const aEdit = alat.find((x) => x.id === aid);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Inventaris</h1>
        <p className="text-sm text-muted-foreground">
          Ruangan dan alat yang bisa dipinjam. Yang nonaktif tidak muncul di formulir pengajuan.
        </p>
      </div>

      {/* RUANGAN */}
      <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div>
          <h2 className="mb-3 font-semibold">Ruangan ({ruangan.length})</h2>
          {ruangan.length === 0 ? (
            <p className="card p-8 text-center text-sm text-muted-foreground">Belum ada ruangan.</p>
          ) : (
            <ul className="space-y-3">
              {ruangan.map((r) => (
                <li key={r.id} className={cn("card p-4", !r.aktif && "opacity-70")}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{r.nama}</p>
                      <p className="text-sm text-muted-foreground">
                        {r.kapasitas ? `Kapasitas ${r.kapasitas} orang` : "Kapasitas belum diisi"}
                      </p>
                      {r.deskripsi && <p className="mt-1 text-sm text-muted-foreground">{r.deskripsi}</p>}
                    </div>
                    <span className={cn("pill", r.aktif ? "pill-done" : "pill-no")}>
                      {r.aktif ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-start gap-2">
                    <Link href={`/admin/inventaris?r=${r.id}`} className="btn btn-outline h-8 px-3">Ubah</Link>
                    <TombolAksi aksi={alihkanRuangan} id={r.id} label={r.aktif ? "Nonaktifkan" : "Aktifkan"} />
                    <TombolAksi aksi={hapusRuangan} id={r.id} label="Hapus" bahaya konfirmasi={`Hapus ruangan "${r.nama}"?`} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="self-start">
          <FormRuangan key={rEdit?.id ?? "baru"} awal={rEdit} />
        </div>
      </section>

      {/* ALAT */}
      <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div>
          <h2 className="mb-3 font-semibold">Alat ({alat.length})</h2>
          {alat.length === 0 ? (
            <p className="card p-8 text-center text-sm text-muted-foreground">Belum ada alat.</p>
          ) : (
            <ul className="space-y-3">
              {alat.map((a) => (
                <li key={a.id} className={cn("card p-4", !a.aktif && "opacity-70")}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{a.nama}</p>
                      <p className="text-sm text-muted-foreground">
                        {[a.kategori, `Stok ${a.stokTotal}`, a.kondisi].filter(Boolean).join(" · ")}
                      </p>
                      {a.deskripsi && <p className="mt-1 text-sm text-muted-foreground">{a.deskripsi}</p>}
                    </div>
                    <span className={cn("pill", a.aktif ? "pill-done" : "pill-no")}>
                      {a.aktif ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-start gap-2">
                    <Link href={`/admin/inventaris?a=${a.id}`} className="btn btn-outline h-8 px-3">Ubah</Link>
                    <TombolAksi aksi={alihkanAlat} id={a.id} label={a.aktif ? "Nonaktifkan" : "Aktifkan"} />
                    <TombolAksi aksi={hapusAlat} id={a.id} label="Hapus" bahaya konfirmasi={`Hapus alat "${a.nama}"?`} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="self-start">
          <FormAlat key={aEdit?.id ?? "baru"} awal={aEdit} />
        </div>
      </section>
    </div>
  );
}