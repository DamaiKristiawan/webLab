import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="surface-ink relative mt-20 overflow-hidden">
      <div className="grid-ink absolute inset-0 opacity-60" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4">
        {/* Pita identitas */}
        <div className="flex flex-col gap-5 border-b border-ink-border/40 py-8 sm:flex-row sm:items-center sm:gap-8">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-ltd.png"
              alt=""
              width={48}
              height={48}
              className="logo-img h-12 w-12"
            />
            <p className="leading-tight">
              <span className="block text-sm font-extrabold uppercase tracking-tight">Laboratorium</span>
              <span className="block text-sm font-extrabold uppercase tracking-tight">Teknik Digital</span>
              <span className="block text-xs text-ink-muted">Universitas Lampung</span>
            </p>
          </div>
          <span className="hidden h-12 w-px bg-ink-border/50 sm:block" aria-hidden />
          <p className="text-base italic text-ink-foreground/90">
            &ldquo;Berkarya, Berinovasi, untuk Masa Depan Digital&rdquo;
          </p>
        </div>

        {/* Tautan */}
        <div className="grid gap-10 py-10 sm:grid-cols-3">
          <div>
            <p className="label-mono mb-4">Lokasi</p>
            <p className="max-w-xs text-sm leading-relaxed text-ink-muted">
              Fakultas Teknik, Universitas Lampung, Bandar Lampung.
            </p>
          </div>

          <div>
            <p className="label-mono mb-4">Layanan</p>
            <ul className="space-y-2.5 text-sm text-ink-muted">
              <li><Link href="/pengajuan/alat" className="hover:text-ink-foreground">Peminjaman Alat</Link></li>
              <li><Link href="/pengajuan/ruangan" className="hover:text-ink-foreground">Peminjaman Ruangan</Link></li>
              <li><Link href="/pengajuan/penelitian" className="hover:text-ink-foreground">Penelitian</Link></li>
              <li><Link href="/pengajuan/status" className="hover:text-ink-foreground">Cek Status Pengajuan</Link></li>
            </ul>
          </div>

          <div>
            <p className="label-mono mb-4">Informasi</p>
            <ul className="space-y-2.5 text-sm text-ink-muted">
              <li><Link href="/jadwal" className="hover:text-ink-foreground">Jadwal</Link></li>
              <li><Link href="/praktikum" className="hover:text-ink-foreground">Praktikum</Link></li>
              <li><Link href="/survei" className="hover:text-ink-foreground">Survei Kepuasan</Link></li>
              <li><Link href="/admin/login" className="hover:text-ink-foreground">Login Staf</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="relative border-t border-ink-border/40">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-ink-muted">
          © Laboratorium Teknik Digital, Universitas Lampung.
        </p>
      </div>
    </footer>
  );
}