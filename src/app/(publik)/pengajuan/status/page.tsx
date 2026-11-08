import { Suspense } from "react";
import { Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ambilIp, batasi } from "@/lib/batas";
import { rapikanKode } from "@/lib/pengajuan";
import { labelJenisPengajuan } from "@/lib/konstanta";
import { formatJam, formatTanggal, formatTanggalPendek } from "@/lib/waktu";
import { StatusPill } from "@/components/admin/status-pill";
import { Skeleton } from "@/components/publik/beranda-data";

export const metadata = { title: "Cek Status Pengajuan" };

type Params = Promise<{ kode?: string; baru?: string }>;

function Baris({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[160px_1fr] sm:gap-4">
      <dt className="label-mono self-center">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

async function Hasil({ params }: { params: Params }) {
  const sp = await params;
  const kode = rapikanKode(sp.kode ?? "");
  if (!kode) return null;

  const ip = await ambilIp();
  if (!batasi(`status:${ip}`, 60, 10 * 60 * 1000)) {
    return <p className="mt-8 text-sm font-medium">Terlalu banyak pencarian. Coba lagi beberapa menit lagi.</p>;
  }

  const p = await prisma.pengajuan.findUnique({
    where: { kode },
    select: {
      kode: true,
      jenis: true,
      status: true,
      namaLengkap: true,
      keperluan: true,
      tanggalMulai: true,
      tanggalSelesai: true,
      catatanAdmin: true,
      judulPenelitian: true,
      createdAt: true,
      ruangan: { select: { nama: true } },
      alat: { select: { jumlah: true, alat: { select: { nama: true } } } },
    },
  });

  if (!p) {
    return (
      <p className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Pengajuan dengan kode <span className="font-mono font-semibold text-foreground">{kode}</span> tidak
        ditemukan. Periksa kembali kodenya.
      </p>
    );
  }

  return (
    <div className="mt-8 space-y-5">
      {sp.baru === "1" && (
        <div className="surface-ink rounded-2xl p-6">
          <p className="font-semibold">Pengajuan terkirim.</p>
          <p className="mt-1 text-sm text-ink-muted">
            Simpan kode di bawah ini (catat atau tangkap layar). Kode dipakai untuk memantau status; tidak ada
            email pemberitahuan.
          </p>
        </div>
      )}

      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="label-mono">Kode pengajuan</p>
            <p className="mt-1 font-mono text-2xl font-extrabold tracking-tight">{p.kode}</p>
          </div>
          <StatusPill status={p.status} />
        </div>

        <dl className="mt-4 divide-y divide-border border-t border-border">
          <Baris label="Jenis">{labelJenisPengajuan[p.jenis]}</Baris>
          <Baris label="Pemohon">{p.namaLengkap}</Baris>
          {p.judulPenelitian && <Baris label="Judul">{p.judulPenelitian}</Baris>}
          <Baris label="Waktu">
            {formatTanggal(p.tanggalMulai)}, {formatJam(p.tanggalMulai)} WIB
            <br />
            s.d. {formatTanggal(p.tanggalSelesai)}, {formatJam(p.tanggalSelesai)} WIB
          </Baris>
          {p.ruangan && <Baris label="Ruangan">{p.ruangan.nama}</Baris>}
          {p.alat.length > 0 && (
            <Baris label="Alat">
              {p.alat.map((a) => `${a.alat.nama} × ${a.jumlah}`).join(", ")}
            </Baris>
          )}
          <Baris label="Keperluan">{p.keperluan}</Baris>
          <Baris label="Diajukan">{formatTanggalPendek(p.createdAt)}</Baris>
          <Baris label="Catatan admin">{p.catatanAdmin || "Belum ada catatan."}</Baris>
        </dl>

        <p className="mt-4 text-xs text-muted-foreground">
          {p.status === "MENUNGGU" && "Pengajuan Anda sedang menunggu tinjauan admin."}
          {p.status === "DISETUJUI" && "Pengajuan disetujui. Harap datang sesuai jadwal."}
          {p.status === "DITOLAK" && "Pengajuan ditolak. Lihat catatan admin, Anda bisa mengajukan ulang."}
          {p.status === "SELESAI" && "Pengajuan telah selesai."}
          {p.status === "DIBATALKAN" && "Pengajuan dibatalkan."}
        </p>
      </div>
    </div>
  );
}

export default function HalamanStatus({ searchParams }: { searchParams: Params }) {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-12 sm:pt-16">
      <p className="label-mono">Pengajuan</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tighter sm:text-5xl">Cek Status</h1>
      <p className="mt-3 text-muted-foreground">Masukkan kode pengajuan yang Anda terima saat mengirim formulir.</p>

      <form action="/pengajuan/status" method="get" className="mt-8 flex flex-col gap-3 sm:flex-row">
        <input
          name="kode"
          required
          placeholder="LTD-20261107-ABCD"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          className="input h-12 font-mono sm:flex-1"
        />
        <button type="submit" className="btn btn-primary btn-lg">
          <Search className="h-4 w-4" />
          Cek
        </button>
      </form>

      <Suspense fallback={<Skeleton className="mt-8 h-72" />}>
        <Hasil params={searchParams} />
      </Suspense>
    </div>
  );
}