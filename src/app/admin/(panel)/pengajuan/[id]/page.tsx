import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { wajibAdmin } from "@/lib/auth";
import { bentrokRuangan, stokSisa } from "@/lib/ketersediaan";
import { FormProses } from "@/components/admin/form-proses";
import { StatusPill } from "@/components/admin/status-pill";
import { labelJenisPengajuan } from "@/lib/konstanta";
import { formatJam, formatTanggal, formatTanggalPendek } from "@/lib/waktu";

export const metadata = { title: "Detail Pengajuan" };

function Baris({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[170px_1fr] sm:gap-4">
      <dt className="label-mono self-start pt-0.5">{label}</dt>
      <dd className="min-w-0 whitespace-pre-line break-words text-sm">{children}</dd>
    </div>
  );
}

function linkWa(noHp: string) {
  const d = noHp.replace(/\D/g, "");
  const n = d.startsWith("0") ? `62${d.slice(1)}` : d;
  return `https://wa.me/${n}`;
}

export default async function DetailPengajuan({ params }: { params: Promise<{ id: string }> }) {
  await wajibAdmin();
  const { id: idTeks } = await params;
  const id = Number(idTeks) || 0;

  const p = await prisma.pengajuan.findUnique({
    where: { id },
    include: {
      ruangan: { select: { nama: true } },
      alat: { include: { alat: { select: { nama: true } } } },
      diprosesOleh: { select: { nama: true } },
      jadwal: { select: { id: true } },
    },
  });
  if (!p) notFound();

  // Ketersediaan saat ini (hanya relevan selagi menunggu keputusan)
  const peringatan: string[] = [];
  if (p.status === "MENUNGGU") {
    if (p.jenis === "RUANGAN" && p.ruanganId) {
      const { jadwal, pengajuan } = await bentrokRuangan(p.ruanganId, p.tanggalMulai, p.tanggalSelesai, p.id);
      if (jadwal) {
        peringatan.push(
          `Ruangan bentrok dengan "${jadwal.judul}" (${formatTanggalPendek(jadwal.mulai)}, ${formatJam(jadwal.mulai)}-${formatJam(jadwal.selesai)} WIB).`,
        );
      }
      if (pengajuan) peringatan.push(`Ruangan bentrok dengan pengajuan ${pengajuan.kode} yang sudah disetujui.`);
    }
    for (const a of p.alat) {
      const { nama, sisa } = await stokSisa(a.alatId, p.tanggalMulai, p.tanggalSelesai, p.id);
      if (a.jumlah > sisa) peringatan.push(`Stok ${nama} tinggal ${sisa} unit pada waktu itu (diminta ${a.jumlah}).`);
    }
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/pengajuan"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Semua pengajuan
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="label-mono">{labelJenisPengajuan[p.jenis]}</p>
          <h1 className="mt-1 font-mono text-2xl font-extrabold tracking-tight">{p.kode}</h1>
        </div>
        <StatusPill status={p.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <section className="card p-5 sm:p-6">
            <h2 className="font-semibold">Pemohon</h2>
            <dl className="mt-2 divide-y divide-border">
              <Baris label="Nama">{p.namaLengkap}</Baris>
              <Baris label="NPM / NIM">{p.npm}</Baris>
              <Baris label="Program studi">{p.programStudi}</Baris>
              <Baris label="Email">
                <a href={`mailto:${p.email}`} className="underline underline-offset-4">{p.email}</a>
              </Baris>
              <Baris label="HP / WhatsApp">
                {p.noHp}{" "}
                <a
                  href={linkWa(p.noHp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-muted-foreground underline underline-offset-4 hover:text-foreground"
                >
                  buka WhatsApp
                </a>
              </Baris>
            </dl>
          </section>

          <section className="card p-5 sm:p-6">
            <h2 className="font-semibold">Kegiatan</h2>
            <dl className="mt-2 divide-y divide-border">
              {p.judulPenelitian && <Baris label="Judul penelitian">{p.judulPenelitian}</Baris>}
              {p.dosenPembimbing && <Baris label="Dosen pembimbing">{p.dosenPembimbing}</Baris>}
              {p.abstrak && <Baris label="Abstrak">{p.abstrak}</Baris>}
              <Baris label="Waktu">
                {formatTanggal(p.tanggalMulai)}, {formatJam(p.tanggalMulai)} WIB
                {"\n"}s.d. {formatTanggal(p.tanggalSelesai)}, {formatJam(p.tanggalSelesai)} WIB
              </Baris>
              {p.ruangan && <Baris label="Ruangan">{p.ruangan.nama}</Baris>}
              {p.alat.length > 0 && (
                <Baris label="Alat">
                  {p.alat.map((a) => `${a.alat.nama} × ${a.jumlah}`).join("\n")}
                </Baris>
              )}
              <Baris label="Keperluan">{p.keperluan}</Baris>
              {p.keterangan && <Baris label="Keterangan">{p.keterangan}</Baris>}
              <Baris label="Diajukan">
                {formatTanggalPendek(p.createdAt)}, {formatJam(p.createdAt)} WIB
              </Baris>
            </dl>
          </section>

          <section className="card p-5 sm:p-6">
            <h2 className="font-semibold">Dokumen pendukung</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {p.buktiUrl && (
                <a href={`/admin/bukti/${p.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                  <FileText className="h-4 w-4" />
                  Buka berkas unggahan
                </a>
              )}
              {p.buktiLink && (
                <a href={p.buktiLink} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                  <ExternalLink className="h-4 w-4" />
                  Buka tautan Drive
                </a>
              )}
              {!p.buktiUrl && !p.buktiLink && (
                <p className="text-sm text-muted-foreground">Tidak ada dokumen.</p>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6 self-start">
          {p.status === "MENUNGGU" && (
            <section className="card p-5">
              <h2 className="font-semibold">Ketersediaan</h2>
              {peringatan.length > 0 ? (
                <ul role="alert" className="mt-3 space-y-2 text-sm font-medium">
                  {peringatan.map((t) => (
                    <li key={t} className="rounded-lg border border-dashed border-foreground p-3">{t}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">Tidak ada bentrok maupun kekurangan stok saat ini.</p>
              )}
            </section>
          )}

          <section className="card p-5">
            <h2 className="mb-3 font-semibold">Keputusan</h2>
            <FormProses id={p.id} status={p.status} catatanAwal={p.catatanAdmin} />
            {p.diprosesOleh && p.diprosesPada && (
              <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
                Terakhir diproses oleh {p.diprosesOleh.nama} pada {formatTanggalPendek(p.diprosesPada)},{" "}
                {formatJam(p.diprosesPada)} WIB.
              </p>
            )}
            {p.jadwal && (
              <p className="mt-2 text-xs text-muted-foreground">
                Tampil di jadwal publik sebagai "Peminjaman ruangan".
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}