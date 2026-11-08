"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, LogIn, Menu as IkonMenu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CariHalaman } from "./cari-halaman";
import { ThemeToggle } from "./theme-toggle";

type Tautan = { label: string; href: string };
type ItemMenu = { label: string; href?: string; children?: Tautan[] };

const daftarMenu: ItemMenu[] = [
  { label: "Beranda", href: "/" },
  {
    label: "Jadwal",
    children: [
      { label: "Jadwal Kegiatan", href: "/jadwal" },
      { label: "Jadwal Piket", href: "/jadwal/piket" },
    ],
  },
  {
    label: "Informasi",
    children: [
      { label: "Profil Lab", href: "/informasi/profil" },
      { label: "Struktur Organisasi", href: "/informasi/struktur" },
    ],
  },
  {
    label: "Pengajuan",
    children: [
      { label: "Peminjaman Alat", href: "/pengajuan/alat" },
      { label: "Peminjaman Ruangan", href: "/pengajuan/ruangan" },
      { label: "Penelitian", href: "/pengajuan/penelitian" },
      { label: "Cek Status", href: "/pengajuan/status" },
    ],
  },
  {
    label: "Lainnya",
    children: [
      { label: "Praktikum", href: "/praktikum" },
      { label: "Survei Kepuasan", href: "/survei" },
      { label: "Dokumentasi", href: "/dokumentasi" },
    ],
  },
];

const kelasTautan =
  "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground";
const kelasAktif =
  "bg-primary font-semibold text-primary-foreground hover:bg-primary hover:text-primary-foreground";

export function Navbar() {
  const pathname = usePathname();
  const [terbuka, setTerbuka] = useState(false);

  const aktif = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  // Dalam satu grup hanya tautan yang paling spesifik yang ditandai aktif
  // (mis. di /jadwal/piket hanya "Jadwal Piket", bukan "Jadwal Kegiatan").
  const anakAktif = (m: ItemMenu) =>
    m.children
      ?.filter((c) => aktif(c.href))
      .sort((a, b) => b.href.length - a.href.length)[0]?.href;
  const tutup = () => setTerbuka(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4">
        <Link href="/" onClick={tutup} className="flex shrink-0 items-center gap-3">
          <Image
            src="/logo-ltd.png"
            alt="Logo Laboratorium Teknik Digital"
            width={44}
            height={44}
            priority
            className="logo-img h-11 w-11"
          />
          <span className="leading-tight">
            <span className="block text-[13px] font-extrabold uppercase tracking-tight">Laboratorium</span>
            <span className="block text-[13px] font-extrabold uppercase tracking-tight">Teknik Digital</span>
            <span className="block text-xs text-muted-foreground">Universitas Lampung</span>
          </span>
        </Link>

        {/* Menu desktop */}
        <nav className="hidden items-center gap-1 xl:flex" aria-label="Menu utama">
          {daftarMenu.map((m) =>
            m.children ? (
              <div key={m.label} className="group relative">
                <button
                  type="button"
                  className={cn(kelasTautan, anakAktif(m) && kelasAktif)}
                  aria-haspopup="menu"
                >
                  {m.label}
                  <ChevronDown className="h-4 w-4" />
                </button>
                <div className="invisible absolute left-0 top-full min-w-56 pt-2 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  <div className="rounded-xl border border-border bg-card p-1 shadow-lg">
                    {m.children.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        className={cn(
                          "block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground",
                          anakAktif(m) === c.href && "bg-muted font-semibold text-foreground",
                        )}
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={m.href}
                href={m.href!}
                className={cn(kelasTautan, aktif(m.href!) && kelasAktif)}
              >
                {m.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          <CariHalaman className="hidden w-44 xl:block 2xl:w-60" />
          <ThemeToggle className="rounded-full" />
          <Link
            href="/admin/login"
            className="btn hidden h-10 rounded-full bg-foreground px-5 text-background hover:opacity-90 sm:inline-flex"
          >
            <LogIn className="h-4 w-4" />
            Masuk
          </Link>
          <button
            type="button"
            onClick={() => setTerbuka((v) => !v)}
            aria-label={terbuka ? "Tutup menu" : "Buka menu"}
            aria-expanded={terbuka}
            className="btn btn-outline h-10 w-10 rounded-full px-0 xl:hidden"
          >
            {terbuka ? <X className="h-4 w-4" /> : <IkonMenu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {terbuka && (
        <nav
          className="max-h-[calc(100vh-72px)] overflow-y-auto border-t border-border bg-background xl:hidden"
          aria-label="Menu seluler"
        >
          <div className="mx-auto max-w-7xl space-y-1 px-4 py-3">
            <CariHalaman onPilih={tutup} className="pb-2" />
            {daftarMenu.map((m) =>
              m.children ? (
                <div key={m.label} className="pb-1">
                  <p className="label-mono px-3 py-2">{m.label}</p>
                  {m.children.map((c) => (
                    <Link
                      key={c.href}
                      href={c.href}
                      onClick={tutup}
                      className={cn(kelasTautan, "w-full", anakAktif(m) === c.href && kelasAktif)}
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={m.href}
                  href={m.href!}
                  onClick={tutup}
                  className={cn(kelasTautan, "w-full", aktif(m.href!) && kelasAktif)}
                >
                  {m.label}
                </Link>
              ),
            )}
            <Link
              href="/admin/login"
              onClick={tutup}
              className="btn mt-2 h-11 w-full rounded-full bg-foreground text-background hover:opacity-90"
            >
              <LogIn className="h-4 w-4" />
              Masuk Staf
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}