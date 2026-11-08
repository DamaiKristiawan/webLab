import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronDown, ClipboardCheck, ClipboardList, ExternalLink, FileText } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Skeleton } from "@/components/publik/beranda-data";

export const metadata = { title: "Praktikum" };

function Baris({
  ikon: Ikon,
  judul,
  keterangan,
  aksi,
}: {
  ikon: LucideIcon;
  judul: string;
  keterangan?: string | null;
  aksi: React.ReactNode | null;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-muted">
          <Ikon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{judul}</p>
          {keterangan && (
            <p className="mt-0.5 whitespace-pre-line text-sm text-muted-foreground">{keterangan}</p>
          )}
        </div>
      </div>
      <div className="shrink-0">{aksi ?? <span className="pill pill-wait">Segera hadir</span>}</div>
    </div>
  );
}

async function Isi({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;

  const p = await prisma.praktikum.findFirst({
    where: { slug, aktif: true },
    include: {
      daftarJudul: {
        orderBy: { urutan: "asc" },
        include: {
          tes: {
            where: { aktif: true },
            select: { id: true, jenis: true, durasiMenit: true, _count: { select: { soal: true } } },
          },
        },
      },
    },
  });
  if (!p) notFound();

  return (
    <>
      <Link
        href="/praktikum"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Semua praktikum
      </Link>
      <p className="label-mono mt-6">Praktikum</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tighter sm:text-5xl">{p.nama}</h1>
      {p.deskripsi && <p className="mt-3 max-w-2xl whitespace-pre-line text-muted-foreground">{p.deskripsi}</p>}

      <div className="mt-8">
        <Baris
          ikon={FileText}
          judul="Modul praktikum"
          keterangan="Satu modul untuk seluruh judul praktikum."
          aksi={
            p.modulUrl ? (
              <a
                href={p.modulUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary w-full sm:w-auto"
              >
                <ExternalLink className="h-4 w-4" />
                Buka modul
              </a>
            ) : null
          }
        />
      </div>

      <h2 className="mt-12 text-xl font-extrabold tracking-tight">Judul praktikum ({p.daftarJudul.length})</h2>

      <div className="mt-4 space-y-3">
        {p.daftarJudul.map((j, i) => {
          const tersedia = j.tes.filter((t) => t._count.soal > 0);
          const pre = tersedia.find((t) => t.jenis === "PRETEST");
          const post = tersedia.find((t) => t.jenis === "POSTEST");
          const jumlah = (pre ? 1 : 0) + (post ? 1 : 0);

          return (
            <details key={j.id} open={i === 0} className="card group overflow-hidden">
              <summary className="flex cursor-pointer list-none items-center gap-4 p-4 transition-colors hover:bg-muted sm:p-5 [&::-webkit-details-marker]:hidden">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-foreground text-sm font-bold">
                  {j.urutan}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold leading-snug">{j.judul}</p>
                  <p className="label-mono mt-1">{jumlah} dari 2 tes tersedia</p>
                </div>
                <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-300 group-open:rotate-180" />
              </summary>

              <div className="space-y-3 border-t border-border p-4 sm:p-5">
                <Baris
                  ikon={ClipboardList}
                  judul="Pretest"
                  keterangan={pre ? `${pre._count.soal} soal · ${pre.durasiMenit} menit · hanya sekali` : undefined}
                  aksi={
                    pre ? (
                      <Link href={`/praktikum/${p.slug}/tes/${pre.id}`} className="btn btn-outline w-full sm:w-auto">
                        Kerjakan
                      </Link>
                    ) : null
                  }
                />
                <Baris
                  ikon={ClipboardCheck}
                  judul="Postest"
                  keterangan={post ? `${post._count.soal} soal · ${post.durasiMenit} menit · hanya sekali` : undefined}
                  aksi={
                    post ? (
                      <Link href={`/praktikum/${p.slug}/tes/${post.id}`} className="btn btn-primary w-full sm:w-auto">
                        Kerjakan
                      </Link>
                    ) : null
                  }
                />
              </div>
            </details>
          );
        })}
      </div>
    </>
  );
}

export default function DetailPraktikum({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-12 sm:pt-16">
      <Suspense fallback={<Skeleton className="h-64" />}>
        <Isi params={params} />
      </Suspense>
    </div>
  );
}
