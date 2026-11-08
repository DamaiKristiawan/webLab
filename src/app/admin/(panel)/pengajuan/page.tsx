import Link from "next/link";
import type { JenisPengajuan, Prisma, StatusPengajuan } from "@prisma/client";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { wajibAdmin } from "@/lib/auth";
import { StatusPill } from "@/components/admin/status-pill";
import { labelJenisPengajuan, labelStatus } from "@/lib/konstanta";
import { formatJam, formatTanggalPendek } from "@/lib/waktu";
import { cn } from "@/lib/utils";

export const metadata = { title: "Pengajuan" };

const STATUS: StatusPengajuan[] = ["MENUNGGU", "DISETUJUI", "DITOLAK", "SELESAI", "DIBATALKAN"];
const JENIS: JenisPengajuan[] = ["ALAT", "RUANGAN", "PENELITIAN"];
const UKURAN = 20;

type Parameter = { status?: string; jenis?: string; q?: string; hal?: string };

function tautan(p: { status?: string; jenis?: string; q?: string; hal?: number }) {
  const u = new URLSearchParams();
  if (p.status) u.set("status", p.status);
  if (p.jenis) u.set("jenis", p.jenis);
  if (p.q) u.set("q", p.q);
  if (p.hal && p.hal > 1) u.set("hal", String(p.hal));
  const s = u.toString();
  return `/admin/pengajuan${s ? `?${s}` : ""}`;
}

export default async function HalamanPengajuanAdmin({
  searchParams,
}: {
  searchParams: Promise<Parameter>;
}) {
  await wajibAdmin();
  const sp = await searchParams;

  const status = STATUS.find((s) => s === sp.status);
  const jenis = JENIS.find((j) => j === sp.jenis);
  const q = (sp.q ?? "").trim().slice(0, 50);
  const hal = Math.max(1, Number(sp.hal) || 1);

  const where: Prisma.PengajuanWhereInput = {
    status,
    jenis,
    OR: q
      ? [
          { kode: { contains: q, mode: "insensitive" } },
          { namaLengkap: { contains: q, mode: "insensitive" } },
          { npm: { contains: q, mode: "insensitive" } },
        ]
      : undefined,
  };

  const [daftar, total, perStatus] = await Promise.all([
    prisma.pengajuan.findMany({
      where,
      // Yang menunggu: terlama dulu (antrean); lainnya: terbaru dulu
      orderBy: { createdAt: status === "MENUNGGU" ? "asc" : "desc" },
      skip: (hal - 1) * UKURAN,
      take: UKURAN,
      select: {
        id: true,
        kode: true,
        jenis: true,
        status: true,
        namaLengkap: true,
        npm: true,
        tanggalMulai: true,
        tanggalSelesai: true,
        createdAt: true,
        ruangan: { select: { nama: true } },
      },
    }),
    prisma.pengajuan.count({ where }),
    prisma.pengajuan.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const hitung = new Map(perStatus.map((s) => [s.status, s._count._all]));
  const semua = perStatus.reduce((a, s) => a + s._count._all, 0);
  const halaman = Math.max(1, Math.ceil(total / UKURAN));

  const tab = [{ nilai: undefined as StatusPengajuan | undefined, label: "Semua", n: semua }].concat(
    STATUS.map((s) => ({ nilai: s, label: labelStatus[s], n: hitung.get(s) ?? 0 })),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Pengajuan</h1>
        <p className="text-sm text-muted-foreground">
          Tinjau pengajuan alat, ruangan, dan penelitian dari pengunjung.
        </p>
      </div>

      {/* Tab status */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {tab.map((t) => (
          <Link
            key={t.label}
            href={tautan({ status: t.nilai, jenis, q })}
            className={cn(
              "btn btn-outline h-9 shrink-0 px-3",
              status === t.nilai && "border-foreground bg-foreground text-background hover:bg-foreground",
            )}
          >
            {t.label}
            <span className="tabular-nums opacity-70">{t.n}</span>
          </Link>
        ))}
      </div>

      {/* Filter */}
      <form method="get" action="/admin/pengajuan" className="flex flex-col gap-3 sm:flex-row">
        {status && <input type="hidden" name="status" value={status} />}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Cari kode, nama, atau NPM"
            className="input h-10 pl-9"
          />
        </div>
        <select name="jenis" defaultValue={jenis ?? ""} className="input h-10 sm:w-52">
          <option value="">Semua jenis</option>
          {JENIS.map((j) => (
            <option key={j} value={j}>{labelJenisPengajuan[j]}</option>
          ))}
        </select>
        <button type="submit" className="btn btn-primary h-10">Terapkan</button>
      </form>

      {/* Daftar */}
      {daftar.length === 0 ? (
        <p className="card p-10 text-center text-sm text-muted-foreground">Tidak ada pengajuan yang cocok.</p>
      ) : (
        <ul className="space-y-3">
          {daftar.map((p) => (
            <li key={p.id}>
              <Link
                href={`/admin/pengajuan/${p.id}`}
                className="card grid gap-3 p-4 transition-colors hover:bg-muted sm:grid-cols-[170px_1fr_190px_110px] sm:items-center sm:gap-4 sm:p-5"
              >
                <span className="font-mono text-xs text-muted-foreground">{p.kode}</span>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{p.namaLengkap}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {p.npm} · {labelJenisPengajuan[p.jenis]}
                    {p.ruangan ? ` · ${p.ruangan.nama}` : ""}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>{formatTanggalPendek(p.tanggalMulai)}</p>
                  <p className="text-xs">
                    {formatJam(p.tanggalMulai)}-{formatJam(p.tanggalSelesai)} WIB
                  </p>
                </div>
                <StatusPill status={p.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Halaman */}
      {halaman > 1 && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Halaman {hal} dari {halaman} ({total} pengajuan)
          </p>
          <div className="flex gap-2">
            {hal > 1 && (
              <Link href={tautan({ status, jenis, q, hal: hal - 1 })} className="btn btn-outline h-9 px-3">
                <ChevronLeft className="h-4 w-4" />
                Sebelumnya
              </Link>
            )}
            {hal < halaman && (
              <Link href={tautan({ status, jenis, q, hal: hal + 1 })} className="btn btn-outline h-9 px-3">
                Berikutnya
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}