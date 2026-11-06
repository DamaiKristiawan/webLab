import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Images, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatJam, formatTanggal, formatTanggalPendek, rentangHariIni } from "@/lib/waktu";
import { cn } from "@/lib/utils";

const labelJenis = {
  PRAKTIKUM: "Praktikum",
  SEMINAR: "Seminar",
  LAINNYA: "Kegiatan",
} as const;

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-muted", className)} />;
}

function Kosong({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

export async function SesiBerikutnya() {
  await connection();
  const sesi = await prisma.jadwal.findFirst({
    where: { mulai: { gte: new Date() } },
    orderBy: { mulai: "asc" },
    include: { ruangan: { select: { nama: true } } },
  });

  return (
    <div className="card p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Kegiatan berikutnya
      </p>
      {sesi ? (
        <>
          <p className="mt-2 text-lg font-semibold leading-snug">{sesi.judul}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatTanggal(sesi.mulai)} · {formatJam(sesi.mulai)} WIB
          </p>
          {sesi.ruangan && (
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {sesi.ruangan.nama}
            </p>
          )}
        </>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">Belum ada kegiatan terjadwal.</p>
      )}
    </div>
  );
}

export async function AgendaHariIni() {
  await connection();
  const sekarang = Date.now();
  const { awal, akhir } = rentangHariIni(sekarang);

  const daftar = await prisma.jadwal.findMany({
    where: { mulai: { gte: awal, lt: akhir } },
    orderBy: { mulai: "asc" },
    include: { ruangan: { select: { nama: true } } },
  });

  if (daftar.length === 0) return <Kosong>Tidak ada kegiatan hari ini.</Kosong>;

  return (
    <ul className="space-y-3">
      {daftar.map((j) => {
        const berlangsung = j.mulai.getTime() <= sekarang && sekarang < j.selesai.getTime();
        const selesai = j.selesai.getTime() <= sekarang;
        const meta = [j.ruangan?.nama, j.kelas ? `Kelas ${j.kelas}` : null, j.pengampu]
          .filter(Boolean)
          .join(" · ");

        return (
          <li
            key={j.id}
            className={cn(
              "flex gap-4 rounded-xl border border-border p-4 transition-colors",
              berlangsung && "border-foreground/40 bg-muted",
              selesai && "opacity-60",
            )}
          >
            <div className="w-16 shrink-0 text-sm tabular-nums">
              <p className="font-semibold">{formatJam(j.mulai)}</p>
              <p className="text-muted-foreground">{formatJam(j.selesai)}</p>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                  {labelJenis[j.jenis]}
                </span>
                {berlangsung && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                    <span className="h-2 w-2 animate-pulse-dot rounded-full bg-foreground text-foreground" />
                    Berlangsung
                  </span>
                )}
              </div>
              <p className="mt-1 font-medium">{j.judul}</p>
              {meta && <p className="mt-0.5 text-sm text-muted-foreground">{meta}</p>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export async function PengumumanTerbaru() {
  await connection();
  const sekarang = new Date();

  const daftar = await prisma.pengumuman.findMany({
    where: {
      aktif: true,
      mulaiTampil: { lte: sekarang },
      OR: [{ selesaiTampil: null }, { selesaiTampil: { gte: sekarang } }],
    },
    orderBy: { mulaiTampil: "desc" },
    take: 3,
  });

  if (daftar.length === 0) return <Kosong>Belum ada pengumuman.</Kosong>;

  return (
    <ul className="space-y-3">
      {daftar.map((p) => (
        <li key={p.id} className="rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">{formatTanggalPendek(p.mulaiTampil)}</p>
          <p className="mt-1 font-medium">{p.judul}</p>
          <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{p.isi}</p>
        </li>
      ))}
    </ul>
  );
}

export async function KegiatanTerbaru() {
  await connection();
  const daftar = await prisma.dokumentasi.findMany({
    where: { terbit: true },
    orderBy: { tanggal: "desc" },
    take: 3,
  });

  if (daftar.length === 0) return <Kosong>Belum ada dokumentasi kegiatan.</Kosong>;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {daftar.map((d) => (
        <Link
          key={d.id}
          href={`/dokumentasi/${d.slug}`}
          className="card group overflow-hidden transition-transform duration-300 hover:-translate-y-1"
        >
          <div className="relative aspect-[16/9] overflow-hidden bg-muted">
            {d.coverUrl ? (
              <Image
                src={d.coverUrl}
                alt=""
                fill
                unoptimized
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <Images className="h-8 w-8" />
              </div>
            )}
          </div>
          <div className="p-4">
            <p className="text-xs text-muted-foreground">{formatTanggalPendek(d.tanggal)}</p>
            <p className="mt-1 font-semibold leading-snug">{d.judul}</p>
            {d.ringkasan && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{d.ringkasan}</p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}