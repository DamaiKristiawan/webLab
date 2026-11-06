import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-ltd.png"
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 dark:invert"
            />
            <p className="text-sm font-semibold">Laboratorium Teknik Digital</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Fakultas Teknik, Universitas Lampung, Bandar Lampung.
          </p>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold">Layanan</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/pengajuan/alat" className="hover:text-foreground">Peminjaman Alat</Link></li>
            <li><Link href="/pengajuan/ruangan" className="hover:text-foreground">Peminjaman Ruangan</Link></li>
            <li><Link href="/pengajuan/penelitian" className="hover:text-foreground">Penelitian</Link></li>
            <li><Link href="/pengajuan/status" className="hover:text-foreground">Cek Status Pengajuan</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold">Informasi</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/jadwal" className="hover:text-foreground">Jadwal</Link></li>
            <li><Link href="/praktikum" className="hover:text-foreground">Praktikum</Link></li>
            <li><Link href="/survei" className="hover:text-foreground">Survei Kepuasan</Link></li>
            <li><Link href="/admin/login" className="hover:text-foreground">Login Staf</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © Laboratorium Teknik Digital, Universitas Lampung.
      </div>
    </footer>
  );
}