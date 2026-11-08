import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { wajibStaf } from "@/lib/auth";
import { buatPostest, buatPretest } from "@/actions/praktikum";
import { alihkanTes } from "@/actions/tes";
import { FormJudul, FormPraktikum } from "@/components/admin/form-praktikum";
import { TombolAksi } from "@/components/admin/tombol-aksi";

export const metadata = { title: "Judul Praktikum" };

type Tes = { id: number; aktif: boolean; durasiMenit: number; kodeAkses: string | null; _count: { soal: number } };

function BarisTes({
  nama,
  judulId,
  tes,
  buat,
}: {
  nama: string;
  judulId: number;
  tes?: Tes;
  buat: typeof buatPretest;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2.5">
      <div className="text-sm">
        <span className="font-semibold">{nama}</span>
        <span className="ml-2 text-muted-foreground">
          {tes
            ? `${tes._count.soal} soal · ${tes.durasiMenit} menit · ${tes.aktif ? "aktif" : "nonaktif"} · kode ${tes.kodeAkses ?? "belum ada"}`
            : "belum dibuat"}
        </span>
      </div>
      <div className="flex flex-wrap items-start gap-2">
        {tes ? (
          <>
            <Link href={`/admin/praktikum/tes/${tes.id}`} className="btn btn-outline h-8 px-3">Kelola soal</Link>
            <TombolAksi aksi={alihkanTes} id={tes.id} label={tes.aktif ? "Nonaktifkan" : "Aktifkan"} />
          </>
        ) : (
          <TombolAksi aksi={buat} id={judulId} label={`Buat ${nama}`} />
        )}
      </div>
    </div>
  );
}

export default async function DetailPraktikum({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ judul?: string }>;
}) {
  await wajibStaf();
  const id = Number((await params).id) || 0;
  const judulEditId = Number((await searchParams).judul) || 0;

  const praktikum = await prisma.praktikum.findUnique({
    where: { id },
    include: {
      daftarJudul: {
        orderBy: { urutan: "asc" },
        include: {
          tes: {
            select: { id: true, jenis: true, aktif: true, durasiMenit: true, kodeAkses: true, _count: { select: { soal: true } } },
          },
        },
      },
    },
  });
  if (!praktikum) notFound();

  const judulEdit = praktikum.daftarJudul.find((j) => j.id === judulEditId);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/praktikum"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Semua praktikum
      </Link>

      <div>
        <p className="label-mono">Praktikum</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight">{praktikum.nama}</h1>
        {praktikum.deskripsi && <p className="mt-1 text-sm text-muted-foreground">{praktikum.deskripsi}</p>}
        <p className="mt-2 text-sm">
          {praktikum.modulUrl ? (
            <a
              href={praktikum.modulUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Buka modul
            </a>
          ) : (
            <span className="text-muted-foreground">Tautan modul belum diisi.</span>
          )}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <h2 className="mb-3 font-semibold">Judul ({praktikum.daftarJudul.length})</h2>
          <ul className="space-y-3">
            {praktikum.daftarJudul.map((j) => (
              <li key={j.id} className="card space-y-3 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-foreground text-xs font-bold">
                      {j.urutan}
                    </span>
                    <p className="font-semibold">{j.judul}</p>
                  </div>
                  <Link href={`/admin/praktikum/${praktikum.id}?judul=${j.id}`} className="btn btn-outline h-8 px-3">
                    Ubah judul
                  </Link>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <BarisTes
                    nama="Pretest"
                    judulId={j.id}
                    tes={j.tes.find((t) => t.jenis === "PRETEST")}
                    buat={buatPretest}
                  />
                  <BarisTes
                    nama="Postest"
                    judulId={j.id}
                    tes={j.tes.find((t) => t.jenis === "POSTEST")}
                    buat={buatPostest}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6 self-start">
          {judulEdit && (
            <FormJudul
              key={`judul-${judulEdit.id}`}
              praktikumId={praktikum.id}
              awal={{ id: judulEdit.id, urutan: judulEdit.urutan, judul: judulEdit.judul }}
            />
          )}
          <FormPraktikum
            key={`praktikum-${praktikum.id}`}
            awal={{
              id: praktikum.id,
              nama: praktikum.nama,
              deskripsi: praktikum.deskripsi,
              modulUrl: praktikum.modulUrl,
              aktif: praktikum.aktif,
            }}
          />
        </div>
      </div>
    </div>
  );
}
