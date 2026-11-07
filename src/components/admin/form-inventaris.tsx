"use client";

import Link from "next/link";
import { useActionState } from "react";
import { simpanAlat, simpanRuangan } from "@/actions/inventaris";
import type { FormState } from "@/lib/form";

function Galat({ pesan }: { pesan?: string }) {
  return pesan ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{pesan}</p> : null;
}

function Pesan({ state }: { state: FormState }) {
  if (state.error)
    return <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">{state.error}</p>;
  if (state.sukses) return <p role="status" className="text-sm font-medium">{state.sukses}</p>;
  return null;
}

type RuanganAwal = { id: number; nama: string; kapasitas: number | null; deskripsi: string | null };

export function FormRuangan({ awal }: { awal?: RuanganAwal }) {
  const [state, action, pending] = useActionState(simpanRuangan, {} as FormState);
  const v = state.values ?? {
    nama: awal?.nama ?? "",
    kapasitas: awal?.kapasitas?.toString() ?? "",
    deskripsi: awal?.deskripsi ?? "",
  };
  const e = state.fieldErrors ?? {};

  return (
    <form action={action} className="card space-y-4 p-5">
      <h3 className="font-semibold">{awal ? "Ubah ruangan" : "Ruangan baru"}</h3>
      {awal && <input type="hidden" name="id" value={awal.id} />}
      <div>
        <label htmlFor="r-nama" className="text-sm font-medium">Nama *</label>
        <input id="r-nama" name="nama" defaultValue={v.nama} required className="input mt-1.5" />
        <Galat pesan={e.nama} />
      </div>
      <div>
        <label htmlFor="r-kap" className="text-sm font-medium">Kapasitas</label>
        <input id="r-kap" name="kapasitas" inputMode="numeric" defaultValue={v.kapasitas} className="input mt-1.5" />
        <Galat pesan={e.kapasitas} />
      </div>
      <div>
        <label htmlFor="r-des" className="text-sm font-medium">Deskripsi</label>
        <textarea id="r-des" name="deskripsi" rows={2} defaultValue={v.deskripsi} className="input mt-1.5" />
        <Galat pesan={e.deskripsi} />
      </div>
      <Pesan state={state} />
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Menyimpan..." : awal ? "Simpan Perubahan" : "Tambah Ruangan"}
        </button>
        {awal && (
          <Link href="/admin/inventaris" className="btn btn-outline">Batal</Link>
        )}
      </div>
    </form>
  );
}

type AlatAwal = {
  id: number;
  nama: string;
  kategori: string | null;
  stokTotal: number;
  kondisi: string | null;
  deskripsi: string | null;
};

export function FormAlat({ awal }: { awal?: AlatAwal }) {
  const [state, action, pending] = useActionState(simpanAlat, {} as FormState);
  const v = state.values ?? {
    nama: awal?.nama ?? "",
    kategori: awal?.kategori ?? "",
    stokTotal: awal ? String(awal.stokTotal) : "1",
    kondisi: awal?.kondisi ?? "Baik",
    deskripsi: awal?.deskripsi ?? "",
  };
  const e = state.fieldErrors ?? {};

  return (
    <form action={action} className="card space-y-4 p-5">
      <h3 className="font-semibold">{awal ? "Ubah alat" : "Alat baru"}</h3>
      {awal && <input type="hidden" name="id" value={awal.id} />}
      <div>
        <label htmlFor="a-nama" className="text-sm font-medium">Nama *</label>
        <input id="a-nama" name="nama" defaultValue={v.nama} required className="input mt-1.5" />
        <Galat pesan={e.nama} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="a-kat" className="text-sm font-medium">Kategori</label>
          <input id="a-kat" name="kategori" defaultValue={v.kategori} className="input mt-1.5" />
          <Galat pesan={e.kategori} />
        </div>
        <div>
          <label htmlFor="a-stok" className="text-sm font-medium">Stok total *</label>
          <input id="a-stok" name="stokTotal" inputMode="numeric" defaultValue={v.stokTotal} required className="input mt-1.5" />
          <Galat pesan={e.stokTotal} />
        </div>
      </div>
      <div>
        <label htmlFor="a-kon" className="text-sm font-medium">Kondisi</label>
        <input id="a-kon" name="kondisi" defaultValue={v.kondisi} className="input mt-1.5" />
        <Galat pesan={e.kondisi} />
      </div>
      <div>
        <label htmlFor="a-des" className="text-sm font-medium">Deskripsi</label>
        <textarea id="a-des" name="deskripsi" rows={2} defaultValue={v.deskripsi} className="input mt-1.5" />
        <Galat pesan={e.deskripsi} />
      </div>
      <Pesan state={state} />
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Menyimpan..." : awal ? "Simpan Perubahan" : "Tambah Alat"}
        </button>
        {awal && (
          <Link href="/admin/inventaris" className="btn btn-outline">Batal</Link>
        )}
      </div>
    </form>
  );
}