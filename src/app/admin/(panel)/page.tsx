import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { wajibLogin } from "@/lib/auth";
import { StatusPill } from "@/components/admin/status-pill";
import { labelJenisPengajuan } from "@/lib/konstanta";
import { cn } from "@/lib/utils";
import {
  bulanWib,
  formatJam,
  formatTanggal,
  formatTanggalPendek,
  kunciHari,
  rentangBulan,
  rentangHariIni,
} from "@/lib/waktu";

export const metadata = { title: "Dashboard Admin" };

const SEHARI = 24 * 60 * 60 * 1000;

export default async function Dashboard() {
  const staff = await wajibLogin(); // khusus admin
  const sekarang = Date.now();
  const { awal: hariAwal, akhir: hariAkhir } = rentangHariIni(sekarang);
  const { awal: bulanAwal, akhir: bulanAkhir } = rentangBulan(bulanWib(sekarang));
  const awal7 = new Date(hariAwal.getTime() - 6 * SEHARI);

  const [menunggu, total, jadwalBulan, respon, terbaru, agenda, tujuhHari] = await Promise.all([
    prisma.pengajuan.count({ where: { status: "MENUNGGU" } }),
    prisma.pengajuan.count(),
    prisma.jadwal.count({ where: { mulai: { gte: bulanAwal, lt: bulanAkhir } } }),
    prisma.responSurvei.count(),
    prisma.pengajuan.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, kode: true, namaLengkap: true, jenis: true, status: true, createdAt: true },
    }),
    prisma.jadwal.findMany({
      where: { mulai: { gte: hariAwal, lt: hariAkhir } },
      orderBy: { mulai: "asc" },
      include: { ruangan: { select: { nama: true } } },
    }),
    prisma.pengajuan.findMany({
      where: { createdAt: { gte: awal7 } },
      select: { createdAt: true },
    }),
  ]);

  // Pengajuan per hari (7 hari terakhir, menurut WIB)
  const hitung = new Map<string, number>();
  for (const p of tujuhHari) {
    const k = kunciHari(p.createdAt);
    hitung.set(k, (hitung.get(k) ?? 0) + 1);
  }
  const batang = Array.from({ length: 7 }, (_, i) => {
    const k = kunciHari(new Date(awal7.getTime() + i * SEHARI));
    return { k, n: hitung.get(k) ?? 0 };
  });
  const maks = Math.max(1, ...batang.map((b) => b.n));

  const kpi = [
    { label: "Pengajuan menunggu", nilai: menunggu, ket: "perlu keputusan", utama: true },
    { label: "Total pengajuan", nilai: total, ket: "sejak awal" },
    { label: "Jadwal bulan ini", nilai: jadwalBulan, ket: "praktikum dan seminar" },
    { label: "Respon survei", nilai: respon, ket: "tanpa identitas" },
  ];

  return (
    <div className="space-y-6">
      {/* Sambutan */}
      <div className="card relative flex flex-wrap items-center justify-between gap-5 overflow-hidden p-6 sm:p-7">
        <div className="bg-grid absolute inset-0" aria-hidden />
        <div className="glow absolute -right-[10%] -top-[90%] h-[420px] w-[420px]" aria-hidden />
        <div className="relative">
          <p className="label-mono">{formatTanggal(new Date(sekarang))}</p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Selamat datang, {staff.nama}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {menunggu > 0
              ? `Ada ${menunggu} pengajuan yang menunggu keputusan.`
              : "Tidak ada pengajuan yang menunggu keputusan."}
          </p>
        </div>
        <div className="relative flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link href="/admin/pengajuan" className="btn btn-primary btn-lg">Tinjau Pengajuan</Link>
          <Link href="/admin/jadwal/baru" className="btn btn-outline btn-lg">Tambah Jadwal</Link>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {kpi.map((k) => (
          <div
            key={k.label}
            className={cn("card p-5", k.utama && "surface-ink border-ink")}
          >
            <p className={cn("text-sm", k.utama ? "text-ink-muted" : "text-muted-foreground")}>
              {k.label}
            </p>
            <p className="mt-2 text-4xl font-extrabold leading-none tracking-tighter sm:text-[2.6rem]">
              {k.nilai.toLocaleString("id-ID")}
            </p>
            <p className={cn("mt-2 text-xs", k.utama ? "text-ink-muted" : "text-muted-foreground")}>
              {k.ket}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        {/* Pengajuan terbaru */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-semibold">Pengajuan terbaru</h2>
            <Link href="/admin/pengajuan" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              Lihat semua <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {terbaru.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">Belum ada pengajuan.</p>
          ) : (
            <ul>
              {terbaru.map((p) => (
                <li
                  key={p.id}
                  className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-border px-5 py-3.5 text-sm last:border-b-0 sm:grid-cols-[150px_1fr_80px_110px]"
                >
                  <span className="hidden font-mono text-xs text-muted-foreground sm:block">{p.kode}</span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{p.namaLengkap}</p>
                    <p className="text-xs text-muted-foreground">{labelJenisPengajuan[p.jenis]}</p>
                  </div>
                  <span className="hidden text-muted-foreground sm:block">{formatTanggalPendek(p.createdAt)}</span>
                  <StatusPill status={p.status} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="grid gap-5 self-start">
          {/* Grafik 7 hari */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-semibold">Pengajuan per hari</h2>
              <span className="label-mono">7 hari</span>
            </div>
            <div className="flex h-32 items-end gap-2.5 p-5" role="img" aria-label="Grafik pengajuan 7 hari terakhir">
              {batang.map((b, i) => (
                <div
                  key={b.k}
                  title={`${b.k}: ${b.n} pengajuan`}
                  className={cn(
                    "flex-1 rounded-t-lg rounded-b-sm border",
                    i === batang.length - 1 ? "border-foreground bg-foreground" : "border-border bg-muted",
                  )}
                  style={{ height: `${Math.max(8, (b.n / maks) * 100)}%` }}
                />
              ))}
            </div>
          </div>

          {/* Agenda hari ini */}
          <div className="card overflow-hidden">
            <div className="border-b border-border px-5 py-4">
              <h2 className="font-semibold">Agenda hari ini</h2>
            </div>
            {agenda.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">Tidak ada kegiatan hari ini.</p>
            ) : (
              <ul>
                {agenda.map((j) => (
                  <li key={j.id} className="border-b border-border px-5 py-3.5 text-sm last:border-b-0">
                    <p className="font-medium">{j.judul}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatJam(j.mulai)}-{formatJam(j.selesai)}
                      {j.ruangan ? ` · ${j.ruangan.nama}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}