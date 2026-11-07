import { Suspense } from "react";
import { connection } from "next/server";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { ambilPengaturan, terisi } from "@/lib/pengaturan";
import { Skeleton } from "@/components/publik/beranda-data";

export const metadata = { title: "Profil Lab" };

const Kosong = () => <p className="text-sm text-muted-foreground">Belum diisi.</p>;

function Blok({ nomor, judul, children }: { nomor: string; judul: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <p className="label-mono">{nomor}</p>
      <h2 className="mt-2 text-2xl font-extrabold tracking-tight">{judul}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

async function Isi() {
  await connection();
  const p = await ambilPengaturan();
  const misi = terisi(p.misi) ? p.misi.split("\n").map((s) => s.trim()).filter(Boolean) : [];

  const kontak = [
    { ikon: MapPin, label: "Alamat", nilai: p.alamat },
    { ikon: Mail, label: "Email", nilai: p.email },
    { ikon: Phone, label: "Telepon", nilai: p.telepon },
    { ikon: Clock, label: "Jam layanan", nilai: p.jam_layanan },
  ];

  return (
    <>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="surface-ink rounded-2xl p-7">
          <p className="label-mono">Visi</p>
          <p className="mt-3 whitespace-pre-line text-lg font-semibold leading-relaxed">
            {terisi(p.visi) ? p.visi : "Belum diisi."}
          </p>
        </div>
        <div className="card p-7">
          <p className="label-mono">Misi</p>
          {misi.length > 0 ? (
            <ol className="mt-3 space-y-2.5">
              {misi.map((m, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-foreground text-[11px] font-bold">
                    {i + 1}
                  </span>
                  {m}
                </li>
              ))}
            </ol>
          ) : (
            <div className="mt-3"><Kosong /></div>
          )}
        </div>
      </div>

      <Blok nomor="01" judul="Sejarah">
        {terisi(p.sejarah) ? (
          <p className="max-w-3xl whitespace-pre-line leading-relaxed text-muted-foreground">{p.sejarah}</p>
        ) : (
          <Kosong />
        )}
      </Blok>

      <Blok nomor="02" judul="Kontak dan Layanan">
        <div className="grid gap-4 sm:grid-cols-2">
          {kontak.map((k) => {
            const Ikon = k.ikon;
            return (
              <div key={k.label} className="card flex gap-4 p-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-muted">
                  <Ikon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="label-mono">{k.label}</p>
                  <p className="mt-1 whitespace-pre-line break-words text-sm">
                    {terisi(k.nilai) ? k.nilai : "Belum diisi."}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Blok>
    </>
  );
}

export default function Profil() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-12 sm:pt-16">
      <p className="label-mono">Informasi</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tighter sm:text-5xl">Profil Laboratorium</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Laboratorium Teknik Digital, Fakultas Teknik, Universitas Lampung.
      </p>
      <Suspense fallback={<Skeleton className="mt-12 h-64" />}>
        <Isi />
      </Suspense>
    </div>
  );
}