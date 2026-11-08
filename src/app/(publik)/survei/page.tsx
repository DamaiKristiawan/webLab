import { Suspense } from "react";
import { connection } from "next/server";
import { ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { FormSurveiPublik } from "@/components/publik/form-survei-publik";
import { Skeleton } from "@/components/publik/beranda-data";

export const metadata = { title: "Survei Kepuasan" };

async function Isi() {
  await connection();
  const survei = await prisma.survei.findFirst({
    where: { aktif: true },
    orderBy: { id: "desc" },
    include: { pertanyaan: { orderBy: [{ urutan: "asc" }, { id: "asc" }] } },
  });

  if (!survei || survei.pertanyaan.length === 0) {
    return (
      <p className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        Survei belum dibuka saat ini.
      </p>
    );
  }

  return (
    <>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tighter sm:text-5xl">{survei.judul}</h1>
      {survei.deskripsi && <p className="mt-3 text-muted-foreground">{survei.deskripsi}</p>}

      <p className="mt-5 flex items-start gap-2 text-sm text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
        Survei ini anonim. Kami tidak meminta nama dan tidak menyimpan identitas Anda.
      </p>

      <div className="mt-8">
        <FormSurveiPublik
          surveiId={survei.id}
          pertanyaan={survei.pertanyaan.map((p) => ({ id: p.id, teks: p.teks, tipe: p.tipe }))}
        />
      </div>
    </>
  );
}

export default function HalamanSurvei() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-12 sm:pt-16">
      <p className="label-mono">Masukan</p>
      <Suspense fallback={<Skeleton className="mt-6 h-96" />}>
        <Isi />
      </Suspense>
    </div>
  );
}