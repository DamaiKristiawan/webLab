import { DoorOpen, FlaskConical, Package, Search } from "lucide-react";
import { KartuSorot } from "@/components/publik/kartu-sorot";
import { Reveal } from "@/components/publik/reveal";

export const metadata = { title: "Pengajuan" };

const pilihan = [
  { judul: "Peminjaman Alat", deskripsi: "Pinjam alat untuk praktikum atau kegiatan.", href: "/pengajuan/alat", ikon: Package },
  { judul: "Peminjaman Ruangan", deskripsi: "Gunakan ruangan pada waktu tertentu.", href: "/pengajuan/ruangan", ikon: DoorOpen },
  { judul: "Penelitian", deskripsi: "Penelitian atau tugas akhir di laboratorium.", href: "/pengajuan/penelitian", ikon: FlaskConical },
  { judul: "Cek Status", deskripsi: "Pantau pengajuan dengan kode Anda.", href: "/pengajuan/status", ikon: Search },
];

const alur = [
  "Pilih jenis pengajuan dan isi formulir.",
  "Simpan kode pengajuan yang muncul setelah mengirim.",
  "Admin lab meninjau pengajuan Anda.",
  "Pantau keputusannya di halaman Cek Status.",
];

export default function HalamanPengajuan() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-12 sm:pt-16">
      <p className="label-mono">Layanan</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tighter sm:text-5xl">Pengajuan</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Ajukan peminjaman alat, ruangan, atau penelitian tanpa perlu login. Semua pengajuan dilacak
        dengan kode.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {pilihan.map((p, i) => {
          const Ikon = p.ikon;
          return (
            <Reveal key={p.href} delay={i * 70}>
              <KartuSorot href={p.href} featured={i === 0} className="h-full">
                <div
                  className={
                    i === 0
                      ? "mb-8 flex h-11 w-11 items-center justify-center rounded-xl border border-ink-foreground/30 bg-ink-foreground/10"
                      : "mb-8 flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-muted"
                  }
                >
                  <Ikon className="h-5 w-5" />
                </div>
                <p className="font-semibold">{p.judul}</p>
                <p className={i === 0 ? "mt-1.5 text-sm text-ink-muted" : "mt-1.5 text-sm text-muted-foreground"}>
                  {p.deskripsi}
                </p>
              </KartuSorot>
            </Reveal>
          );
        })}
      </div>

      <section className="mt-14">
        <p className="label-mono">Alur</p>
        <ol className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {alur.map((a, i) => (
            <li key={a} className="card flex gap-3 p-5 text-sm">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-foreground text-xs font-bold">
                {i + 1}
              </span>
              {a}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}