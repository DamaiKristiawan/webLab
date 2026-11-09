"use client";

import Link from "next/link";
import { useActionState } from "react";
import { simpanJadwal, type JadwalState } from "@/actions/jadwal";
import { JENIS_JADWAL, labelJenis } from "@/lib/konstanta";

type Opsi = { id: number; nama: string };

export type NilaiJadwal = {
  id?: number;
  judul: string;
  jenis: string;
  mulai: string;
  selesai: string;
  ruanganId: string;
  praktikumId: string;
  kelas: string;
  pengampu: string;
  keterangan: string;
};

const kosong: NilaiJadwal = {
  judul: "",
  jenis: "PRAKTIKUM",
  mulai: "",
  selesai: "",
  ruanganId: "",
  praktikumId: "",
  kelas: "",
  pengampu: "",
  keterangan: "",
};

function Galat({ pesan }: { pesan?: string }) {
  return pesan ? (
    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{pesan}</p>
  ) : null;
}

export function FormJadwal({
  ruangan,
  praktikum,
  awal,
}: {
  ruangan: Opsi[];
  praktikum: Opsi[];
  awal?: NilaiJadwal;
}) {
  const [state, action, pending] = useActionState(simpanJadwal, {} as JadwalState);
  // Setelah submit gagal, isian dikembalikan dari nilai yang dikirim.
  const v = { ...(awal ?? kosong), ...(state.values ?? {}) };
  const e = state.fieldErrors ?? {};

  // Ruangan dikunci: pakai "Laboratorium Teknik Digital" jika ada, kalau tidak ruangan pertama.
  const ruanganTetap =
    ruangan.find((r) => r.nama.toLowerCase() === "laboratorium teknik digital") ?? ruangan[0];

  return (
    <form action={action} className="card space-y-5 p-6">
      {awal?.id ? <input type="hidden" name="id" value={awal.id} /> : null}

      <div>
        <label htmlFor="judul" className="text-sm font-medium">Judul kegiatan *</label>
        <input id="judul" name="judul" defaultValue={v.judul} className="input mt-1.5" required />
        <Galat pesan={e.judul} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="jenis" className="text-sm font-medium">Jenis *</label>
          <select id="jenis" name="jenis" defaultValue={v.jenis} className="input mt-1.5">
            {JENIS_JADWAL.map((j) => (
              <option key={j} value={j}>{labelJenis[j]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Ruangan</label>
          <input type="hidden" name="ruanganId" value={ruanganTetap?.id ?? ""} />
          <p className="input mt-1.5 flex items-center bg-muted text-muted-foreground">
            Laboratorium Teknik Digital
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="mulai" className="text-sm font-medium">Mulai (WIB) *</label>
          <input id="mulai" name="mulai" type="datetime-local" defaultValue={v.mulai} className="input mt-1.5" required />
          <Galat pesan={e.mulai} />
        </div>
        <div>
          <label htmlFor="selesai" className="text-sm font-medium">Selesai (WIB) *</label>
          <input id="selesai" name="selesai" type="datetime-local" defaultValue={v.selesai} className="input mt-1.5" required />
          <Galat pesan={e.selesai} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="kelas" className="text-sm font-medium">Kelas</label>
          <input id="kelas" name="kelas" defaultValue={v.kelas} placeholder="mis. A" className="input mt-1.5" />
          <Galat pesan={e.kelas} />
        </div>
        <div>
          <label htmlFor="pengampu" className="text-sm font-medium">Dosen / asisten / pemateri</label>
          <input id="pengampu" name="pengampu" defaultValue={v.pengampu} className="input mt-1.5" />
          <Galat pesan={e.pengampu} />
        </div>
      </div>

      {praktikum.length > 0 && (
        <div>
          <label htmlFor="praktikumId" className="text-sm font-medium">Praktikum terkait</label>
          <select id="praktikumId" name="praktikumId" defaultValue={v.praktikumId} className="input mt-1.5">
            <option value="">- Tidak ada -</option>
            {praktikum.map((p) => (
              <option key={p.id} value={p.id}>{p.nama}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="keterangan" className="text-sm font-medium">Keterangan</label>
        <textarea id="keterangan" name="keterangan" rows={3} defaultValue={v.keterangan} className="input mt-1.5" />
        <Galat pesan={e.keterangan} />
      </div>

      {state.error && (
        <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}

      {state.bentrok && state.bentrok.length > 0 && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          <p className="font-medium">Bentrok dengan jadwal berikut:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {state.bentrok.map((b) => (
              <li key={b.id}>
                {b.judul} ({b.waktu})
              </li>
            ))}
          </ul>
          <label className="mt-3 flex items-center gap-2">
            <input type="checkbox" name="paksa" value="1" />
            Tetap simpan meskipun bentrok
          </label>
        </div>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Menyimpan..." : "Simpan"}
        </button>
        <Link href="/admin/jadwal" className="btn btn-outline">Batal</Link>
      </div>
    </form>
  );
}