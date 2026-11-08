import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { wajibAdmin } from "@/lib/auth";
import { hapusFoto, jadikanSampul } from "@/actions/dokumentasi";
import { FormDokumentasi } from "@/components/admin/form-dokumentasi";
import { TombolAksi } from "@/components/admin/tombol-aksi";

export const metadata = { title: "Ubah Kegiatan" };

export default async function UbahKegiatan({ params }: { params: Promise<{ id: string }> }) {
  await wajibAdmin();
  const id = Number((await params).id) || 0;

  const k = await prisma.dokumentasi.findUnique({
    where: { id },
    include: { foto: { orderBy: [{ urutan: "asc" }, { id: "asc" }] } },
  });
  if (!k) notFound();

  const tanggal = new Date(k.tanggal.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);

  return (
    <div className="max-w-4xl space-y-6">
      <Link
        href="/admin/dokumentasi"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Semua kegiatan
      </Link>
      <h1 className="text-2xl font-extrabold tracking-tight">{k.judul}</h1>

      <FormDokumentasi
        key={k.id}
        awal={{ id: k.id, judul: k.judul, ringkasan: k.ringkasan, isi: k.isi, terbit: k.terbit }}
        tanggalAwal={tanggal}
      />

      <section>
        <h2 className="mb-3 font-semibold">Foto ({k.foto.length})</h2>
        {k.foto.length === 0 ? (
          <p className="card p-8 text-center text-sm text-muted-foreground">
            Belum ada foto. Tambahkan lewat kolom unggah di atas.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {k.foto.map((f) => {
              const sampul = k.coverUrl === f.url;
              return (
                <li key={f.id} className="card overflow-hidden">
                  <div className="relative aspect-[4/3] bg-muted">
                    <Image src={f.url} alt="" fill unoptimized sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
                    {sampul && (
                      <span className="pill pill-ok absolute left-2 top-2 bg-foreground">Sampul</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-start gap-2 p-3">
                    {!sampul && <TombolAksi aksi={jadikanSampul} id={f.id} label="Jadikan sampul" />}
                    <TombolAksi aksi={hapusFoto} id={f.id} label="Hapus" bahaya konfirmasi="Hapus foto ini?" />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}