import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  Images,
  MessageSquare,
  Users,
} from "lucide-react";

const pintasan = [
  { judul: "Jadwal", deskripsi: "Jadwal praktikum dan seminar.", href: "/jadwal", ikon: CalendarDays },
  { judul: "Pengajuan", deskripsi: "Pinjam alat, ruangan, atau ajukan penelitian.", href: "/pengajuan", ikon: ClipboardList },
  { judul: "Praktikum", deskripsi: "Modul, pretest, dan postest.", href: "/praktikum", ikon: BookOpen },
  { judul: "Struktur Lab", deskripsi: "Kepala lab, PLP, dan asisten.", href: "/informasi/struktur", ikon: Users },
  { judul: "Survei Kepuasan", deskripsi: "Bantu kami meningkatkan layanan.", href: "/survei", ikon: MessageSquare },
  { judul: "Dokumentasi", deskripsi: "Foto dan kegiatan laboratorium.", href: "/dokumentasi", ikon: Images },
];

export default function Beranda() {
  return (
    <>
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Universitas Lampung
          </p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Laboratorium Teknik Digital
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Pusat informasi jadwal praktikum dan seminar, layanan peminjaman alat dan ruangan,
            serta kegiatan laboratorium.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/jadwal" className="btn btn-primary">Lihat Jadwal</Link>
            <Link href="/pengajuan" className="btn btn-outline">Ajukan Peminjaman</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-6 text-xl font-semibold">Agenda Hari Ini</h2>
        <div className="card p-6 text-sm text-muted-foreground">
          Agenda otomatis dari data jadwal akan tampil di sini (tahap berikutnya).
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="mb-6 text-xl font-semibold">Layanan dan Informasi</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pintasan.map((p) => {
            const Ikon = p.ikon;
            return (
              <Link
                key={p.href}
                href={p.href}
                className="card group p-5 transition-colors hover:bg-muted"
              >
                <Ikon className="mb-3 h-5 w-5" />
                <p className="font-semibold">{p.judul}</p>
                <p className="mt-1 text-sm text-muted-foreground">{p.deskripsi}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}