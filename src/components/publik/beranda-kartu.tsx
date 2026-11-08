import Link from "next/link";
import { connection } from "next/server";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ClipboardList,
  Cpu,
  FlaskConical,
  Landmark,
  Megaphone,
  Users,
  type LucideIcon,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ambilPengaturan, terisi } from "@/lib/pengaturan";
import { formatJam } from "@/lib/waktu";

// Semua komponen di sini harus berada di dalam <Suspense>.

function Tgl({ d }: { d: Date }) {
  const hari = new Intl.DateTimeFormat("id-ID", { day: "2-digit", timeZone: "Asia/Jakarta" }).format(d);
  const bulan = new Intl.DateTimeFormat("id-ID", { month: "short", timeZone: "Asia/Jakarta" })
    .format(d)
    .replace(".", "");
  return (
    <div className="w-12 shrink-0 rounded-lg bg-muted py-1.5 text-center">
      <p className="text-lg font-extrabold leading-none text-primary">{hari}</p>
      <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">{bulan}</p>
    </div>
  );
}

function KartuBagian({
  judul,
  ikon: Ikon,
  href,
  hrefLabel,
  children,
}: {
  judul: string;
  ikon: LucideIcon;
  href?: string;
  hrefLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card flex h-full flex-col overflow-hidden p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight">
          <Ikon className="h-5 w-5 text-primary" />
          {judul}
        </h2>
        {href && (
          <Link
            href={href}
            className="flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-primary hover:underline"
          >
            {hrefLabel ?? "Lihat Semua"} <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function Kosong({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}

/** Tiga angka di hero (kaca transparan di atas latar biru). */
export async function StatistikHero() {
  await connection();
  const [alat, praktikum, asisten] = await Promise.all([
    prisma.alat.aggregate({ _sum: { stokTotal: true }, where: { aktif: true } }),
    prisma.praktikum.count({ where: { aktif: true } }),
    prisma.anggotaLab.count({ where: { jabatan: "ASISTEN", aktif: true } }),
  ]);

  const data = [
    { ikon: Cpu, nilai: alat._sum.stokTotal ?? 0, label: "Unit alat laboratorium" },
    { ikon: BookOpen, nilai: praktikum, label: "Praktikum aktif" },
    { ikon: Users, nilai: asisten, label: "Asisten praktikum" },
  ];

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      {data.map((d) => {
        const Ikon = d.ikon;
        return (
          <div key={d.label} className="glass flex items-center gap-3 rounded-xl px-4 py-3">
            <Ikon className="h-7 w-7 text-sorot" />
            <div>
              <p className="text-xl font-extrabold leading-none">{d.nilai.toLocaleString("id-ID")}</p>
              <p className="mt-1 text-[11px] text-white/75">{d.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export async function PengumumanKartu() {
  await connection();
  const sekarang = new Date();
  const daftar = await prisma.pengumuman.findMany({
    where: {
      aktif: true,
      mulaiTampil: { lte: sekarang },
      OR: [{ selesaiTampil: null }, { selesaiTampil: { gte: sekarang } }],
    },
    orderBy: { mulaiTampil: "desc" },
    take: 3,
  });

  return (
    <KartuBagian judul="Pengumuman Terbaru" ikon={Megaphone}>
      {daftar.length === 0 ? (
        <Kosong>Belum ada pengumuman.</Kosong>
      ) : (
        <ul>
          {daftar.map((p) => (
            <li key={p.id} className="flex gap-3.5 border-t border-border py-3.5 first:border-0 first:pt-0">
              <Tgl d={p.mulaiTampil} />
              <div className="min-w-0">
                <p className="font-semibold leading-snug">{p.judul}</p>
                <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{p.isi}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </KartuBagian>
  );
}

export async function TentangKartu() {
  await connection();
  const p = await ambilPengaturan();
  const teks = terisi(p.sejarah)
    ? p.sejarah
    : terisi(p.visi)
      ? p.visi
      : "Laboratorium Teknik Digital Universitas Lampung adalah pusat kegiatan pembelajaran, penelitian, dan pengembangan teknologi di bidang teknik digital.";

  const nilai = [
    { ikon: BookOpen, label: "Praktikum", href: "/praktikum" },
    { ikon: FlaskConical, label: "Penelitian", href: "/pengajuan/penelitian" },
    { ikon: ClipboardList, label: "Peminjaman", href: "/pengajuan" },
  ];

  return (
    <KartuBagian judul="Tentang Laboratorium" ikon={Landmark}>
      <div className="foto-gedung -mx-5 h-40 [clip-path:polygon(0_0,100%_0,100%_84%,0_100%)]" aria-hidden />
      <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted-foreground">{teks}</p>
      <Link href="/informasi/profil" className="btn btn-primary mt-4 h-9 w-fit rounded-lg px-4">
        Selengkapnya <ArrowRight className="h-4 w-4" />
      </Link>
      <div className="-mx-5 -mb-5 mt-5 grid grid-cols-3 border-t border-border">
        {nilai.map((n) => {
          const Ikon = n.ikon;
          return (
            <Link
              key={n.label}
              href={n.href}
              className="flex flex-col items-center gap-1.5 border-l border-border py-3 text-xs font-semibold first:border-l-0 hover:bg-muted"
            >
              <Ikon className="h-5 w-5 text-primary" />
              {n.label}
            </Link>
          );
        })}
      </div>
    </KartuBagian>
  );
}

export async function AgendaMendatang() {
  await connection();
  const sekarang = new Date();
  const daftar = await prisma.jadwal.findMany({
    where: { selesai: { gt: sekarang } },
    orderBy: { mulai: "asc" },
    take: 3,
    include: { ruangan: { select: { nama: true } } },
  });

  return (
    <KartuBagian judul="Agenda Mendatang" ikon={CalendarDays} href="/jadwal">
      {daftar.length === 0 ? (
        <Kosong>Belum ada kegiatan terjadwal.</Kosong>
      ) : (
        <ul>
          {daftar.map((j) => (
            <li key={j.id} className="flex gap-3.5 border-t border-border py-3.5 first:border-0 first:pt-0">
              <Tgl d={j.mulai} />
              <div className="min-w-0">
                <p className="font-semibold leading-snug">{j.judul}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {formatJam(j.mulai)} – {formatJam(j.selesai)} WIB
                  {j.ruangan ? ` | ${j.ruangan.nama}` : ""}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </KartuBagian>
  );
}