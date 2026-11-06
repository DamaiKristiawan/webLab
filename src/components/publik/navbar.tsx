"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, Menu as IkonMenu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

type Tautan = { label: string; href: string };
type ItemMenu = { label: string; href?: string; children?: Tautan[] };

const daftarMenu: ItemMenu[] = [
  { label: "Beranda", href: "/" },
  { label: "Jadwal", href: "/jadwal" },
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
  { label: "Praktikum", href: "/praktikum" },
  { label: "Survei", href: "/survei" },
  { label: "Dokumentasi", href: "/dokumentasi" },
];

const kelasTautan =
  "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";
const kelasAktif = "bg-muted text-foreground";

export function Navbar() {
  const pathname = usePathname();
  const [terbuka, setTerbuka] = useState(false);

  const aktif = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const grupAktif = (m: ItemMenu) => m.children?.some((c) => aktif(c.href)) ?? false;
  const tutup = () => setTerbuka(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" onClick={tutup} className="flex items-center gap-3">
          <Image
            src="/logo-ltd.png"
            alt="Logo Laboratorium Teknik Digital"
            width={40}
            height={40}
            priority
            className="h-10 w-10 dark:invert"
          />
          <span className="leading-tight">
            <span className="block text-sm font-semibold">Lab Teknik Digital</span>
            <span className="block text-xs text-muted-foreground">Universitas Lampung</span>
          </span>
        </Link>

        {/* Menu desktop */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Menu utama">
          {daftarMenu.map((m) =>
            m.children ? (
              <div key={m.label} className="group relative">
                <button
                  type="button"
                  className={cn(kelasTautan, grupAktif(m) && kelasAktif)}
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
                          aktif(c.href) && kelasAktif,
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
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setTerbuka((v) => !v)}
            aria-label={terbuka ? "Tutup menu" : "Buka menu"}
            aria-expanded={terbuka}
            className="btn btn-outline h-9 w-9 px-0 lg:hidden"
          >
            {terbuka ? <X className="h-4 w-4" /> : <IkonMenu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {terbuka && (
        <nav className="border-t border-border bg-background lg:hidden" aria-label="Menu seluler">
          <div className="mx-auto max-w-6xl space-y-1 px-4 py-3">
            {daftarMenu.map((m) =>
              m.children ? (
                <div key={m.label} className="pb-1">
                  <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {m.label}
                  </p>
                  {m.children.map((c) => (
                    <Link
                      key={c.href}
                      href={c.href}
                      onClick={tutup}
                      className={cn(kelasTautan, "w-full", aktif(c.href) && kelasAktif)}
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
          </div>
        </nav>
      )}
    </header>
  );
}