import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { wajibStaf } from "@/lib/auth";
import { alihkanPraktikum, hapusPraktikum } from "@/actions/praktikum";
import { FormPraktikum } from "@/components/admin/form-praktikum";
import { TombolAksi } from "@/components/admin/tombol-aksi";
import { cn } from "@/lib/utils";

export const metadata = { title: "Praktikum" };

export default async function HalamanPraktikum({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  await wajibStaf();
  const editId = Number((await searchParams).edit) || 0;

  const daftar = await prisma.praktikum.findMany({
    orderBy: { nama: "asc" },
    include: { _count: { select: { daftarJudul: true } } },
  });
  const edit = daftar.find((p) => p.id === editId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Praktikum</h1>
        <p className="text-sm text-muted-foreground">
          Kelola praktikum beserta modul, judul, pretest, dan postest-nya.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <h2 className="mb-3 font-semibold">Daftar ({daftar.length})</h2>
          {daftar.length === 0 ? (
            <p className="card p-8 text-center text-sm text-muted-foreground">Belum ada praktikum.</p>
          ) : (
            <ul className="space-y-3">
              {daftar.map((p) => (
                <li key={p.id} className={cn("card p-4", !p.aktif && "opacity-70")}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{p.nama}</p>
                      <p className="text-sm text-muted-foreground">
                        {p._count.daftarJudul} judul · {p.modulUrl ? "modul tersedia" : "modul belum diisi"}
                      </p>
                      {p.deskripsi && (
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.deskripsi}</p>
                      )}
                    </div>
                    <span className={cn("pill", p.aktif ? "pill-done" : "pill-no")}>
                      {p.aktif ? "Tampil" : "Disembunyikan"}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-start gap-2">
                    <Link href={`/admin/praktikum/${p.id}`} className="btn btn-primary h-8 px-3">
                      Kelola judul dan tes
                    </Link>
                    <Link href={`/admin/praktikum?edit=${p.id}`} className="btn btn-outline h-8 px-3">Ubah</Link>
                    <TombolAksi aksi={alihkanPraktikum} id={p.id} label={p.aktif ? "Sembunyikan" : "Tampilkan"} />
                    <TombolAksi
                      aksi={hapusPraktikum}
                      id={p.id}
                      label="Hapus"
                      bahaya
                      konfirmasi={`Hapus praktikum "${p.nama}" beserta semua judul dan soalnya?`}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="self-start">
          <FormPraktikum key={edit?.id ?? "baru"} awal={edit} />
        </div>
      </div>
    </div>
  );
}
