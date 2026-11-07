"use client";

import Link from "next/link";
import { useActionState } from "react";
import { simpanPengumuman, type PengumumanState } from "@/actions/pengumuman";

export type NilaiPengumuman = {
  id?: number;
  judul: string;
  isi: string;
  mulaiTampil: string;
  selesaiTampil: string;
  aktif: string; // "1" = aktif
};

const kosong: NilaiPengumuman = {
  judul: "",
  isi: "",
  mulaiTampil: "",
  selesaiTampil: "",
  aktif: "1",
};

function Galat({ pesan }: { pesan?: string }) {
  return pesan ? (
    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{pesan}</p>
  ) : null;
}

export function FormPengumuman({ awal }: { awal?: NilaiPengumuman }) {
  const [state, action, pending] = useActionState(simpanPengumuman, {} as PengumumanState);
  const v = { ...(awal ?? kosong), ...(state.values ?? {}) };
  const e = state.fieldErrors ?? {};

  return (
    <form action={action} className="card space-y-4 p-5">
      {awal?.id ? <input type="hidden" name="id" value={awal.id} /> : null}

      <div>
        <label htmlFor="judul" className="text-sm font-medium">Judul *</label>
        <input id="judul" name="judul" defaultValue={v.judul} className="input mt-1.5" required />
        <Galat pesan={e.judul} />
      </div>

      <div>
        <label htmlFor="isi" className="text-sm font-medium">Isi *</label>
        <textarea id="isi" name="isi" rows={5} defaultValue={v.isi} className="input mt-1.5" required />
        <Galat pesan={e.isi} />
      </div>

      <div>
        <label htmlFor="mulaiTampil" className="text-sm font-medium">Mulai tampil (WIB)</label>
        <input id="mulaiTampil" name="mulaiTampil" type="datetime-local" defaultValue={v.mulaiTampil} className="input mt-1.5" />
        <p className="mt-1 text-xs text-muted-foreground">Kosongkan untuk tayang sekarang.</p>
        <Galat pesan={e.mulaiTampil} />
      </div>

      <div>
        <label htmlFor="selesaiTampil" className="text-sm font-medium">Selesai tampil (WIB)</label>
        <input id="selesaiTampil" name="selesaiTampil" type="datetime-local" defaultValue={v.selesaiTampil} className="input mt-1.5" />
        <p className="mt-1 text-xs text-muted-foreground">Kosongkan jika tanpa batas waktu.</p>
        <Galat pesan={e.selesaiTampil} />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="aktif" value="1" defaultChecked={v.aktif === "1"} />
        Aktif
      </label>

      {state.error && (
        <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Menyimpan..." : awal?.id ? "Simpan Perubahan" : "Terbitkan"}
        </button>
        {awal?.id && (
          <Link href="/admin/pengumuman" className="btn btn-outline">Batal</Link>
        )}
      </div>
    </form>
  );
}