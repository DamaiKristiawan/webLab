import Link from "next/link";
import { ChevronLeft, ChevronRight, Download, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { wajibStaf } from "@/lib/auth";
import { hapusHasil, resetSesi } from "@/actions/hasil";
import { TombolAksi } from "@/components/admin/tombol-aksi";
import { filterHasil } from "@/lib/hasil-tes";
import { formatJam, formatTanggalPendek } from "@/lib/waktu";

export const metadata = { title: "Hasil Tes" };

const UKURAN = 25;

type Parameter = { praktikum?: string; jenis?: string; q?: string; hal?: string };

function tautan(base: string, p: { praktikum?: number; jenis?: string; q?: string; hal?: number }) {
  const u = new URLSearchParams();
  if (p.praktikum) u.set("praktikum", String(p.praktikum));
  if (p.jenis) u.set("jenis", p.jenis);
  if (p.q) u.set("q", p.q);
  if (p.hal && p.hal > 1) u.set("hal", String(p.hal));
  const s = u.toString();
  return `${base}${s ? `?${s}` : ""}`;
}

export default async function HalamanHasilTes({ searchParams }: { searchParams: Promise<Parameter> }) {
  await wajibStaf();
  const sp = await searchParams;
  const { where, whereSesi, praktikumId, jenis, q } = filterHasil(sp);
  const hal = Math.max(1, Number(sp.hal) || 1);

  const infoTes = {
    select: {
      jenis: true,
      judulPraktikum: { select: { urutan: true, judul: true, praktikum: { select: { nama: true } } } },
    },
  } as const;

  const [daftar, total, rata, praktikum, sesiTertunda] = await Promise.all([
    prisma.hasilTes.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (hal - 1) * UKURAN,
      take: UKURAN,
      include: { tes: infoTes },
    }),
    prisma.hasilTes.count({ where }),
    prisma.hasilTes.aggregate({ where, _avg: { skor: true } }),
    prisma.praktikum.findMany({ orderBy: { nama: "asc" }, select: { id: true, nama: true } }),
    prisma.sesiTes.findMany({
      where: whereSesi,
      orderBy: { mulaiPada: "desc" },
      take: 50,
      include: { tes: infoTes },
    }),
  ]);

  const halaman = Math.max(1, Math.ceil(total / UKURAN));
  const filter = { praktikum: praktikumId, jenis, q };
  const sekarang = Date.now();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Hasil Tes</h1>
          <p className="text-sm text-muted-foreground">
            Nilai pretest dan postest. Hanya admin dan asisten yang dapat melihatnya.
          </p>
        </div>
        <a href={tautan("/admin/hasil-tes/ekspor", filter)} className="btn btn-outline">
          <Download className="h-4 w-4" />
          Ekspor CSV
        </a>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5">
          <p className="text-sm text-muted-foreground">Jumlah hasil</p>
          <p className="mt-2 text-4xl font-extrabold leading-none tracking-tighter">{total.toLocaleString("id-ID")}</p>
        </div>
        <div className="card surface-ink border-ink p-5">
          <p className="text-sm text-ink-muted">Rata-rata skor</p>
          <p className="mt-2 text-4xl font-extrabold leading-none tracking-tighter">
            {rata._avg.skor === null ? "-" : rata._avg.skor.toLocaleString("id-ID", { maximumFractionDigits: 1 })}
          </p>
        </div>
      </div>

      <form method="get" action="/admin/hasil-tes" className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input name="q" defaultValue={q} placeholder="Cari nama atau NPM" className="input h-10 pl-9" />
        </div>
        <select name="praktikum" defaultValue={praktikumId ?? ""} className="input h-10 lg:w-56">
          <option value="">Semua praktikum</option>
          {praktikum.map((p) => (
            <option key={p.id} value={p.id}>{p.nama}</option>
          ))}
        </select>
        <select name="jenis" defaultValue={jenis ?? ""} className="input h-10 lg:w-40">
          <option value="">Pretest dan postest</option>
          <option value="PRETEST">Pretest</option>
          <option value="POSTEST">Postest</option>
        </select>
        <button type="submit" className="btn btn-primary h-10">Terapkan</button>
      </form>

      {daftar.length === 0 ? (
        <p className="card p-10 text-center text-sm text-muted-foreground">Belum ada hasil tes yang cocok.</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                {["Waktu", "Peserta", "Praktikum / judul", "Tes", "Skor", ""].map((h) => (
                  <th key={h} className="label-mono px-4 py-3 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {daftar.map((h) => (
                <tr key={h.id} className="border-b border-border last:border-b-0">
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {formatTanggalPendek(h.createdAt)}
                    <br />
                    <span className="text-xs">{formatJam(h.createdAt)} WIB</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{h.namaPeserta}</p>
                    <p className="text-xs text-muted-foreground">{h.npm}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p>{h.tes.judulPraktikum.praktikum.nama}</p>
                    <p className="text-xs text-muted-foreground">
                      Judul {h.tes.judulPraktikum.urutan}: {h.tes.judulPraktikum.judul}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={h.tes.jenis === "POSTEST" ? "pill pill-ok" : "pill"}>
                      {h.tes.jenis === "POSTEST" ? "Postest" : "Pretest"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className="font-bold tabular-nums">
                      {h.skor.toLocaleString("id-ID", { maximumFractionDigits: 1 })}
                    </span>
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      ({h.jumlahBenar}/{h.jumlahSoal})
                    </span>
                    {h.terlambat && <span className="pill pill-wait ml-2">Lewat waktu</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <TombolAksi
                      aksi={hapusHasil}
                      id={h.id}
                      label="Hapus"
                      bahaya
                      konfirmasi={`Hapus hasil ${h.namaPeserta}? Peserta ini akan bisa mengerjakan tes ini lagi.`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {halaman > 1 && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Halaman {hal} dari {halaman}
          </p>
          <div className="flex gap-2">
            {hal > 1 && (
              <Link href={tautan("/admin/hasil-tes", { ...filter, hal: hal - 1 })} className="btn btn-outline h-9 px-3">
                <ChevronLeft className="h-4 w-4" />
                Sebelumnya
              </Link>
            )}
            {hal < halaman && (
              <Link href={tautan("/admin/hasil-tes", { ...filter, hal: hal + 1 })} className="btn btn-outline h-9 px-3">
                Berikutnya
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      )}

      {sesiTertunda.length > 0 && (
        <div>
          <h2 className="font-semibold">Belum mengumpulkan ({sesiTertunda.length})</h2>
          <p className="mb-3 mt-1 text-sm text-muted-foreground">
            Peserta yang sudah menekan Mulai tetapi belum mengirim jawaban. Reset hanya bila ada kendala teknis,
            karena peserta akan bisa memulai ulang dari awal.
          </p>
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  {["Peserta", "Praktikum / judul", "Tes", "Status", ""].map((h) => (
                    <th key={h} className="label-mono px-4 py-3 font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sesiTertunda.map((s) => {
                  const habis = s.batasPada.getTime() < sekarang;
                  return (
                    <tr key={s.id} className="border-b border-border last:border-b-0">
                      <td className="px-4 py-3">
                        <p className="font-medium">{s.namaPeserta}</p>
                        <p className="text-xs text-muted-foreground">{s.npm}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p>{s.tes.judulPraktikum.praktikum.nama}</p>
                        <p className="text-xs text-muted-foreground">
                          Judul {s.tes.judulPraktikum.urutan}: {s.tes.judulPraktikum.judul}
                        </p>
                      </td>
                      <td className="px-4 py-3">{s.tes.jenis === "POSTEST" ? "Postest" : "Pretest"}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className={habis ? "pill pill-no" : "pill pill-wait"}>
                          {habis ? "Waktu habis" : "Sedang mengerjakan"}
                        </span>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Mulai {formatJam(s.mulaiPada)} WIB
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <TombolAksi
                          aksi={resetSesi}
                          id={s.id}
                          label="Reset"
                          bahaya
                          konfirmasi={`Reset sesi ${s.namaPeserta}? Peserta bisa memulai tes dari awal.`}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
