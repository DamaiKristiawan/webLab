"use client";

import Link from "next/link";
import { useActionState } from "react";
import { simpanAnggota } from "@/actions/anggota";
import type { FormState } from "@/lib/form";
import { labelJabatan } from "@/lib/konstanta";
import { InputBerkas } from "@/components/admin/input-berkas";

type Awal = {
  id: number;
  nama: string;
  jabatan: keyof typeof labelJabatan;
  label: string | null;
  angkatan: number | null;
  nipNpm: string | null;
  email: string | null;
  kontak: string | null;
  bidang: string | null;
  fotoUrl: string | null;
  urutan: number;
  staffId: number | null;
  aktif: boolean;
};

function Galat({ pesan }: { pesan?: string }) {
  return pesan ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{pesan}</p> : null;
}

export function FormAnggota({
  awal,
  daftarStaf,
}: {
  awal?: Awal;
  daftarStaf: { id: number; nama: string; username: string }[];
}) {
  const [state, action, pending] = useActionState(simpanAnggota, {} as FormState);
  const v = state.values ?? {
    nama: awal?.nama ?? "",
    jabatan: awal?.jabatan ?? "ASISTEN",
    label: awal?.label ?? "",
    angkatan: awal?.angkatan?.toString() ?? "",
    nipNpm: awal?.nipNpm ?? "",
    email: awal?.email ?? "",
    kontak: awal?.kontak ?? "",
    bidang: awal?.bidang ?? "",
    urutan: awal ? String(awal.urutan) : "0",
    staffId: awal?.staffId?.toString() ?? "",
    aktif: awal ? (awal.aktif ? "on" : "") : "on",
  };
  const e = state.fieldErrors ?? {};

  return (
    <form action={action} className="card space-y-4 p-5">
      <h3 className="font-semibold">{awal ? "Ubah anggota" : "Anggota baru"}</h3>
      {awal && <input type="hidden" name="id" value={awal.id} />}

      <div>
        <label htmlFor="nama" className="text-sm font-medium">Nama (beserta gelar) *</label>
        <input id="nama" name="nama" defaultValue={v.nama} required className="input mt-1.5" />
        <Galat pesan={e.nama} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="jabatan" className="text-sm font-medium">Kelompok *</label>
          <select id="jabatan" name="jabatan" defaultValue={v.jabatan} className="input mt-1.5">
            {Object.entries(labelJabatan).map(([k, l]) => (
              <option key={k} value={k}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="angkatan" className="text-sm font-medium">Angkatan</label>
          <input id="angkatan" name="angkatan" inputMode="numeric" placeholder="2022" defaultValue={v.angkatan} className="input mt-1.5" />
          <Galat pesan={e.angkatan} />
        </div>
      </div>

      <div>
        <label htmlFor="label" className="text-sm font-medium">Jabatan yang ditampilkan</label>
        <input id="label" name="label" placeholder="Kosongkan untuk memakai nama kelompok" defaultValue={v.label} className="input mt-1.5" />
        <Galat pesan={e.label} />
      </div>

      <div>
        <label htmlFor="bidang" className="text-sm font-medium">Bidang / keterangan</label>
        <input id="bidang" name="bidang" defaultValue={v.bidang} className="input mt-1.5" />
        <Galat pesan={e.bidang} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="nipNpm" className="text-sm font-medium">NIP / NPM</label>
          <input id="nipNpm" name="nipNpm" defaultValue={v.nipNpm} className="input mt-1.5" />
          <Galat pesan={e.nipNpm} />
        </div>
        <div>
          <label htmlFor="kontak" className="text-sm font-medium">Kontak</label>
          <input id="kontak" name="kontak" defaultValue={v.kontak} className="input mt-1.5" />
          <Galat pesan={e.kontak} />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <input id="email" name="email" type="email" defaultValue={v.email} className="input mt-1.5" />
        <Galat pesan={e.email} />
      </div>

      <InputBerkas
        nama="foto"
        label="Foto"
        jenis="gambar"
        awalUrl={awal?.fotoUrl}
        galat={e.foto}
        petunjuk="JPG, PNG, atau WebP, maks 8 MB. Kosong = tampil inisial nama. Pilih ulang foto bila formulir dikirim ulang setelah galat."
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="urutan" className="text-sm font-medium">Urutan</label>
          <input id="urutan" name="urutan" inputMode="numeric" defaultValue={v.urutan} className="input mt-1.5" />
          <Galat pesan={e.urutan} />
        </div>
        <div>
          <label htmlFor="staffId" className="text-sm font-medium">Akun login</label>
          <select id="staffId" name="staffId" defaultValue={v.staffId} className="input mt-1.5">
            <option value="">Tidak ditautkan</option>
            {daftarStaf.map((s) => (
              <option key={s.id} value={s.id}>{s.nama} (@{s.username})</option>
            ))}
          </select>
          <Galat pesan={e.staffId} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="aktif" defaultChecked={v.aktif === "on"} className="h-4 w-4" />
        Tampilkan di halaman Struktur
      </label>

      {state.error && (
        <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">{state.error}</p>
      )}
      {state.sukses && <p role="status" className="text-sm font-medium">{state.sukses}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Menyimpan..." : awal ? "Simpan Perubahan" : "Tambah Anggota"}
        </button>
        {awal && <Link href="/admin/anggota" className="btn btn-outline">Batal</Link>}
      </div>
    </form>
  );
}