import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { Images } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatTanggalPendek } from "@/lib/waktu";
import { Skeleton } from "@/components/publik/beranda-data";

export const metadata = { title: "Dokumentasi" };

async function Daftar() {
  await connection();
  const daftar = await prisma.dokumentasi.findMany({
    where: { terbit: true },
    orderBy: { tanggal: "desc" },
    take: 30,
    include: { _count: { select: { foto: true } } },
  });

  if (daftar.length === 0) {
    return (
      <p className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        Belum ada dokumentasi kegiatan.
      </p>
    );
  }

  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {daftar.map((d) => (
        <Link
          key={d.id}
          href={`/dokumentasi/${d.slug}`}
          className="card group overflow-hidden transition-transform duration-300 hover:-translate-y-1"
        >
          <div className="relative aspect-[16/10] overflow-hidden bg-muted">
            {d.coverUrl ? (
              <Image
                src={d.coverUrl}
                alt=""
                fill
                unoptimized
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <Images className="h-8 w-8" />
              </div>
            )}
          </div>
          <div className="p-5">
            <p className="label-mono">
              {formatTanggalPendek(d.tanggal)} · {d._count.foto} foto
            </p>
            <p className="mt-1.5 font-semibold leading-snug">{d.judul}</p>
            {d.ringkasan && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{d.ringkasan}</p>}
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function HalamanDokumentasi() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-12 sm:pt-16">
      <p className="label-mono">Kegiatan</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tighter sm:text-5xl">Dokumentasi</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">Foto dan catatan kegiatan Laboratorium Teknik Digital.</p>
      <Suspense fallback={<Skeleton className="mt-10 h-72" />}>
        <Daftar />
      </Suspense>
    </div>
  );
}