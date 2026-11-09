import Image from "next/image";
import { Suspense } from "react";
import { connection } from "next/server";
import { Mail, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { labelJabatan } from "@/lib/konstanta";
import { cn, inisial } from "@/lib/utils";
import { Skeleton } from "@/components/publik/beranda-data";

export const metadata = { title: "Struktur Organisasi" };

type Anggota = Awaited<ReturnType<typeof ambil>>[number];

function ambil() {
  return prisma.anggotaLab.findMany({
    where: { aktif: true },
    orderBy: [{ urutan: "asc" }, { nama: "asc" }],
  });
}

function potong<T>(arr: T[], n: number) {
  const hasil: T[][] = [];
  for (let i = 0; i < arr.length; i += n) hasil.push(arr.slice(i, i + n));
  return hasil;
}

function Kartu({ a, besar }: { a: Anggota; besar?: boolean }) {
  const ukuran = besar ? 104 : 88;
  return (
    <div
      className={cn(
        "card relative z-10 flex flex-1 flex-col items-center p-6 text-center transition-transform duration-300 hover:-translate-y-1",
        besar && "border-primary/40 shadow-lg",
      )}
    >
      {a.fotoUrl ? (
        <Image
          src={a.fotoUrl}
          alt={a.nama}
          width={ukuran}
          height={ukuran}
          unoptimized
          style={{ width: ukuran, height: ukuran }}
          className="rounded-full border border-border object-cover"
        />
      ) : (
        <span
          style={{ width: ukuran, height: ukuran }}
          className="surface-ink grid place-items-center rounded-full text-2xl font-extrabold tracking-tight"
        >
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
            <span className="flex items-center justify-center gap-1.5 break-all">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              {a.email}
            </span>
          )}
          {a.kontak && (
            <span className="flex items-center justify-center gap-1.5">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              {a.kontak}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Satu baris kartu yang bersambung ke garis utama lewat garis siku (bracket) di atasnya.
function Baris({ daftar, besar }: { daftar: Anggota[]; besar?: boolean }) {
  const n = daftar.length;
  return (
    <div className="mt-4 flex flex-col items-center md:flex-row md:items-stretch md:justify-center">
      {daftar.map((a, i) => (
        <div
          key={a.id}
          className={cn(
            "relative flex w-full max-w-[300px] flex-col pt-6 md:px-2 lg:px-2.5",
            besar ? "md:w-[310px] lg:w-[330px] md:max-w-none" : "md:w-[250px] lg:w-[290px] md:max-w-none",
            // garis tegak dari bracket ke kartu
            "before:absolute before:left-1/2 before:top-0 before:h-6 before:w-px before:-translate-x-1/2 before:bg-primary/35",
            // garis mendatar (bracket), hanya di layar lebar dan bila baris berisi lebih dari satu kartu
            "md:after:absolute md:after:top-0 md:after:h-px md:after:bg-primary/35",
            n === 1 && "md:after:hidden",
            n > 1 && i === 0 && "md:after:left-1/2 md:after:right-0",
            n > 1 && i === n - 1 && "md:after:left-0 md:after:right-1/2",
            n > 1 && i > 0 && i < n - 1 && "md:after:inset-x-0",
          )}
        >
          <Kartu a={a} besar={besar} />
        </div>
      ))}
    </div>
  );
}

function Kelompok({ judul, daftar, besar }: { judul: string; daftar: Anggota[]; besar?: boolean }) {
  if (daftar.length === 0) return null;
  return (
    <section className="relative mt-10 first:mt-0">
      <div className="flex justify-center">
        <h2 className="relative z-10 rounded-full bg-primary px-5 py-2 text-sm font-semibold tracking-tight text-primary-foreground shadow-md">
          {judul}
        </h2>
      </div>
      {potong(daftar, 3).map((baris, i) => (
        <Baris key={i} daftar={baris} besar={besar} />
      ))}
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
    // Garis utama (tulang punggung) di tengah, berada di belakang semua kartu
    <div className="relative mx-auto mt-12 max-w-5xl">
      <div aria-hidden className="absolute bottom-0 left-1/2 top-4 w-px -translate-x-1/2 bg-primary/35" />
      <Kelompok judul="Kepala Laboratorium" daftar={per("KEPALA_LAB")} besar />
      <Kelompok judul="Dosen Laboratorium" daftar={per("DOSEN")} />
      <Kelompok judul="PLP" daftar={per("PLP")} />
      {adaAngkatan ? (
        angkatan.map((ang) => (
          <Kelompok
            key={ang ?? "x"}
            judul={ang ? `Asisten Praktikum Angkatan ${ang}` : "Asisten Praktikum"}
            daftar={asisten.filter((a) => a.angkatan === ang)}
          />
        ))
      ) : (
        <Kelompok judul="Asisten Praktikum" daftar={asisten} />
      )}
    </div>
  );
}

export default function Struktur() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-8 pt-12 text-center sm:pt-16">
      <p className="label-mono">Informasi</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tighter sm:text-5xl">Struktur Organisasi</h1>
      <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
        Kepala laboratorium, dosen, PLP, dan asisten Laboratorium Teknik Digital.
      </p>
      <Suspense fallback={<Skeleton className="mt-14 h-64" />}>
        <Isi />
      </Suspense>
    </div>
  );
}