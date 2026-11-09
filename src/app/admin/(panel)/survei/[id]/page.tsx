import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { wajibAdmin } from "@/lib/auth";
import { hapusPertanyaan, hapusRespon, hapusSemuaRespon, hapusSurvei } from "@/actions/survei";
import { FormPeriodeBaru, FormPertanyaan, FormSurvei } from "@/components/admin/form-survei";
import { TombolAksi } from "@/components/admin/tombol-aksi";
import { formatJam, formatTanggalPendek } from "@/lib/waktu";
import { cn } from "@/lib/utils";

export const metadata = { title: "Kelola Kuesioner" };

const fmt = (n: number) => n.toLocaleString("id-ID", { maximumFractionDigits: 2 });

export default async function HalamanKuesioner({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  await wajibAdmin();
  const id = Number((await params).id) || 0;
  const editId = Number((await searchParams).edit) || 0;

  const survei = await prisma.survei.findUnique({ where: { id } });
  if (!survei) notFound();

  const [pertanyaan, respon, sebaran, saran] = await Promise.all([
    prisma.pertanyaanSurvei.findMany({ where: { surveiId: id }, orderBy: [{ urutan: "asc" }, { id: "asc" }] }),
    prisma.responSurvei.findMany({
      where: { surveiId: id },
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { jawaban: { where: { nilai: { not: null } }, select: { nilai: true } } },
    }),
    prisma.jawabanSurvei.groupBy({
      by: ["pertanyaanId", "nilai"],
      where: { pertanyaan: { surveiId: id }, nilai: { not: null } },
      _count: { _all: true },
    }),
    prisma.jawabanSurvei.findMany({
      where: { pertanyaan: { surveiId: id, tipe: "TEKS" }, teks: { not: null } },
      orderBy: { id: "desc" },
      take: 200,
      select: { pertanyaanId: true, teks: true, respon: { select: { createdAt: true, namaPeserta: true } } },
    }),
  ]);
  const jumlahRespon = await prisma.responSurvei.count({ where: { surveiId: id } });

  const peta = new Map<number, number[]>();
  for (const s of sebaran) {
    if (s.nilai === null) continue;
    const arr = peta.get(s.pertanyaanId) ?? [0, 0, 0, 0, 0];
    arr[s.nilai - 1] = s._count._all;
    peta.set(s.pertanyaanId, arr);
  }
  const statistik = (ids: number[]) => {
    let jml = 0;
    let n = 0;
    for (const pid of ids) {
      (peta.get(pid) ?? []).forEach((c, k) => {
        jml += c * (k + 1);
        n += c;
      });
    }
    return n ? jml / n : null;
  };

  const skala = pertanyaan.filter((p) => p.tipe === "SKALA");
  const rataKeseluruhan = statistik(skala.map((p) => p.id));

  // Rata-rata per dimensi
  const dimensi: { nama: string; rata: number | null }[] = [];
  const urut: string[] = [];
  for (const p of skala) {
    const k = p.kelompok ?? "Tanpa dimensi";
    if (!urut.includes(k)) urut.push(k);
  }
  for (const k of urut) {
    dimensi.push({ nama: k, rata: statistik(skala.filter((p) => (p.kelompok ?? "Tanpa dimensi") === k).map((p) => p.id)) });
  }

  const edit = pertanyaan.find((p) => p.id === editId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin/survei" className="text-sm text-muted-foreground hover:underline">← Semua kuesioner</Link>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight">{survei.judul}</h1>
          <p className="text-sm text-muted-foreground">Periode {survei.tahun}. Hanya admin yang melihat nama dan NPM.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`/admin/survei/${id}/ekspor`} className="btn btn-outline">Unduh Excel</a>
          <a href={`/admin/survei/${id}/ekspor?format=csv`} className="btn btn-outline">CSV</a>
          <Link href={`/survei/${survei.kode}`} target="_blank" className="btn btn-outline">Lihat halaman publik ↗</Link>
        </div>
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
        <div className="space-y-6">
          {dimensi.length > 0 && (
            <section className="card p-5">
              <h2 className="font-semibold">Rata-rata per dimensi</h2>
              <ul className="mt-4 space-y-3">
                {dimensi.map((d) => (
                  <li key={d.nama}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span>{d.nama}</span>
                      <span className="font-bold tabular-nums">{d.rata === null ? "-" : fmt(d.rata)}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-foreground" style={{ width: `${((d.rata ?? 0) / 5) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

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
                      <div className="text-sm">
                        {p.kelompok && <p className="label-mono mb-1">{p.kelompok}</p>}
                        <p className="font-medium">
                          <span className="mr-2 text-muted-foreground">{i + 1}.</span>
                          {p.teks}
                        </p>
                      </div>
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
                            <span className="block h-full rounded-full bg-foreground" style={{ width: `${(hitung[n - 1] / maks) * 100}%` }} />
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
                          <p className="mt-1 text-xs text-muted-foreground">
                            {s.respon.namaPeserta ?? "Tanpa nama"} · {formatTanggalPendek(s.respon.createdAt)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>

          <section className="card overflow-x-auto">
            <div className="p-5 pb-3">
              <h2 className="font-semibold">Responden ({jumlahRespon.toLocaleString("id-ID")})</h2>
              <p className="text-sm text-muted-foreground">200 terbaru. Unduh Excel untuk data lengkap.</p>
            </div>
            {respon.length === 0 ? (
              <p className="p-8 pt-2 text-center text-sm text-muted-foreground">Belum ada responden.</p>
            ) : (
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-y border-border text-left">
                    <th className="p-3 font-semibold">Nama</th>
                    <th className="p-3 font-semibold">NPM</th>
                    <th className="p-3 font-semibold">Waktu</th>
                    <th className="p-3 text-right font-semibold">Rata-rata</th>
                    <th className="p-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {respon.map((r) => {
                    const n = r.jawaban.map((j) => j.nilai ?? 0);
                    const rata = n.length ? n.reduce((a, b) => a + b, 0) / n.length : null;
                    return (
                      <tr key={r.id}>
                        <td className="p-3">{r.namaPeserta ?? <span className="text-muted-foreground">Anonim (lama)</span>}</td>
                        <td className="p-3 tabular-nums">{r.npm ?? "-"}</td>
                        <td className="p-3 text-muted-foreground">
                          {formatTanggalPendek(r.createdAt)} {formatJam(r.createdAt)}
                        </td>
                        <td className="p-3 text-right tabular-nums">{rata === null ? "-" : fmt(rata)}</td>
                        <td className="p-3 text-right">
                          <TombolAksi
                            aksi={hapusRespon}
                            id={r.id}
                            label="Hapus"
                            bahaya
                            konfirmasi="Hapus jawaban ini? NPM tersebut bisa mengisi lagi."
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </section>
        </div>

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
                  <p className="label-mono mt-1">
                    {p.kelompok ? `${p.kelompok} · ` : ""}
                    {p.tipe === "SKALA" ? "Bintang 1-5" : "Isian teks"}
                  </p>
                  <div className="mt-2 flex flex-wrap items-start gap-2">
                    <Link href={`/admin/survei/${id}?edit=${p.id}`} className="btn btn-outline h-8 px-3">Ubah</Link>
                    <TombolAksi aksi={hapusPertanyaan} id={p.id} label="Hapus" bahaya konfirmasi="Hapus pertanyaan ini?" />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <FormPertanyaan key={edit?.id ?? "baru"} surveiId={id} awal={edit} />

          <FormPeriodeBaru key={`pb-${id}`} id={id} tahunSaran={survei.tahun + 1} />

          <section className="card space-y-3 p-5">
            <h3 className="font-semibold">Zona berbahaya</h3>
            <p className="text-sm text-muted-foreground">Tidak bisa dibatalkan. Unduh Excel dulu bila perlu arsip.</p>
            <div className="flex flex-wrap gap-2">
              <TombolAksi
                aksi={hapusSemuaRespon}
                id={id}
                label="Hapus semua jawaban"
                bahaya
                konfirmasi={`Hapus ${jumlahRespon} jawaban? Tindakan ini tidak bisa dibatalkan.`}
              />
              <TombolAksi
                aksi={hapusSurvei}
                id={id}
                label="Hapus kuesioner"
                bahaya
                konfirmasi="Hapus kuesioner ini beserta pertanyaan dan semua jawabannya?"
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}