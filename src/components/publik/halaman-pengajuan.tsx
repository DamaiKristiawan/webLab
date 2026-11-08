import { Suspense } from "react";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { ambilPengaturan, terisi } from "@/lib/pengaturan";
import { labelJenisPengajuan } from "@/lib/konstanta";
import { Skeleton } from "@/components/publik/beranda-data";
import { FormPengajuan } from "./form-pengajuan";

type Jenis = "ALAT" | "RUANGAN" | "PENELITIAN";

const deskripsi: Record<Jenis, string> = {
  ALAT: "Pinjam alat laboratorium untuk praktikum, tugas, atau kegiatan lain.",
  RUANGAN: "Ajukan penggunaan ruangan laboratorium pada waktu tertentu.",
  PENELITIAN: "Ajukan penggunaan laboratorium untuk penelitian atau tugas akhir.",
};

async function Isi({ jenis }: { jenis: Jenis }) {
  await connection();
  const [ruangan, alat, pengaturan] = await Promise.all([
    jenis === "RUANGAN"
      ? prisma.ruangan.findMany({
          where: { aktif: true },
          orderBy: { nama: "asc" },
          select: { id: true, nama: true, kapasitas: true },
        })
      : Promise.resolve([]),
    jenis !== "RUANGAN"
      ? prisma.alat.findMany({
          where: { aktif: true, stokTotal: { gt: 0 } },
          orderBy: { nama: "asc" },
          select: { id: true, nama: true, kategori: true, stokTotal: true },
        })
      : Promise.resolve([]),
    ambilPengaturan(),
  ]);

  return (
    <FormPengajuan
      jenis={jenis}
      ruangan={ruangan}
      alat={alat}
      templateSurat={terisi(pengaturan.template_surat) ? pengaturan.template_surat : undefined}
    />
  );
}

export function HalamanPengajuan({ jenis }: { jenis: Jenis }) {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-12 sm:pt-16">
      <p className="label-mono">Pengajuan</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tighter sm:text-5xl">
        {labelJenisPengajuan[jenis]}
      </h1>
      <p className="mt-3 text-muted-foreground">{deskripsi[jenis]} Tanpa perlu login.</p>
      <div className="mt-8">
        <Suspense fallback={<Skeleton className="h-96" />}>
          <Isi jenis={jenis} />
        </Suspense>
      </div>
    </div>
  );
}