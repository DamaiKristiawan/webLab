import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { wajibStaf } from "@/lib/auth";
import { buatKodeTes, hapusSoal, hapusTes, tutupKodeTes } from "@/actions/tes";
import { FormSoal, FormTes } from "@/components/admin/form-praktikum";
import { TombolAksi } from "@/components/admin/tombol-aksi";
import { cn } from "@/lib/utils";

export const metadata = { title: "Kelola Soal" };

const HURUF = ["A", "B", "C", "D", "E"];

export default async function HalamanTes({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ soal?: string }>;
}) {
  await wajibStaf();
  const id = Number((await params).id) || 0;
  const soalEditId = Number((await searchParams).soal) || 0;

  const tes = await prisma.tes.findUnique({
    where: { id },
    include: {
      judulPraktikum: { select: { urutan: true, judul: true, praktikum: { select: { id: true, nama: true } } } },
      soal: { orderBy: [{ urutan: "asc" }, { id: "asc" }] },
    },
  });
  if (!tes) notFound();

  const soalEdit = tes.soal.find((s) => s.id === soalEditId);
  const nama = tes.jenis === "PRETEST" ? "Pretest" : "Postest";
  const { judulPraktikum: j } = tes;

  return (
    <div className="space-y-6">
      <Link
        href={`/admin/praktikum/${j.praktikum.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {j.praktikum.nama}
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="label-mono">
            {nama} · Judul {j.urutan}
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight">{j.judul}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {tes.soal.length} soal · {tes.durasiMenit} menit sejak peserta mulai · {tes.aktif ? "aktif" : "nonaktif"}
          </p>
        </div>
        <TombolAksi
          aksi={hapusTes}
          id={tes.id}
          label="Hapus tes"
          bahaya
          konfirmasi="Hapus tes ini beserta semua soalnya?"
        />
      </div>

      <div className="card flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="label-mono">Kode akses</p>
          {tes.kodeAkses ? (
            <p className="mt-1 font-mono text-4xl font-extrabold tracking-widest">{tes.kodeAkses}</p>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">Belum ada kode, jadi peserta belum bisa memulai tes ini.</p>
          )}
          <p className="mt-2 max-w-md text-xs text-muted-foreground">
            Berikan kode kepada praktikan saat sesi dimulai. Peserta yang sudah memulai tetap bisa melanjutkan walau
            kode diganti atau ditutup.
          </p>
        </div>
        <div className="flex flex-wrap items-start gap-2">
          <TombolAksi aksi={buatKodeTes} id={tes.id} label={tes.kodeAkses ? "Buat kode baru" : "Buat kode"} />
          {tes.kodeAkses && <TombolAksi aksi={tutupKodeTes} id={tes.id} label="Tutup akses" bahaya />}
        </div>
      </div>

      {tes.soal.length === 0 && (
        <p className="rounded-xl border border-dashed border-foreground p-4 text-sm font-medium">
          Tes ini belum punya soal, jadi belum bisa dikerjakan peserta. Tambahkan soal lewat formulir di samping.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div>
          <h2 className="mb-3 font-semibold">Soal ({tes.soal.length})</h2>
          <ol className="space-y-3">
            {tes.soal.map((s, i) => {
              const opsi = (Array.isArray(s.opsi) ? s.opsi : []) as string[];
              return (
                <li key={s.id} className="card p-4">
                  <div className="flex gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-foreground text-xs font-bold">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="whitespace-pre-line text-sm font-medium">{s.pertanyaan}</p>
                      <ul className="mt-2 space-y-1">
                        {opsi.map((o, k) => (
                          <li
                            key={k}
                            className={cn(
                              "flex gap-2 text-sm",
                              k === s.jawabanBenar ? "font-semibold" : "text-muted-foreground",
                            )}
                          >
                            <span className="w-4 shrink-0">{HURUF[k]}.</span>
                            <span className="min-w-0 break-words">{o}</span>
                            {k === s.jawabanBenar && (
                              <span className="pill pill-ok ml-auto h-5 shrink-0 px-2 py-0 text-[11px]">Benar</span>
                            )}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 flex flex-wrap items-start gap-2">
                        <Link
                          href={`/admin/praktikum/tes/${tes.id}?soal=${s.id}`}
                          className="btn btn-outline h-8 px-3"
                        >
                          Ubah
                        </Link>
                        <TombolAksi aksi={hapusSoal} id={s.id} label="Hapus" bahaya konfirmasi="Hapus soal ini?" />
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="space-y-6 self-start">
          <FormSoal
            key={soalEdit?.id ?? "baru"}
            tesId={tes.id}
            awal={
              soalEdit
                ? {
                    id: soalEdit.id,
                    pertanyaan: soalEdit.pertanyaan,
                    opsi: (Array.isArray(soalEdit.opsi) ? soalEdit.opsi : []) as string[],
                    jawabanBenar: soalEdit.jawabanBenar,
                  }
                : undefined
            }
          />
          <FormTes key={`tes-${tes.id}`} awal={{ id: tes.id, durasiMenit: tes.durasiMenit, aktif: tes.aktif }} />
        </div>
      </div>
    </div>
  );
}
