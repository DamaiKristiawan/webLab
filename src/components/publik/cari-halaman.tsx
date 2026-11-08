"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

const halaman = [
  { label: "Beranda", href: "/", kata: "utama home" },
  { label: "Jadwal Kegiatan", href: "/jadwal", kata: "agenda praktikum seminar kalender" },
  { label: "Jadwal Piket", href: "/jadwal/piket", kata: "piket asisten senin jumat" },
  { label: "Profil Lab", href: "/informasi/profil", kata: "visi misi sejarah alamat kontak" },
  { label: "Struktur Organisasi", href: "/informasi/struktur", kata: "kepala lab dosen plp asisten anggota" },
  { label: "Pengajuan", href: "/pengajuan", kata: "pinjam peminjaman layanan" },
  { label: "Peminjaman Alat", href: "/pengajuan/alat", kata: "pinjam alat perangkat" },
  { label: "Peminjaman Ruangan", href: "/pengajuan/ruangan", kata: "pinjam ruang lab seminar" },
  { label: "Penelitian", href: "/pengajuan/penelitian", kata: "riset skripsi tugas akhir" },
  { label: "Cek Status", href: "/pengajuan/status", kata: "kode pelacakan pengajuan status" },
  { label: "Praktikum", href: "/praktikum", kata: "modul pretest postest tes" },
  { label: "Survei Kepuasan", href: "/survei", kata: "kuesioner masukan saran" },
  { label: "Dokumentasi", href: "/dokumentasi", kata: "foto galeri kegiatan" },
  { label: "Masuk Staf", href: "/admin/login", kata: "login admin asisten" },
];

export function CariHalaman({ className, onPilih }: { className?: string; onPilih?: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [buka, setBuka] = useState(false);

  const hasil = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return [];
    return halaman.filter((h) => `${h.label} ${h.kata}`.toLowerCase().includes(k)).slice(0, 6);
  }, [q]);

  function selesai() {
    setQ("");
    setBuka(false);
    onPilih?.();
  }

  return (
    <div
      className={cn("relative", className)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setBuka(false);
      }}
    >
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (hasil[0]) {
            const tujuan = hasil[0].href;
            selesai();
            router.push(tujuan);
          }
        }}
        className="relative"
      >
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setBuka(true);
          }}
          onFocus={() => setBuka(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setBuka(false);
          }}
          placeholder="Cari informasi..."
          aria-label="Cari halaman"
          autoComplete="off"
          className="h-10 w-full rounded-full border border-border bg-card pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:border-primary"
        />
      </form>

      {buka && q.trim() && (
        <ul className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border bg-card p-1 shadow-lg">
          {hasil.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">Tidak ditemukan.</li>
          ) : (
            hasil.map((h) => (
              <li key={h.href}>
                <Link
                  href={h.href}
                  onClick={selesai}
                  className="block rounded-lg px-3 py-2 text-sm hover:bg-muted"
                >
                  {h.label}
                </Link>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}