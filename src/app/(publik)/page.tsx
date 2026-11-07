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
import { ChipPanel } from "@/components/publik/chip-panel";
import { JamWib } from "@/components/publik/jam-wib";
import { KartuSorot } from "@/components/publik/kartu-sorot";
import { LatarHero } from "@/components/publik/latar-hero";
import { Reveal } from "@/components/publik/reveal";
import {
  AgendaHariIni,
  KegiatanTerbaru,
  PengumumanTerbaru,
  SesiBerikutnya,
  Skeleton,
  StatistikLab,
} from "@/components/publik/beranda-data";

const layanan = [
  { judul: "Pengajuan", deskripsi: "Pinjam alat, ruangan, atau ajukan penelitian.", href: "/pengajuan", ikon: ClipboardList },
  { judul: "Jadwal", deskripsi: "Jadwal praktikum dan seminar.", href: "/jadwal", ikon: CalendarDays },
  { judul: "Praktikum", deskripsi: "Modul, pretest, dan postest.", href: "/praktikum", ikon: BookOpen },
  { judul: "Struktur Lab", deskripsi: "Kepala lab, dosen, PLP, dan asisten.", href: "/informasi/struktur", ikon: Users },
  { judul: "Survei Kepuasan", deskripsi: "Bantu kami meningkatkan layanan.", href: "/survei", ikon: MessageSquare },
  { judul: "Dokumentasi", deskripsi: "Foto dan kegiatan laboratorium.", href: "/dokumentasi", ikon: Images },
];

export default function Beranda() {
  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden border-b border-border">
        <LatarHero />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:py-24 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3.5 py-1.5 text-xs font-medium backdrop-blur">
              <i className="h-2 w-2 animate-pulse-dot rounded-full bg-foreground text-foreground" />
              Fakultas Teknik Universitas Lampung
            </span>

            <h1 className="mt-5 text-[clamp(2.4rem,6.2vw,4.25rem)] font-extrabold leading-[1.02] tracking-tighter">
              Laboratorium Teknik Digital
              <span className="outline-text block">Universitas Lampung</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Pusat informasi jadwal praktikum dan seminar, layanan peminjaman alat dan ruangan,
              serta kegiatan laboratorium.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/pengajuan" className="btn btn-primary btn-lg group">
                Ajukan Peminjaman
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/jadwal" className="btn btn-outline btn-lg">
                <CalendarDays className="h-4 w-4" />
                Lihat Jadwal
              </Link>
            </div>
          </div>

          <div className="animate-fade-up [animation-delay:150ms]">
            <ChipPanel className="mx-auto w-full max-w-md lg:ml-auto">
              <JamWib />
              <Suspense fallback={<div className="mt-6 h-24 animate-pulse rounded-xl bg-ink-foreground/10" />}>
                <SesiBerikutnya />
              </Suspense>
            </ChipPanel>
          </div>
        </div>
      </section>

      {/* STATISTIK */}
      <section className="surface-ink">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <Suspense fallback={<div className="h-24" />}>
            <StatistikLab />
          </Suspense>
        </div>
      </section>

      {/* AGENDA + PENGUMUMAN */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:pt-20">
        <div className="grid gap-10 lg:grid-cols-[2fr_1fr] lg:gap-8">
          <Reveal>
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="label-mono">01 / Agenda</p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">Agenda Hari Ini</h2>
              </div>
              <Link
                href="/jadwal"
                className="flex items-center gap-1.5 whitespace-nowrap text-sm text-muted-foreground hover:text-foreground"
              >
                Semua jadwal <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <Suspense fallback={<Skeleton className="h-44" />}>
              <AgendaHariIni />
            </Suspense>
          </Reveal>

          <Reveal delay={120}>
            <div className="mb-6">
              <p className="label-mono">02 / Info</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">Pengumuman</h2>
            </div>
            <Suspense fallback={<Skeleton className="h-44" />}>
              <PengumumanTerbaru />
            </Suspense>
          </Reveal>
        </div>
      </section>

      {/* LAYANAN */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:pt-20">
        <Reveal>
          <div className="mb-6">
            <p className="label-mono">03 / Layanan</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">Layanan dan Informasi</h2>
          </div>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {layanan.map((l, i) => {
            const Ikon = l.ikon;
            const utama = i === 0;
            return (
              <Reveal key={l.href} delay={i * 70}>
                <KartuSorot href={l.href} featured={utama} className="h-full">
                  <div
                    className={
                      utama
                        ? "mb-8 flex h-11 w-11 items-center justify-center rounded-xl border border-ink-foreground/30 bg-ink-foreground/10"
                        : "mb-8 flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-muted"
                    }
                  >
                    <Ikon className="h-5 w-5" />
                  </div>
                  <p className="flex items-center justify-between font-semibold">
                    {l.judul}
                    <ArrowRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                  </p>
                  <p className={utama ? "mt-1.5 text-sm text-ink-muted" : "mt-1.5 text-sm text-muted-foreground"}>
                    {l.deskripsi}
                  </p>
                </KartuSorot>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* KEGIATAN TERBARU */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:pt-20">
        <Reveal>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="label-mono">04 / Dokumentasi</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">Kegiatan Terbaru</h2>
            </div>
            <Link
              href="/dokumentasi"
              className="flex items-center gap-1.5 whitespace-nowrap text-sm text-muted-foreground hover:text-foreground"
            >
              Lihat semua <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <Suspense fallback={<Skeleton className="h-60" />}>
            <KegiatanTerbaru />
          </Suspense>
        </Reveal>
      </section>

      {/* AJAKAN */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:pt-20">
        <Reveal>
          <div className="flex flex-col justify-between gap-6 rounded-3xl border-[1.5px] border-foreground bg-card p-7 shadow-[6px_6px_0_var(--foreground)] sm:flex-row sm:items-center sm:p-11 sm:shadow-[10px_10px_0_var(--foreground)]">
            <div>
              <h2 className="max-w-lg text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
                Butuh meminjam alat atau ruangan?
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
                Isi formulir tanpa perlu login, lalu pantau statusnya dengan kode pengajuan.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/pengajuan" className="btn btn-primary btn-lg">Ajukan Sekarang</Link>
              <Link href="/pengajuan/status" className="btn btn-outline btn-lg">Cek Status</Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}