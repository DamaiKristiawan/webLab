import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ClipboardList,
  Images,
  MessageSquare,
  Users,
} from "lucide-react";
import { LatarHero } from "@/components/publik/latar-hero";
import { JamWib } from "@/components/publik/jam-wib";
import { Reveal } from "@/components/publik/reveal";
import { KartuSorot } from "@/components/publik/kartu-sorot";
import {
  AgendaHariIni,
  KegiatanTerbaru,
  PengumumanTerbaru,
  SesiBerikutnya,
  Skeleton,
} from "@/components/publik/beranda-data";

const layanan = [
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
      {/* HERO */}
      <section className="relative isolate overflow-hidden border-b border-border">
        <LatarHero />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:py-24 lg:grid-cols-[1.2fr_1fr]">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-foreground text-foreground" />
              Fakultas Teknik Universitas Lampung
            </span>

            <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              Laboratorium Teknik Digital
              <span className="mt-2 block bg-gradient-to-r from-foreground to-foreground/40 bg-clip-text text-transparent">
                Universitas Lampung
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Pusat informasi jadwal praktikum dan seminar, layanan peminjaman alat dan ruangan,
              serta kegiatan laboratorium.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/pengajuan"
                className="btn btn-primary group h-12 px-6 text-base shadow-lg shadow-foreground/20"
              >
                Ajukan Peminjaman
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/jadwal" className="btn btn-outline h-12 bg-background/60 px-6 text-base backdrop-blur">
                <CalendarDays className="h-4 w-4" />
                Lihat Jadwal
              </Link>
            </div>
          </div>

          <div className="animate-fade-up space-y-4 [animation-delay:150ms]">
            <JamWib />
            <Suspense fallback={<Skeleton className="h-32" />}>
              <SesiBerikutnya />
            </Suspense>
          </div>
        </div>
      </section>

      {/* AGENDA + PENGUMUMAN */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-8 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Agenda Hari Ini</h2>
              <Link href="/jadwal" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                Semua jadwal <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <Suspense fallback={<Skeleton className="h-40" />}>
              <AgendaHariIni />
            </Suspense>
          </Reveal>

          <Reveal delay={120}>
            <h2 className="mb-4 text-xl font-semibold">Pengumuman</h2>
            <Suspense fallback={<Skeleton className="h-40" />}>
              <PengumumanTerbaru />
            </Suspense>
          </Reveal>
        </div>
      </section>

      {/* LAYANAN */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <Reveal>
          <h2 className="mb-1 text-xl font-semibold">Layanan dan Informasi</h2>
          <p className="mb-6 text-sm text-muted-foreground">Semua yang kamu perlukan dari laboratorium.</p>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {layanan.map((l, i) => {
            const Ikon = l.ikon;
            return (
              <Reveal key={l.href} delay={i * 70}>
                <KartuSorot href={l.href} className="h-full">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted">
                    <Ikon className="h-5 w-5" />
                  </div>
                  <p className="flex items-center justify-between font-semibold">
                    {l.judul}
                    <ArrowRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{l.deskripsi}</p>
                </KartuSorot>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* KEGIATAN TERBARU */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <Reveal>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-semibold">Kegiatan Terbaru</h2>
              <p className="text-sm text-muted-foreground">Dokumentasi praktikum, seminar, dan kegiatan lab.</p>
            </div>
            <Link href="/dokumentasi" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              Lihat semua <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <Suspense fallback={<Skeleton className="h-56" />}>
            <KegiatanTerbaru />
          </Suspense>
        </Reveal>
      </section>

      {/* AJAKAN */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-10 text-primary-foreground sm:px-12">
            <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">Butuh meminjam alat atau ruangan?</h2>
                <p className="mt-1 max-w-xl text-sm opacity-80">
                  Isi formulir pengajuan tanpa perlu login, lalu pantau statusnya dengan kode pengajuan.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/pengajuan" className="btn bg-background text-foreground hover:opacity-90">
                  Ajukan Sekarang
                </Link>
                <Link href="/pengajuan/status" className="btn border border-primary-foreground/30 hover:bg-primary-foreground/10">
                  Cek Status
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}