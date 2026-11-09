"use client";

import { useActionState } from "react";
import { FileText } from "lucide-react";
import { kirimPengajuan } from "@/actions/pengajuan";
import type { FormState } from "@/lib/form";

type Jenis = "ALAT" | "RUANGAN" | "PENELITIAN";
type Ruangan = { id: number; nama: string; kapasitas: number | null };
type Alat = { id: number; nama: string; kategori: string | null; stokTotal: number };

function Bidang({
  id,
  label,
  galat,
  petunjuk,
  children,
}: {
  id: string;
  label: string;
  galat?: string;
  petunjuk?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <div className="mt-1.5">{children}</div>
      {petunjuk && !galat && <p className="mt-1 text-xs text-muted-foreground">{petunjuk}</p>}
      {galat && <p role="alert" className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{galat}</p>}
    </div>
  );
}

function Seksi({ nomor, judul, children }: { nomor: string; judul: string; children: React.ReactNode }) {
  return (
    <section className="card space-y-4 p-5 sm:p-6">
      <div>
        <p className="label-mono">{nomor}</p>
        <h2 className="mt-1 font-semibold">{judul}</h2>
      </div>
      {children}
    </section>
  );
}

export function FormPengajuan({
  jenis,
  ruangan,
  alat,
  templateSurat,
}: {
  jenis: Jenis;
  ruangan: Ruangan[];
  alat: Alat[];
  templateSurat?: string;
}) {
  const [state, action, pending] = useActionState(kirimPengajuan, {} as FormState);
  const v = state.values ?? {};
  const e = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="jenis" value={jenis} />

      {/* Jebakan bot: disembunyikan dari pengguna */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <Seksi nomor="01" judul="Data pemohon">
        <Bidang id="namaLengkap" label="Nama lengkap *" galat={e.namaLengkap}>
          <input id="namaLengkap" name="namaLengkap" defaultValue={v.namaLengkap ?? ""} required className="input" />
        </Bidang>
        <div className="grid gap-4 sm:grid-cols-2">
          <Bidang id="npm" label="NPM / NIM *" galat={e.npm}>
            <input id="npm" name="npm" defaultValue={v.npm ?? ""} required className="input" />
          </Bidang>
          <Bidang id="programStudi" label="Program studi *" galat={e.programStudi}>
            <input id="programStudi" name="programStudi" defaultValue={v.programStudi ?? ""} required className="input" />
          </Bidang>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Bidang id="email" label="Email *" galat={e.email}>
            <input id="email" name="email" type="email" defaultValue={v.email ?? ""} required className="input" />
          </Bidang>
          <Bidang id="noHp" label="Nomor HP / WhatsApp *" galat={e.noHp}>
            <input id="noHp" name="noHp" inputMode="tel" defaultValue={v.noHp ?? ""} required className="input" />
          </Bidang>
        </div>
      </Seksi>

      <Seksi
        nomor="02"
        judul={jenis === "PENELITIAN" ? "Detail penelitian" : jenis === "RUANGAN" ? "Detail peminjaman ruangan" : "Detail peminjaman alat"}
      >
        {jenis === "PENELITIAN" && (
          <>
            <Bidang id="judulPenelitian" label="Judul penelitian *" galat={e.judulPenelitian}>
              <input id="judulPenelitian" name="judulPenelitian" defaultValue={v.judulPenelitian ?? ""} required className="input" />
            </Bidang>
            <Bidang id="dosenPembimbing" label="Dosen pembimbing *" galat={e.dosenPembimbing}>
              <input id="dosenPembimbing" name="dosenPembimbing" defaultValue={v.dosenPembimbing ?? ""} required className="input" />
            </Bidang>
            <Bidang id="abstrak" label="Abstrak singkat" galat={e.abstrak}>
              <textarea id="abstrak" name="abstrak" rows={4} defaultValue={v.abstrak ?? ""} className="input" />
            </Bidang>
          </>
        )}

        {jenis === "RUANGAN" && (
          <Bidang id="ruanganId" label="Ruangan *" galat={e.ruanganId}>
            <select id="ruanganId" name="ruanganId" defaultValue={v.ruanganId ?? ""} required className="input">
              <option value="">Pilih ruangan</option>
              {ruangan.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nama}
                  {r.kapasitas ? ` (kapasitas ${r.kapasitas})` : ""}
                </option>
              ))}
            </select>
          </Bidang>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Bidang id="tanggalMulai" label="Mulai (WIB) *" galat={e.tanggalMulai}>
            <input id="tanggalMulai" name="tanggalMulai" type="datetime-local" defaultValue={v.tanggalMulai ?? ""} required className="input" />
          </Bidang>
          <Bidang id="tanggalSelesai" label="Selesai (WIB) *" galat={e.tanggalSelesai}>
            <input id="tanggalSelesai" name="tanggalSelesai" type="datetime-local" defaultValue={v.tanggalSelesai ?? ""} required className="input" />
          </Bidang>
        </div>

        {jenis !== "RUANGAN" && (
          <div>
            <p className="text-sm font-medium">
              {jenis === "ALAT" ? "Alat yang dipinjam *" : "Alat yang dibutuhkan (opsional)"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Isi jumlah pada alat yang diperlukan, biarkan 0 bila tidak.</p>
            {alat.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Belum ada alat yang tersedia.</p>
            ) : (
              <ul className="mt-3 divide-y divide-border rounded-xl border border-border">
                {alat.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <label htmlFor={`alat_${a.id}`} className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{a.nama}</span>
                      <span className="block text-xs text-muted-foreground">
                        {[a.kategori, `Stok ${a.stokTotal}`].filter(Boolean).join(" · ")}
                      </span>
                    </label>
                    <input
                      id={`alat_${a.id}`}
                      name={`alat_${a.id}`}
                      type="number"
                      min={0}
                      max={a.stokTotal}
                      defaultValue={v[`alat_${a.id}`] ?? "0"}
                      className="input h-9 w-20 text-center"
                    />
                  </li>
                ))}
              </ul>
            )}
            {e.alat && <p role="alert" className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">{e.alat}</p>}
          </div>
        )}

        <Bidang id="keperluan" label="Keperluan *" galat={e.keperluan}>
          <textarea id="keperluan" name="keperluan" rows={3} defaultValue={v.keperluan ?? ""} required className="input" />
        </Bidang>
        <Bidang id="keterangan" label="Keterangan tambahan" galat={e.keterangan}>
          <textarea id="keterangan" name="keterangan" rows={2} defaultValue={v.keterangan ?? ""} className="input" />
        </Bidang>
      </Seksi>

      <Seksi nomor="03" judul="Dokumen pendukung">
        {templateSurat && (
          <a
            href={templateSurat}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline w-full justify-start sm:w-auto"
          >
            <FileText className="h-4 w-4" />
            Unduh template surat
          </a>
        )}
        <p className="text-sm text-muted-foreground">
          Lampirkan surat permohonan yang sudah ditandatangani (wajib).
        </p>
        <Bidang id="bukti" label="Unggah berkas *" galat={e.bukti} petunjuk="PDF, JPG, atau PNG, maks 5 MB. Berkas perlu dipilih ulang bila formulir dikirim ulang setelah galat.">
          <input
            id="bukti"
            name="bukti"
            type="file"
            required
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/png,image/jpeg"
            className="input file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1 file:text-sm file:font-medium"
          />
        </Bidang>
      </Seksi>

      {state.error && (
        <p role="alert" className="rounded-xl border border-red-500/40 p-3 text-sm font-medium text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary btn-lg w-full sm:w-auto">
        {pending ? "Mengirim..." : "Kirim Pengajuan"}
      </button>
    </form>
  );
}