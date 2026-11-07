import Image from "next/image";
import { Suspense } from "react";
import { connection } from "next/server";
import { Mail, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { labelJabatan } from "@/lib/konstanta";
import { inisial } from "@/lib/utils";
import { Skeleton } from "@/components/publik/beranda-data";

export const metadata = { title: "Struktur Organisasi" };

type Anggota = Awaited<ReturnType<typeof ambil>>[number];

function ambil() {
  return prisma.anggotaLab.findMany({
    where: { aktif: true },
    orderBy: [{ urutan: "asc" }, { nama: "asc" }],
  });
}

function Kartu({ a }: { a: Anggota }) {
  return (
    <div className="card flex flex-col items-center p-6 text-center transition-transform duration-300 hover:-translate-y-1">
      {a.fotoUrl ? (
        <Image
          src={a.fotoUrl}
          alt={a.nama}
          width={88}
          height={88}
          unoptimized
          className="h-[88px] w-[88px] rounded-full border border-border object-cover"
        />
      ) : (
        <span className="surface-ink grid h-[88px] w-[88px] place-items-center rounded-full text-2xl font-extrabold tracking-tight">
          {inisial(a.nama)}
        </span>
      )}
      <p className="mt-4 font-semibold leading-snug">{a.nama}</p>
      <p className="mt-1 text-sm text-muted-foreground">{a.label || labelJabatan[a.jabatan]}</p>
      {a.nipNpm && <p className="mt-1 font-mono text-xs text-muted-foreground">{a.nipNpm}</p>}
      {a.bidang && <p className="mt-2 text-sm">{a.bidang}</p>}
      {(a.email || a.kontak) && (
        <div className="mt-3 flex flex-col gap-1 text-xs text-muted-foreground">
          {a.email && (
            <span className="flex items-center justify-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              {a.email}
            </span>
          )}
          {a.kontak && (
            <span className="flex items-center justify-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              {a.kontak}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function Kelompok({ judul, daftar, nomor }: { judul: string; daftar: Anggota[]; nomor: string }) {
  if (daftar.length === 0) return null;
  return (
    <section className="mt-14">
      <p className="label-mono">{nomor}</p>
      <h2 className="mt-2 text-2xl font-extrabold tracking-tight">{judul}</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {daftar.map((a) => (
          <Kartu key={a.id} a={a} />
        ))}
      </div>
    </section>
  );
}

async function Isi() {
  await connection();
  const semua = await ambil();

  if (semua.length === 0) {
    return (
      <p className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        Data struktur belum diisi.
      </p>
    );
  }

  const per = (j: Anggota["jabatan"]) => semua.filter((a) => a.jabatan === j);
  const asisten = per("ASISTEN");

  // Asisten dikelompokkan per angkatan (terbaru dulu); tanpa angkatan di akhir
  const angkatan = [...new Set(asisten.map((a) => a.angkatan))].sort((x, y) => (y ?? 0) - (x ?? 0));
  const adaAngkatan = angkatan.some((x) => x !== null);

  return (
    <>
      <Kelompok nomor="01" judul="Kepala Laboratorium" daftar={per("KEPALA_LAB")} />
      <Kelompok nomor="02" judul="Dosen Laboratorium" daftar={per("DOSEN")} />
      <Kelompok nomor="03" judul="PLP" daftar={per("PLP")} />
      {adaAngkatan ? (
        angkatan.map((ang, i) => (
          <Kelompok
            key={ang ?? "x"}
            nomor={`04.${i + 1}`}
            judul={ang ? `Asisten Praktikum Angkatan ${ang}` : "Asisten Praktikum"}
            daftar={asisten.filter((a) => a.angkatan === ang)}
          />
        ))
      ) : (
        <Kelompok nomor="04" judul="Asisten Praktikum" daftar={asisten} />
      )}
    </>
  );
}

export default function Struktur() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-12 sm:pt-16">
      <p className="label-mono">Informasi</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tighter sm:text-5xl">Struktur Organisasi</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Kepala laboratorium, dosen, PLP, dan asisten Laboratorium Teknik Digital.
      </p>
      <Suspense fallback={<Skeleton className="mt-14 h-64" />}>
        <Isi />
      </Suspense>
    </div>
  );
}