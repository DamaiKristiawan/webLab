import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRight,
  CalendarDays,
  ClipboardCheck,
  Cpu,
  DoorOpen,
  FlaskConical,
  GraduationCap,
  Images,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { LatarFoto } from "@/components/publik/latar-foto";
import { PiketHariIni } from "@/components/publik/piket-hari-ini";
import { Reveal } from "@/components/publik/reveal";
import { KegiatanTerbaru, Skeleton } from "@/components/publik/beranda-data";
import {
  AgendaMendatang,
  PengumumanKartu,
  StatistikHero,
  TentangKartu,
} from "@/components/publik/beranda-kartu";

const akses = [
  { label: "Jadwal Kegiatan", href: "/jadwal", ikon: CalendarDays },
  { label: "Jadwal Piket", href: "/jadwal/piket", ikon: ClipboardCheck },
  { label: "Peminjaman Alat", href: "/pengajuan/alat", ikon: Cpu },
  { label: "Peminjaman Ruangan", href: "/pengajuan/ruangan", ikon: DoorOpen },
  { label: "Penelitian", href: "/pengajuan/penelitian", ikon: FlaskConical },
  { label: "Cek Status", href: "/pengajuan/status", ikon: ShieldCheck },
  { label: "Praktikum", href: "/praktikum", ikon: GraduationCap },
  { label: "Survei", href: "/survei", ikon: MessageSquare },
  { label: "Dokumentasi", href: "/dokumentasi", ikon: Images },
];

export default function Beranda() {
  return (
    <>
      {/* HERO */}
      <section className="hero-lab relative isolate overflow-hidden text-white">
        <LatarFoto />
        <div className="grid-ink absolute inset-0 -z-10 opacity-40" aria-hidden />
        <div className="mx-auto flex min-h-[460px] max-w-7xl flex-col justify-center px-4 py-14 sm:min-h-[520px] sm:py-20">
          <div className="max-w-2xl animate-fade-up">
            <span className="glass inline-flex rounded-full px-4 py-1.5 text-sm font-medium">
              Selamat Datang di
            </span>
            <h1 className="mt-5 text-[clamp(2.5rem,6.4vw,4.5rem)] font-extrabold leading-[1.02] tracking-tight">
              Laboratorium
              <span className="block text-sorot">Teknik Digital</span>
            </h1>
            <p className="mt-3 text-xl font-bold sm:text-2xl">Universitas Lampung</p>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-white/80">
              Pusat pembelajaran, penelitian, dan inovasi di bidang teknologi digital.
            </p>
            <Link
              href="/informasi/profil"
              className="btn btn-lg group mt-7 bg-[#2f6bff] text-white shadow-[0_14px_30px_-12px_rgba(47,107,255,0.8)] hover:bg-[#4f82ff]"
            >
              Jelajahi Laboratorium
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Suspense fallback={<div className="mt-8 h-16" />}>
              <StatistikHero />
            </Suspense>
          </div>
        </div>
      </section>

      {/* AKSES CEPAT */}
      <section className="mx-auto max-w-7xl px-4 pt-10">
        <div className="grid gap-6 xl:grid-cols-[170px_1fr] xl:items-center">
          <div>
            <span className="block h-0.5 w-10 bg-primary" />
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight">Akses Cepat</h2>
            <p className="mt-1 text-sm text-muted-foreground">Fitur utama yang dapat Anda gunakan</p>
          </div>
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5 xl:grid-cols-9">
            {akses.map((a) => {
              const Ikon = a.ikon;
              return (
                <li key={a.href}>
                  <Link
                    href={a.href}
                    className="card group flex h-full flex-col items-center justify-center gap-2.5 px-2 py-4 text-center text-xs font-semibold leading-tight transition-all duration-300 hover:-translate-y-1 hover:border-primary"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Ikon className="h-5 w-5" />
                    </span>
                    {a.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* PENGUMUMAN + TENTANG + AGENDA */}
      <section className="mx-auto max-w-7xl px-4 pt-10">
        <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr_1fr]">
          <Reveal>
            <Suspense fallback={<Skeleton className="h-80" />}>
              <PengumumanKartu />
            </Suspense>
          </Reveal>
          <Reveal delay={100}>
            <Suspense fallback={<Skeleton className="h-80" />}>
              <TentangKartu />
            </Suspense>
          </Reveal>
          <Reveal delay={200}>
            <Suspense fallback={<Skeleton className="h-80" />}>
              <AgendaMendatang />
            </Suspense>
          </Reveal>
        </div>
      </section>

      {/* KEGIATAN TERBARU */}
      <section className="mx-auto max-w-7xl px-4 pt-14">
        <Reveal>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <span className="block h-0.5 w-10 bg-primary" />
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight">Kegiatan Terbaru</h2>
            </div>
            <Link
              href="/dokumentasi"
              className="flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-primary hover:underline"
            >
              Lihat semua <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <Suspense fallback={<Skeleton className="h-60" />}>
            <KegiatanTerbaru />
          </Suspense>
        </Reveal>
      </section>

      {/* PIKET + AJAKAN */}
      <section className="mx-auto max-w-7xl px-4 pt-14">
        <div className="grid items-stretch gap-5 lg:grid-cols-2">
          <Reveal>
            <Suspense fallback={<Skeleton className="h-48" />}>
              <PiketHariIni />
            </Suspense>
          </Reveal>
          <Reveal delay={120}>
            <div className="surface-ink flex h-full flex-col justify-between gap-6 rounded-2xl p-7 sm:p-9">
              <div>
                <h2 className="max-w-md text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
                  Butuh meminjam alat atau ruangan?
                </h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
                  Isi formulir tanpa perlu login, lalu pantau statusnya dengan kode pengajuan.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/pengajuan"
                  className="btn btn-lg bg-white text-[#0b2a6f] hover:bg-white/90"
                >
                  Ajukan Sekarang
                </Link>
                <Link
                  href="/pengajuan/status"
                  className="btn btn-lg border border-white/40 text-white hover:bg-white/10"
                >
                  Cek Status
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}