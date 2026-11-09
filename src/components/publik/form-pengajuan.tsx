"use client";

import { useActionState, useMemo, useState } from "react";
import { FileText, Plus, X } from "lucide-react";
import { kirimPengajuan } from "@/actions/pengajuan";
import type { FormState } from "@/lib/form";

type Jenis = "ALAT" | "RUANGAN" | "PENELITIAN";
type Ruangan = { id: number; nama: string; kapasitas: number | null };
type Alat = { id: number; nama: string; kategori: string | null; stokTotal: number };

// Urutan kategori. Kategori lain (jika ada) muncul setelahnya.
const URUTAN_KATEGORI = ["IC", "Sensor", "Mikrokontroler", "Aktuator"];

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

function PilihAlat({
  alat,
  awal,
  judul,
  galat,
}: {
  alat: Alat[];
  awal: Record<string, string | undefined>;
  judul: string;
  galat?: string;
}) {
  // Kelompokkan alat per kategori, urut sesuai URUTAN_KATEGORI.
  const kelompok = useMemo(() => {
    const peta = new Map<string, { label: string; items: Alat[] }>();
    for (const a of alat) {
      const mentah = a.kategori?.trim() || "Lainnya";
      const kunci = mentah.toLowerCase();
      const baku = URUTAN_KATEGORI.find((u) => u.toLowerCase() === kunci);
      const entri = peta.get(kunci) ?? { label: baku ?? mentah, items: [] };
      entri.items.push(a);
      peta.set(kunci, entri);
    }
    const peringkat = (k: string) => {
      const i = URUTAN_KATEGORI.findIndex((u) => u.toLowerCase() === k);
      return i === -1 ? 99 : i;
    };
    return [...peta.entries()]
      .sort(([x], [y]) => peringkat(x) - peringkat(y) || x.localeCompare(y))
      .map(([kunci, e]) => ({
        kunci,
        label: e.label,
        items: [...e.items].sort((p, q) => p.nama.localeCompare(q.nama, "id", { numeric: true })),
      }));
  }, [alat]);

  const alatById = useMemo(() => new Map(alat.map((a) => [a.id, a])), [alat]);

  const [kategori, setKategori] = useState(kelompok[0]?.kunci ?? "");
  const [pilihan, setPilihan] = useState("");
  const [jumlahBaru, setJumlahBaru] = useState("1");

  // Alat yang sudah dipilih: id -> jumlah. Dipulihkan dari isian sebelumnya bila form gagal terkirim.
  const [terpilih, setTerpilih] = useState<Record<number, number>>(() => {
    const hasil: Record<number, number> = {};
    for (const a of alat) {
      const n = Number(awal[`alat_${a.id}`]);
      if (n > 0) hasil[a.id] = Math.min(Math.floor(n), a.stokTotal);
    }
    return hasil;
  });

  const aktif = kelompok.find((k) => k.kunci === kategori);
  const tersedia = (aktif?.items ?? []).filter((a) => terpilih[a.id] === undefined);
  const alatDipilih = alat.filter((a) => terpilih[a.id] !== undefined);
  const dipilihAlat = alatById.get(Number(pilihan));

  function pilihKategori(kunci: string) {
    setKategori(kunci);
    setPilihan("");
    setJumlahBaru("1");
  }

  function tambah() {
    if (!dipilihAlat) return;
    const n = Math.max(1, Math.min(dipilihAlat.stokTotal, Math.floor(Number(jumlahBaru)) || 1));
    setTerpilih((s) => ({ ...s, [dipilihAlat.id]: n }));
    setPilihan("");
    setJumlahBaru("1");
  }

  function ubahJumlah(a: Alat, nilai: string) {
    const n = Math.max(1, Math.min(a.stokTotal, Math.floor(Number(nilai)) || 1));
    setTerpilih((s) => ({ ...s, [a.id]: n }));
  }

  function hapus(id: number) {
    setTerpilih((s) => {
      const salinan = { ...s };
      delete salinan[id];
      return salinan;
    });
  }

  return (
    <div>
      <p className="text-sm font-medium">{judul}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Pilih kategori, pilih alatnya, isi jumlah, lalu tekan Tambah. Ulangi untuk alat lain.
      </p>

      {/* Semua alat tetap dikirim (0 bila tidak dipilih), sama seperti sebelumnya. */}
      {alat.map((a) => (
        <input key={a.id} type="hidden" name={`alat_${a.id}`} value={terpilih[a.id] ?? 0} />
      ))}

      {alat.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Belum ada alat yang tersedia.</p>
      ) : (
        <>
          {/* Langkah 1: kategori */}
          <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label="Kategori alat">
            {kelompok.map((k) => {
              const jumlahTerpilih = k.items.filter((a) => terpilih[a.id] !== undefined).length;
              const menyala = k.kunci === kategori;
              return (
                <button
                  key={k.kunci}
                  type="button"
                  role="tab"
                  aria-selected={menyala}
                  onClick={() => pilihKategori(k.kunci)}
                  className={
                    "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors " +
                    (menyala
                      ? "border-transparent bg-primary text-primary-foreground"
                      : "border-border hover:bg-muted")
                  }
                >
                  {k.label}
                  {jumlahTerpilih > 0 && (
                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-background px-1 text-[11px] font-bold text-foreground">
                      {jumlahTerpilih}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Langkah 2 dan 3: pilih alat + jumlah */}
          <div className="mt-3 flex flex-wrap items-end gap-3 rounded-xl border border-border p-3 sm:p-4">
            <div className="min-w-0 flex-1 basis-56">
              <label htmlFor="pilih-alat" className="mb-1 block text-xs text-muted-foreground">
                {aktif ? `Pilih ${aktif.label}` : "Pilih alat"}
              </label>
              <select
                id="pilih-alat"
                value={pilihan}
                onChange={(ev) => {
                  setPilihan(ev.target.value);
                  setJumlahBaru("1");
                }}
                className="input"
                disabled={tersedia.length === 0}
              >
                <option value="">
                  {tersedia.length === 0 ? "Semua sudah dipilih" : "Pilih..."}
                </option>
                {tersedia.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nama} (stok {a.stokTotal})
                  </option>
                ))}
              </select>
            </div>
            <div className="w-24">
              <label htmlFor="jumlah-baru" className="mb-1 block text-xs text-muted-foreground">Jumlah</label>
              <input
                id="jumlah-baru"
                type="number"
                inputMode="numeric"
                min={1}
                max={dipilihAlat?.stokTotal}
                value={jumlahBaru}
                onChange={(ev) => setJumlahBaru(ev.target.value)}
                disabled={!dipilihAlat}
                className="input text-center"
              />
            </div>
            <button type="button" onClick={tambah} disabled={!dipilihAlat} className="btn btn-primary">
              <Plus className="h-4 w-4" />
              Tambah
            </button>
          </div>

          {/* Alat yang sudah dipilih */}
          <div className="mt-3">
            <p className="text-xs font-medium text-muted-foreground">
              {alatDipilih.length > 0 ? `Alat dipilih (${alatDipilih.length})` : "Belum ada alat yang dipilih."}
            </p>
            {alatDipilih.length > 0 && (
              <ul className="mt-2 divide-y divide-border rounded-xl border border-border">
                {alatDipilih.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{a.nama}</span>
                      <span className="block text-xs text-muted-foreground">
                        {a.kategori ?? "Lainnya"} · Stok {a.stokTotal}
                      </span>
                    </div>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={a.stokTotal}
                      value={terpilih[a.id]}
                      onChange={(ev) => ubahJumlah(a, ev.target.value)}
                      aria-label={`Jumlah ${a.nama}`}
                      className="input h-9 w-20 text-center"
                    />
                    <button
                      type="button"
                      onClick={() => hapus(a.id)}
                      aria-label={`Hapus ${a.nama}`}
                      className="btn btn-outline h-9 w-9 px-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {galat && <p role="alert" className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">{galat}</p>}
    </div>
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

  // Ruangan dikunci: pakai "Laboratorium Teknik Digital" jika ada, kalau tidak ruangan pertama.
  const ruanganTetap =
    ruangan.find((r) => r.nama.toLowerCase() === "laboratorium teknik digital") ?? ruangan[0];

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
          <div>
            <p className="text-sm font-medium">Ruangan</p>
            <input type="hidden" name="ruanganId" value={ruanganTetap?.id ?? ""} />
            <p className="input mt-1.5 flex items-center bg-muted text-muted-foreground">
              Laboratorium Teknik Digital
            </p>
            {e.ruanganId && (
              <p role="alert" className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{e.ruanganId}</p>
            )}
          </div>
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
          <PilihAlat
            alat={alat}
            awal={v}
            galat={e.alat}
            judul={jenis === "ALAT" ? "Alat yang dipinjam *" : "Alat yang dibutuhkan (opsional)"}
          />
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