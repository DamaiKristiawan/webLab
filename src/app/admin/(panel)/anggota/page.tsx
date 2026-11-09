import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { wajibAdmin } from "@/lib/auth";
import { alihkanAnggota, hapusAnggota } from "@/actions/anggota";
import { FormAnggota } from "@/components/admin/form-anggota";
import { TombolAksi } from "@/components/admin/tombol-aksi";
import { labelJabatan } from "@/lib/konstanta";
import { cn, inisial } from "@/lib/utils";

export const metadata = { title: "Anggota Lab" };

export default async function HalamanAnggota({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  await wajibAdmin();
  const sp = await searchParams;
  const editId = Number(sp.edit) || 0;

  const [anggota, staf] = await Promise.all([
    prisma.anggotaLab.findMany({
      orderBy: [{ jabatan: "asc" }, { urutan: "asc" }, { nama: "asc" }],
      include: { staff: { select: { username: true } } },
    }),
    prisma.staff.findMany({ orderBy: { nama: "asc" }, select: { id: true, nama: true, username: true } }),
  ]);

  const edit = anggota.find((a) => a.id === editId);
  // Akun yang sudah ditautkan ke anggota lain tidak ditawarkan lagi
  const terpakai = new Set(anggota.filter((a) => a.staffId && a.id !== edit?.id).map((a) => a.staffId));
  const pilihanStaf = staf.filter((s) => !terpakai.has(s.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Anggota Lab</h1>
        <p className="text-sm text-muted-foreground">
          Data yang tampil di halaman Struktur: kepala lab, dosen, PLP, dan asisten. Terpisah dari akun
          login, tetapi boleh ditautkan.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div>
          <h2 className="mb-3 font-semibold">Daftar ({anggota.length})</h2>
          {anggota.length === 0 ? (
            <p className="card p-8 text-center text-sm text-muted-foreground">Belum ada anggota.</p>
          ) : (
            <ul className="space-y-3">
              {anggota.map((a) => (
                <li key={a.id} className={cn("card p-4", !a.aktif && "opacity-70")}>
                  <div className="flex flex-wrap items-center gap-3">
                    {a.fotoUrl ? (
                      <Image
                        src={a.fotoUrl}
                        alt=""
                        width={40}
                        height={40}
                        unoptimized
                        className="h-10 w-10 shrink-0 rounded-full border border-border object-cover"
                      />
                    ) : (
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-muted text-sm font-extrabold">
                        {inisial(a.nama)}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{a.nama}</p>
                      <p className="text-sm text-muted-foreground">
                        {a.label || labelJabatan[a.jabatan]}
                        {a.angkatan ? ` · Angkatan ${a.angkatan}` : ""}
                        {a.staff ? ` · @${a.staff.username}` : ""}
                      </p>
                    </div>
                    <span className={cn("pill", a.aktif ? "pill-done" : "pill-no")}>
                      {a.aktif ? "Tampil" : "Disembunyikan"}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-start gap-2">
                    <Link href={`/admin/anggota?edit=${a.id}`} className="btn btn-outline h-8 px-3">Ubah</Link>
                    <TombolAksi aksi={alihkanAnggota} id={a.id} label={a.aktif ? "Sembunyikan" : "Tampilkan"} />
                    <TombolAksi aksi={hapusAnggota} id={a.id} label="Hapus" bahaya konfirmasi={`Hapus ${a.nama}?`} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="self-start">
          <FormAnggota key={edit?.id ?? "baru"} awal={edit} daftarStaf={pilihanStaf} />
        </div>
      </div>
    </div>
  );
}