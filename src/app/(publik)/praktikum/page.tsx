import { Suspense } from "react";
import { connection } from "next/server";
import { ArrowRight, BookOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { KartuSorot } from "@/components/publik/kartu-sorot";
import { Skeleton } from "@/components/publik/beranda-data";

export const metadata = { title: "Praktikum" };

async function Daftar() {
  await connection();
  const daftar = await prisma.praktikum.findMany({
    where: { aktif: true },
    orderBy: { nama: "asc" },
    include: { _count: { select: { daftarJudul: true } } },
  });

  if (daftar.length === 0) {
    return (
      <p className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        Belum ada praktikum yang ditampilkan.
      </p>
    );
  }

  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {daftar.map((p) => (
        <KartuSorot key={p.id} href={`/praktikum/${p.slug}`} className="h-full">
          <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-muted">
            <BookOpen className="h-5 w-5" />
          </div>
          <p className="flex items-center justify-between font-semibold">
            {p.nama}
            <ArrowRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
          </p>
          <p className="mt-1.5 line-clamp-3 text-sm text-muted-foreground">
            {p.deskripsi || "Modul dan tes praktikum."}
          </p>
          <p className="label-mono mt-4">{p._count.daftarJudul} judul</p>
        </KartuSorot>
      ))}
    </div>
  );
}

export default function HalamanPraktikum() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-12 sm:pt-16">
      <p className="label-mono">Akademik</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tighter sm:text-5xl">Praktikum</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Modul praktikum serta pretest dan postest. Tidak perlu login.
      </p>
      <Suspense fallback={<Skeleton className="mt-10 h-48" />}>
        <Daftar />
      </Suspense>
    </div>
  );
}
