import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="surface-ink mt-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-ltd.png"
              alt=""
              width={40}
              height={40}
              className="logo-img h-10 w-10"
            />
            <p className="text-sm font-semibold">Laboratorium Teknik Digital</p>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-muted">
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

      <div className="border-t border-ink-border/40">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-ink-muted">
          © Laboratorium Teknik Digital, Universitas Lampung.
        </p>
      </div>
    </footer>
  );
}