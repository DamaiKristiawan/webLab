import Link from "next/link";
import type { DataGrafik, KuesionerGrafik } from "@/lib/grafik-survei";

const PALET = ["#2f6bff", "#f59e0b", "#10b981", "#a855f7", "#ef4444", "#06b6d4"];
const TITIK = [0, 1, 2, 3, 4, 5];
const TINGGI_BATANG = 14;
const JARAK = 4;
const TEPI = 14;

const LATAR_X = {
  backgroundImage: "linear-gradient(to right, var(--border) 1px, transparent 1px)",
  backgroundSize: "20% 100%",
};

const fmt = (n: number) => n.toLocaleString("id-ID", { maximumFractionDigits: 2 });
const singkat = (nama: string) => nama.split(/\s+atau\s+/i)[0];
const namaPendek = (judul: string) => judul.replace(/^kuesioner\s+/i, "");

export function GrafikGabungan({ data, tahun }: { data: DataGrafik; tahun: number }) {
  const n = data.kuesioner.length;
  const tinggiBaris = n * TINGGI_BATANG + Math.max(0, n - 1) * JARAK + TEPI * 2;
  const ada = data.kuesioner.some((k) => k.nilai.some((v) => v !== null));

  return (
    <section className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">Perbandingan semua kuesioner {tahun}</h2>
          <p className="text-sm text-muted-foreground">Rata-rata skala 1-5 per dimensi.</p>
        </div>
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
          {data.kuesioner.map((k, i) => (
            <li key={k.id} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: PALET[i % PALET.length] }} />
              {namaPendek(k.judul)}
            </li>
          ))}
        </ul>
      </div>

      {!ada ? (
        <p className="mt-8 text-center text-sm text-muted-foreground">Belum ada jawaban yang bisa digambarkan.</p>
      ) : (
        <div className="mt-6 grid grid-cols-[7rem_1fr] gap-x-3 sm:grid-cols-[10rem_1fr]">
          <div>
            {data.dimensi.map((d, di) => (
              <div
                key={d}
                className="flex items-center text-sm font-medium leading-snug"
                style={{ height: tinggiBaris, boxShadow: di > 0 ? "inset 0 1px 0 var(--border)" : undefined }}
              >
                {d}
              </div>
            ))}
          </div>

          <div className="relative mr-10" style={{ ...LATAR_X, borderRight: "1px solid var(--border)" }}>
            {data.dimensi.map((d, di) => (
              <div
                key={d}
                style={{
                  height: tinggiBaris,
                  padding: `${TEPI}px 0`,
                  display: "flex",
                  flexDirection: "column",
                  gap: JARAK,
                  boxShadow: di > 0 ? "inset 0 1px 0 var(--border)" : undefined,
                }}
              >
                {data.kuesioner.map((k, i) => {
                  const v = k.nilai[di];
                  const persen = ((v ?? 0) / 5) * 100;
                  return (
                    <div key={k.id} className="relative" style={{ height: TINGGI_BATANG, flexShrink: 0 }}>
                      {v !== null && (
                        <div
                          style={{
                            width: `${persen}%`,
                            height: "100%",
                            backgroundColor: PALET[i % PALET.length],
                            borderRadius: "0 3px 3px 0",
                          }}
                        />
                      )}
                      <span
                        className="absolute top-1/2 whitespace-nowrap pl-1.5 text-xs tabular-nums"
                        style={{ left: `${persen}%`, transform: "translateY(-50%)" }}
                      >
                        {v === null ? "-" : fmt(v)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div />
          <div className="relative mr-10 h-6">
            {TITIK.map((t) => (
              <span
                key={t}
                className="absolute top-1.5 text-xs tabular-nums text-muted-foreground"
                style={{ left: `${t * 20}%`, transform: "translateX(-50%)" }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export function GrafikKuesioner({
  data,
  kuesioner,
  index,
}: {
  data: DataGrafik;
  kuesioner: KuesionerGrafik;
  index: number;
}) {
  const warna = PALET[index % PALET.length];
  const W = 420;
  const H = 230;
  const kiri = 30;
  const kanan = 10;
  const atas = 18;
  const bawah = 38;
  const pw = W - kiri - kanan;
  const ph = H - atas - bawah;
  const jumlah = Math.max(1, data.dimensi.length);
  const gw = pw / jumlah;
  const bw = Math.min(44, gw * 0.55);
  const y = (v: number) => atas + (1 - v / 5) * ph;
  const ada = kuesioner.nilai.some((v) => v !== null);

  return (
    <section className="card p-5">
      <h3 className="flex items-center gap-2 font-semibold">
        <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: warna }} />
        <Link href={`/admin/survei/${kuesioner.id}`} className="hover:underline">
          {namaPendek(kuesioner.judul)}
        </Link>
      </h3>
      <p className="label-mono mt-1">{kuesioner.jumlahRespon.toLocaleString("id-ID")} responden</p>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Rata-rata per dimensi: ${namaPendek(kuesioner.judul)}`}
        className="mt-4 h-auto w-full"
      >
        {TITIK.map((t) => (
          <g key={t}>
            <line x1={kiri} x2={W - kanan} y1={y(t)} y2={y(t)} strokeWidth={1} style={{ stroke: "var(--border)" }} />
            <text x={kiri - 6} y={y(t) + 3.5} textAnchor="end" fontSize="10" style={{ fill: "var(--muted-foreground)" }}>
              {t}
            </text>
          </g>
        ))}
        {data.dimensi.map((d, i) => {
          const v = kuesioner.nilai[i];
          const x = kiri + i * gw + (gw - bw) / 2;
          const tengah = kiri + i * gw + gw / 2;
          return (
            <g key={d}>
              <title>{d}</title>
              {v !== null && v > 0 && (
                <rect x={x} y={y(v)} width={bw} height={y(0) - y(v)} rx={3} style={{ fill: warna }} />
              )}
              <text
                x={tengah}
                y={(v === null ? y(0) : y(v)) - 5}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                style={{ fill: "var(--foreground)" }}
              >
                {v === null ? "-" : fmt(v)}
              </text>
              <text
                x={tengah}
                y={H - bawah + 16}
                textAnchor="middle"
                fontSize="10"
                style={{ fill: "var(--muted-foreground)" }}
              >
                {singkat(d)}
              </text>
            </g>
          );
        })}
      </svg>

      {!ada && <p className="mt-2 text-center text-sm text-muted-foreground">Belum ada jawaban.</p>}
    </section>
  );
}