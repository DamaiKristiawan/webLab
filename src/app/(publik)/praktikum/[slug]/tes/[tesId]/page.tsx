import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { FormTesPublik } from "@/components/publik/form-tes-publik";
import { Skeleton } from "@/components/publik/beranda-data";

export const metadata = { title: "Mengerjakan Tes" };

async function Isi({ params }: { params: Promise<{ slug: string; tesId: string }> }) {
  await connection();
  const { slug, tesId } = await params;

  const tes = await prisma.tes.findFirst({
    where: { id: Number(tesId) || 0, aktif: true, judulPraktikum: { praktikum: { slug, aktif: true } } },
    select: {
      id: true,
      jenis: true,
      durasiMenit: true,
      judulPraktikum: {
        select: { urutan: true, judul: true, praktikum: { select: { nama: true, slug: true } } },
      },
      _count: { select: { soal: true } },
    },
  });
  if (!tes || tes._count.soal === 0) notFound();

  const jenis = tes.jenis === "PRETEST" ? "Pretest" : "Postest";
  const { judulPraktikum: j } = tes;

  return (
    <>
      <Link
        href={`/praktikum/${j.praktikum.slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {j.praktikum.nama}
      </Link>
      <p className="label-mono mt-6">
        {jenis} · Judul {j.urutan}
      </p>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tighter sm:text-4xl">{j.judul}</h1>
      <div className="mt-8">
        <FormTesPublik
          tesId={tes.id}
          slug={j.praktikum.slug}
          jenis={tes.jenis}
          durasiMenit={tes.durasiMenit}
          jumlahSoal={tes._count.soal}
        />
      </div>
    </>
  );
}

export default function HalamanTes({ params }: { params: Promise<{ slug: string; tesId: string }> }) {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-12 sm:pt-16">
      <Suspense fallback={<Skeleton className="h-96" />}>
        <Isi params={params} />
      </Suspense>
    </div>
  );
}
