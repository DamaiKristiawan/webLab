import { Suspense } from "react";
import { connection } from "next/server";
import { Skeleton } from "@/components/publik/beranda-data";
import { HARI_PIKET, ambilPiket, hariIniWib } from "@/lib/piket";
import { cn } from "@/lib/utils";

export const metadata = { title: "Jadwal Piket" };

async function Isi() {
  await connection();
  const piket = await ambilPiket();
  const hari = hariIniWib();
  const akhirPekan = hari === 0 || hari === 6;
  const kosong = HARI_PIKET.every((h) => piket[h.no].length === 0);

  if (kosong) {
    return (
      <p className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        Jadwal piket belum diisi.
      </p>
    );
  }

  return (
    <>
      {akhirPekan && (
        <p className="mt-8 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
          Hari ini akhir pekan, tidak ada piket.
        </p>
      )}
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {HARI_PIKET.map((h) => {
          const hariIni = h.no === hari;
          const nama = piket[h.no];
          return (
            <section
              key={h.no}
              className={cn(
                "card p-5",
                hariIni && "surface-ink border-ink shadow-[0_24px_44px_-24px_color-mix(in_srgb,var(--foreground)_70%,transparent)]",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-extrabold tracking-tight">{h.nama}</h2>
                {hariIni ? (
                  <span className="inline-flex items-center gap-2 text-xs font-bold tracking-wide">
                    <i className="h-2 w-2 animate-pulse-dot rounded-full bg-current" />
                    HARI INI
                  </span>
                ) : (
                  <span className="label-mono">{nama.length} orang</span>
                )}
              </div>
              {nama.length === 0 ? (
                <p className={cn("mt-4 text-sm", hariIni ? "text-ink-muted" : "text-muted-foreground")}>
                  Belum diisi.
                </p>
              ) : (
                <ol className="mt-4 space-y-2 text-sm">
                  {nama.map((n, i) => (
                    <li key={n} className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          "grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px] font-bold",
                          hariIni ? "border-ink-foreground/40" : "border-border text-muted-foreground",
                        )}
                      >
                        {i + 1}
                      </span>
                      <span className="min-w-0 break-words">{n}</span>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}

export default function HalamanPiket() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-12 sm:pt-16">
      <p className="label-mono">Jadwal</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tighter sm:text-5xl">Jadwal Piket</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Daftar petugas piket Laboratorium Teknik Digital, Senin sampai Jumat.
      </p>
      <Suspense fallback={<Skeleton className="mt-10 h-96" />}>
        <Isi />
      </Suspense>
    </div>
  );
}