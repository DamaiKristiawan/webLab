import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight } from "lucide-react";
import { HARI_PIKET, ambilPiket, hariIniWib } from "@/lib/piket";

// Dipakai di beranda; harus berada di dalam <Suspense>.
export async function PiketHariIni() {
  await connection();
  const hari = hariIniWib();
  const info = HARI_PIKET.find((h) => h.no === hari);
  const piket = await ambilPiket();
  const nama = info ? piket[info.no] : [];

  return (
    <div>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="label-mono">Piket</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight">
            {info ? `Piket ${info.nama}` : "Piket Lab"}
          </h2>
        </div>
        <Link
          href="/jadwal/piket"
          className="flex items-center gap-1.5 whitespace-nowrap text-sm text-muted-foreground hover:text-foreground"
        >
          Semua <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {!info ? (
        <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Tidak ada jadwal piket pada akhir pekan.
        </p>
      ) : nama.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Jadwal piket hari ini belum diisi.
        </p>
      ) : (
        <div className="card p-5">
          <ul className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {nama.map((n, i) => (
              <li key={n} className="flex items-center gap-2.5">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-border text-[10px] font-bold text-muted-foreground">
                  {i + 1}
                </span>
                <span className="min-w-0 truncate">{n}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}