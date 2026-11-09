import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { JENIS_JADWAL, labelJenis, type JenisJadwalKey } from "@/lib/konstanta";
import { Skeleton } from "@/components/publik/beranda-data";
import {
  bulanWib,
  formatJam,
  formatTanggal,
  geserBulan,
  kunciHari,
  namaBulan,
  rentangBulan,
} from "@/lib/waktu";

export const metadata = { title: "Jadwal" };

type Params = Promise<Record<string, string | string[] | undefined>>;
const satu = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default function HalamanJadwal({ searchParams }: { searchParams: Params }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Jadwal</h1>
        <p className="mt-2 text-muted-foreground">
          Jadwal praktikum, seminar, dan kegiatan Laboratorium Teknik Digital.
        </p>
      </header>
      <Suspense fallback={<Skeleton className="h-96" />}>
        <IsiJadwal searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function IsiJadwal({ searchParams }: { searchParams: Params }) {
  await connection();
  const sp = await searchParams;
  const sekarang = Date.now();

  const bulanDefault = bulanWib(sekarang);
  const bulanParam = satu(sp.bulan);
  const bulan =
    bulanParam && /^\d{4}-(0[1-9]|1[0-2])$/.test(bulanParam) ? bulanParam : bulanDefault;

  const jenisParam = satu(sp.jenis);
  const jenis = (JENIS_JADWAL as readonly string[]).includes(jenisParam ?? "")
    ? (jenisParam as JenisJadwalKey)
    : undefined;

  const { awal, akhir } = rentangBulan(bulan);

  const daftar = await prisma.jadwal.findMany({
    where: {
      mulai: { gte: awal, lt: akhir },
      ...(jenis ? { jenis } : {}),
    },
    orderBy: { mulai: "asc" },
  });

  const perHari = new Map<string, typeof daftar>();
  for (const j of daftar) {
    const k = kunciHari(j.mulai);
    const arr = perHari.get(k);
    if (arr) arr.push(j);
    else perHari.set(k, [j]);
  }
  const kunciHariIni = kunciHari(new Date(sekarang));

  function tautan(ym: string) {
    const q = new URLSearchParams();
    q.set("bulan", ym);
    if (jenis) q.set("jenis", jenis);
    return `/jadwal?${q.toString()}`;
  }

  return (
    <div className="space-y-8">
      {/* Navigasi bulan */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link href={tautan(geserBulan(bulan, -1))} className="btn btn-outline h-9 w-9 px-0" aria-label="Bulan sebelumnya">
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <p className="min-w-40 text-center text-lg font-semibold">{namaBulan(bulan)}</p>
          <Link href={tautan(geserBulan(bulan, 1))} className="btn btn-outline h-9 w-9 px-0" aria-label="Bulan berikutnya">
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        {bulan !== bulanDefault && (
          <Link href={tautan(bulanDefault)} className="text-sm text-muted-foreground hover:text-foreground">
            Kembali ke bulan ini
          </Link>
        )}
      </div>

      {/* Filter */}
      <form action="/jadwal" method="get" className="flex flex-wrap items-end gap-3">
        <input type="hidden" name="bulan" value={bulan} />
        <div>
          <label htmlFor="jenis" className="mb-1 block text-xs text-muted-foreground">Jenis</label>
          <select id="jenis" name="jenis" defaultValue={jenis ?? ""} className="input w-44">
            <option value="">Semua jenis</option>
            {JENIS_JADWAL.map((j) => (
              <option key={j} value={j}>{labelJenis[j]}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary">Terapkan</button>
        <Link href={`/jadwal?bulan=${bulan}`} className="btn btn-outline">Reset</Link>
      </form>

      {/* Daftar per hari */}
      {perHari.size === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Tidak ada jadwal pada bulan ini dengan filter tersebut.
        </div>
      ) : (
        <div className="space-y-8">
          {[...perHari.entries()].map(([kunci, items]) => (
            <section key={kunci}>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                {formatTanggal(items[0].mulai)}
                {kunci === kunciHariIni && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    Hari ini
                  </span>
                )}
              </h2>
              <ul className="space-y-3">
                {items.map((j) => (
                  <li key={j.id} className="flex gap-4 rounded-xl border border-border bg-card p-4">
                    <div className="w-16 shrink-0 text-sm tabular-nums">
                      <p className="font-semibold">{formatJam(j.mulai)}</p>
                      <p className="text-muted-foreground">{formatJam(j.selesai)}</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                        {labelJenis[j.jenis]}
                      </span>
                      <p className="mt-1 font-medium">{j.judul}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          Laboratorium Teknik Digital
                        </span>
                        {j.kelas && <span>Kelas {j.kelas}</span>}
                        {j.pengampu && <span>{j.pengampu}</span>}
                      </p>
                      {j.keterangan && (
                        <p className="mt-1 text-sm text-muted-foreground">{j.keterangan}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}