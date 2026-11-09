import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { FormSurveiPublik } from "@/components/publik/form-survei-publik";
import { Skeleton } from "@/components/publik/beranda-data";

export const metadata = { title: "Kuesioner Kepuasan" };

async function Isi({ params }: { params: Promise<{ kode: string }> }) {
  const { kode } = await params;
  await connection();

  const survei = await prisma.survei.findFirst({
    where: { kode, aktif: true },
    orderBy: [{ tahun: "desc" }, { id: "desc" }],
    include: { pertanyaan: { orderBy: [{ urutan: "asc" }, { id: "asc" }] } },
  });

  if (!survei || survei.pertanyaan.length === 0) {
    return (
      <div className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        <p>Kuesioner ini belum dibuka atau sudah ditutup.</p>
        <Link href="/survei" className="btn btn-outline mt-4">Lihat kuesioner lain</Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tighter sm:text-5xl">{survei.judul}</h1>
      {survei.deskripsi && <p className="mt-3 text-muted-foreground">{survei.deskripsi}</p>}

      <p className="mt-5 flex items-start gap-2 text-sm text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
        Nama dan NPM Anda dicatat dan hanya dapat dilihat admin laboratorium. Setiap NPM hanya dapat mengisi satu kali
        pada periode {survei.tahun}.
      </p>

      <div className="mt-8">
        <FormSurveiPublik
          surveiId={survei.id}
          pertanyaan={survei.pertanyaan.map((p) => ({ id: p.id, teks: p.teks, tipe: p.tipe, kelompok: p.kelompok }))}
        />
      </div>
    </>
  );
}

export default function HalamanKuesioner({ params }: { params: Promise<{ kode: string }> }) {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-8 pt-12 sm:pt-16">
      <p className="label-mono">Masukan</p>
      <Suspense fallback={<Skeleton className="mt-6 h-96" />}>
        <Isi params={params} />
      </Suspense>
    </div>
  );
}