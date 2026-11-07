import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Images, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { labelJenis } from "@/lib/konstanta";
import { cn } from "@/lib/utils";
import { formatJam, formatTanggalPendek, rentangHariIni } from "@/lib/waktu";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-muted", className)} />;
}

function Kosong({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

/** Di dalam panel chip (permukaan ink). */
export async function SesiBerikutnya() {
  await connection();
  const sekarang = new Date();

  const sesi = await prisma.jadwal.findFirst({
    where: { selesai: { gt: sekarang } },
    orderBy: { mulai: "asc" },
    include: { ruangan: { select: { nama: true } } },
  });
  const berlangsung = sesi ? sesi.mulai.getTime() <= sekarang.getTime() : false;

  return (
    <div className="mt-6 rounded-xl border border-ink-foreground/25 bg-ink-foreground/5 p-4">
      <span className="inline-flex items-center gap-2 text-xs font-bold tracking-wide">
        {sesi && (
          <i className={cn("h-2 w-2 rounded-full bg-current", berlangsung && "animate-pulse-dot")} />
        )}
        {berlangsung ? "BERLANGSUNG" : "KEGIATAN BERIKUTNYA"}
      </span>
      {sesi ? (
        <>
          <p className="mt-2 font-semibold leading-snug">{sesi.judul}</p>
          <p className="mt-1 text-xs text-ink-muted">
            {formatTanggalPendek(sesi.mulai)} · {formatJam(sesi.mulai)}-{formatJam(sesi.selesai)} WIB
            {sesi.ruangan ? ` · ${sesi.ruangan.nama}` : ""}
          </p>
        </>
      ) : (
        <p className="mt-2 text-sm text-ink-muted">Belum ada kegiatan terjadwal.</p>
      )}
    </div>
  );
}

/** Band statistik (permukaan ink) dari data asli. */
export async function StatistikLab() {
  await connection();
  const [praktikum, alat, ruangan, asisten] = await Promise.all([
    prisma.praktikum.count({ where: { aktif: true } }),
    prisma.alat.aggregate({ _sum: { stokTotal: true }, where: { aktif: true } }),
    prisma.ruangan.count({ where: { aktif: true } }),
    prisma.anggotaLab.count({ where: { jabatan: "ASISTEN", aktif: true } }),
  ]);

  const data = [
    { nilai: praktikum, label: "Praktikum aktif" },
    { nilai: alat._sum.stokTotal ?? 0, label: "Unit alat" },
    { nilai: ruangan, label: "Ruangan" },
    { nilai: asisten, label: "Asisten praktikum" },
  ];

  return (
    <div className="grid grid-cols-2 gap-y-8 md:grid-cols-4">
      {data.map((d) => (
        <div
          key={d.label}
          className="md:border-l md:border-ink-border/40 md:px-6 md:first:border-l-0 md:first:pl-0"
        >
          <p className="text-4xl font-extrabold leading-none tracking-tighter sm:text-5xl">
            {d.nilai.toLocaleString("id-ID")}
          </p>
          <p className="mt-2 text-sm text-ink-muted">{d.label}</p>
        </div>
      ))}
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
              "flex gap-4 rounded-2xl border border-border p-4 transition-colors sm:gap-5 sm:p-5",
              berlangsung
                ? "surface-ink border-ink shadow-[0_24px_44px_-24px_color-mix(in_srgb,var(--foreground)_70%,transparent)]"
                : "bg-card shadow-[var(--shadow-card)]",
              selesai && "opacity-55",
            )}
          >
            <div className="w-14 shrink-0 text-sm tabular-nums sm:w-16">
              <p className="text-base font-bold sm:text-lg">{formatJam(j.mulai)}</p>
              <p className={berlangsung ? "text-ink-muted" : "text-muted-foreground"}>
                {formatJam(j.selesai)}
              </p>
            </div>
            <div className="min-w-0 flex-1">
              {berlangsung ? (
                <span className="inline-flex items-center gap-2 text-xs font-bold tracking-wide">
                  <i className="h-2 w-2 animate-pulse-dot rounded-full bg-current" />
                  BERLANGSUNG
                </span>
              ) : (
                <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
                  {labelJenis[j.jenis]}
                </span>
              )}
              <p className="mt-1.5 font-semibold">{j.judul}</p>
              {meta && (
                <p
                  className={cn(
                    "mt-0.5 flex items-center gap-1.5 text-sm",
                    berlangsung ? "text-ink-muted" : "text-muted-foreground",
                  )}
                >
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{meta}</span>
                </p>
              )}
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
        <li key={p.id} className="card p-5">
          <p className="label-mono">{formatTanggalPendek(p.mulaiTampil)}</p>
          <p className="mt-1.5 font-semibold">{p.judul}</p>
          <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{p.isi}</p>
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
          <div className="p-5">
            <p className="label-mono">{formatTanggalPendek(d.tanggal)}</p>
            <p className="mt-1.5 font-semibold leading-snug">{d.judul}</p>
            {d.ringkasan && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{d.ringkasan}</p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}