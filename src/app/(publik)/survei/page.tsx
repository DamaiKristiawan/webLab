import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { ArrowRight, ClipboardList } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DAFTAR_KUESIONER } from "@/lib/kuesioner";
import { Skeleton } from "@/components/publik/beranda-data";

export const metadata = { title: "Kuesioner Kepuasan" };

async function Isi() {
  await connection();
  const aktif = await prisma.survei.findMany({
    where: { aktif: true },
    orderBy: [{ tahun: "desc" }, { id: "desc" }],
    select: { id: true, kode: true, tahun: true, judul: true, deskripsi: true },
  });

  // Satu kartu per jenis kuesioner: periode terbaru yang dibuka
  const terbaru = new Map<string, (typeof aktif)[number]>();
  for (const s of aktif) if (!terbaru.has(s.kode)) terbaru.set(s.kode, s);
  const urut = [...DAFTAR_KUESIONER.map((d) => d.kode as string), ...[...terbaru.keys()].filter((k) => !DAFTAR_KUESIONER.some((d) => d.kode === k))];
  const daftar = urut.map((k) => terbaru.get(k)).filter((s): s is NonNullable<typeof s> => !!s);

  if (daftar.length === 0) {
    return (
      <p className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        Belum ada kuesioner yang dibuka saat ini.
      </p>
    );
  }

  return (
    <ul className="mt-8 grid gap-4 sm:grid-cols-2">
      {daftar.map((s) => (
        <li key={s.id}>
          <Link href={`/survei/${s.kode}`} className="card group flex h-full flex-col gap-3 p-6 transition-colors hover:border-primary">
            <ClipboardList className="h-6 w-6 text-primary" />
            <div className="flex-1">
              <p className="text-lg font-bold tracking-tight">{s.judul}</p>
              <p className="label-mono mt-1">Periode {s.tahun}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
              Isi kuesioner <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function HalamanKuesionerPublik() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-12 sm:pt-16">
      <p className="label-mono">Masukan</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tighter sm:text-5xl">Kuesioner Kepuasan</h1>
      <p className="mt-3 text-muted-foreground">
        Pilih kuesioner sesuai keperluan Anda. Pendapat Anda membantu kami meningkatkan layanan laboratorium.
      </p>
      <Suspense fallback={<Skeleton className="mt-8 h-48" />}>
        <Isi />
      </Suspense>
    </div>
  );
}