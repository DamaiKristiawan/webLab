import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { wajibAdmin } from "@/lib/auth";
import { buatSurveiStandar, hapusPertanyaan, hapusSemuaRespon } from "@/actions/survei";
import { FormPertanyaan, FormSurvei } from "@/components/admin/form-survei";
import { TombolAksi } from "@/components/admin/tombol-aksi";
import { formatTanggalPendek } from "@/lib/waktu";
import { cn } from "@/lib/utils";

export const metadata = { title: "Survei" };

const fmt = (n: number) => n.toLocaleString("id-ID", { maximumFractionDigits: 2 });

export default async function HalamanSurveiAdmin({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  await wajibAdmin();
  const editId = Number((await searchParams).edit) || 0;

  const survei = await prisma.survei.findFirst({ orderBy: { id: "desc" } });

  if (!survei) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Survei</h1>
        <div className="card flex flex-col items-center gap-3 p-12 text-center">
          <p className="font-semibold">Belum ada survei</p>
          <p className="max-w-md text-sm text-muted-foreground">
            Buat survei kepuasan dengan enam pertanyaan standar (lima skala 1-5 dan satu kolom saran). Semua
            pertanyaan bisa diubah setelahnya.
          </p>
          <TombolAksi aksi={buatSurveiStandar} id={0} label="Buat survei standar" />
        </div>
      </div>
    );
  }

  const [pertanyaan, jumlahRespon, sebaran, saran] = await Promise.all([
    prisma.pertanyaanSurvei.findMany({
      where: { surveiId: survei.id },
      orderBy: [{ urutan: "asc" }, { id: "asc" }],
    }),
    prisma.responSurvei.count({ where: { surveiId: survei.id } }),
    prisma.jawabanSurvei.groupBy({
      by: ["pertanyaanId", "nilai"],
      where: { pertanyaan: { surveiId: survei.id }, nilai: { not: null } },
      _count: { _all: true },
    }),
    prisma.jawabanSurvei.findMany({
      where: { pertanyaan: { surveiId: survei.id, tipe: "TEKS" }, teks: { not: null } },
      orderBy: { id: "desc" },
      take: 200,
      select: { pertanyaanId: true, teks: true, respon: { select: { createdAt: true } } },
    }),
  ]);

  // Sebaran nilai 1-5 per pertanyaan
  const peta = new Map<number, number[]>();
  for (const s of sebaran) {
    if (s.nilai === null) continue;
    const arr = peta.get(s.pertanyaanId) ?? [0, 0, 0, 0, 0];
    arr[s.nilai - 1] = s._count._all;
    peta.set(s.pertanyaanId, arr);
  }

  let totalNilai = 0;
  let totalJawaban = 0;
  for (const arr of peta.values()) {
    arr.forEach((n, k) => {
      totalNilai += n * (k + 1);
      totalJawaban += n;
    });
  }
  const rataKeseluruhan = totalJawaban ? totalNilai / totalJawaban : null;

  const edit = pertanyaan.find((p) => p.id === editId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Survei</h1>
          <p className="text-sm text-muted-foreground">Rekap jawaban anonim dan pengelolaan pertanyaan.</p>
        </div>
        <Link href="/survei" target="_blank" className="btn btn-outline">Lihat halaman publik ↗</Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card p-5">
          <p className="text-sm text-muted-foreground">Responden</p>
          <p className="mt-2 text-4xl font-extrabold leading-none tracking-tighter">{jumlahRespon.toLocaleString("id-ID")}</p>
        </div>
        <div className="card surface-ink border-ink p-5">
          <p className="text-sm text-ink-muted">Rata-rata (skala 1-5)</p>
          <p className="mt-2 text-4xl font-extrabold leading-none tracking-tighter">
            {rataKeseluruhan === null ? "-" : fmt(rataKeseluruhan)}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-muted-foreground">Status</p>
          <p className="mt-3">
            <span className={cn("pill", survei.aktif ? "pill-ok" : "pill-no")}>{survei.aktif ? "Dibuka" : "Ditutup"}</span>
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        {/* Rekap per pertanyaan */}
        <div className="space-y-4">
          <h2 className="font-semibold">Rekap per pertanyaan</h2>
          {pertanyaan.length === 0 && (
            <p className="card p-8 text-center text-sm text-muted-foreground">Belum ada pertanyaan.</p>
          )}

          {pertanyaan.map((p, i) => {
            if (p.tipe === "SKALA") {
              const hitung = peta.get(p.id) ?? [0, 0, 0, 0, 0];
              const total = hitung.reduce((a, b) => a + b, 0);
              const rata = total ? hitung.reduce((a, n, k) => a + n * (k + 1), 0) / total : null;
              const maks = Math.max(1, ...hitung);
              return (
                <section key={p.id} className="card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm font-medium">
                      <span className="mr-2 text-muted-foreground">{i + 1}.</span>
                      {p.teks}
                    </p>
                    <div className="shrink-0 text-right">
                      <p className="text-2xl font-extrabold leading-none tracking-tighter">{rata === null ? "-" : fmt(rata)}</p>
                      <p className="label-mono mt-1">{total} jawaban</p>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-1.5" aria-label="Sebaran nilai">
                    {[5, 4, 3, 2, 1].map((n) => (
                      <li key={n} className="flex items-center gap-3 text-xs">
                        <span className="w-3 font-semibold">{n}</span>
                        <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                          <span
                            className="block h-full rounded-full bg-foreground"
                            style={{ width: `${(hitung[n - 1] / maks) * 100}%` }}
                          />
                        </span>
                        <span className="w-8 text-right tabular-nums text-muted-foreground">{hitung[n - 1]}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            }

            const daftar = saran.filter((s) => s.pertanyaanId === p.id);
            return (
              <section key={p.id} className="card p-5">
                <p className="text-sm font-medium">
                  <span className="mr-2 text-muted-foreground">{i + 1}.</span>
                  {p.teks}
                </p>
                <p className="label-mono mt-1">{daftar.length} jawaban (terbaru)</p>
                {daftar.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">Belum ada jawaban.</p>
                ) : (
                  <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto">
                    {daftar.map((s, k) => (
                      <li key={k} className="rounded-lg border border-border p-3 text-sm">
                        <p className="whitespace-pre-line break-words">{s.teks}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{formatTanggalPendek(s.respon.createdAt)}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>

        {/* Pengelolaan */}
        <div className="space-y-6 self-start">
          <FormSurvei key={`sv-${survei.id}`} awal={survei} />

          <section className="card p-5">
            <h3 className="font-semibold">Pertanyaan ({pertanyaan.length})</h3>
            <ul className="mt-3 divide-y divide-border">
              {pertanyaan.map((p, i) => (
                <li key={p.id} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-sm">
                    <span className="mr-1.5 text-muted-foreground">{i + 1}.</span>
                    {p.teks}
                  </p>
                  <p className="label-mono mt-1">{p.tipe === "SKALA" ? "Skala 1-5" : "Isian teks"}</p>
                  <div className="mt-2 flex flex-wrap items-start gap-2">
                    <Link href={`/admin/survei?edit=${p.id}`} className="btn btn-outline h-8 px-3">Ubah</Link>
                    <TombolAksi aksi={hapusPertanyaan} id={p.id} label="Hapus" bahaya konfirmasi="Hapus pertanyaan ini?" />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <FormPertanyaan key={edit?.id ?? "baru"} surveiId={survei.id} awal={edit} />

          <section className="card p-5">
            <h3 className="font-semibold">Mulai periode baru</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Menghapus seluruh jawaban yang sudah masuk. Tidak bisa dibatalkan, jadi catat rekapnya dulu.
            </p>
            <div className="mt-3">
              <TombolAksi
                aksi={hapusSemuaRespon}
                id={survei.id}
                label="Hapus semua respon"
                bahaya
                konfirmasi={`Hapus ${jumlahRespon} respon survei? Tindakan ini tidak bisa dibatalkan.`}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}