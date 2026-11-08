"use client";

import Link from "next/link";
import { useActionState } from "react";
import { simpanJudul, simpanPraktikum } from "@/actions/praktikum";
import { simpanSoal, simpanTes } from "@/actions/tes";
import type { FormState } from "@/lib/form";

function Galat({ pesan }: { pesan?: string }) {
  return pesan ? <p role="alert" className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{pesan}</p> : null;
}

function Pesan({ state }: { state: FormState }) {
  if (state.error)
    return <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">{state.error}</p>;
  if (state.sukses) return <p role="status" className="text-sm font-medium">{state.sukses}</p>;
  return null;
}

export function FormPraktikum({
  awal,
}: {
  awal?: { id: number; nama: string; deskripsi: string | null; modulUrl: string | null; aktif: boolean };
}) {
  const [state, action, pending] = useActionState(simpanPraktikum, {} as FormState);
  const v = state.values ?? {
    nama: awal?.nama ?? "",
    deskripsi: awal?.deskripsi ?? "",
    modulUrl: awal?.modulUrl ?? "",
    aktif: awal ? (awal.aktif ? "on" : "") : "on",
  };
  const e = state.fieldErrors ?? {};

  return (
    <form action={action} className="card space-y-4 p-5">
      <h3 className="font-semibold">{awal ? "Ubah praktikum" : "Praktikum baru"}</h3>
      {awal && <input type="hidden" name="id" value={awal.id} />}
      <div>
        <label htmlFor="p-nama" className="text-sm font-medium">Nama praktikum *</label>
        <input id="p-nama" name="nama" defaultValue={v.nama} required className="input mt-1.5" />
        <Galat pesan={e.nama} />
      </div>
      <div>
        <label htmlFor="p-des" className="text-sm font-medium">Deskripsi</label>
        <textarea id="p-des" name="deskripsi" rows={3} defaultValue={v.deskripsi} className="input mt-1.5" />
        <Galat pesan={e.deskripsi} />
      </div>
      <div>
        <label htmlFor="p-modul" className="text-sm font-medium">Tautan modul</label>
        <input
          id="p-modul"
          name="modulUrl"
          type="url"
          placeholder="https://drive.google.com/..."
          defaultValue={v.modulUrl}
          className="input mt-1.5"
        />
        <p className="mt-1 text-xs text-muted-foreground">Satu modul untuk seluruh judul. Atur akses Drive ke "siapa saja yang memiliki link".</p>
        <Galat pesan={e.modulUrl} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="aktif" defaultChecked={v.aktif === "on"} className="h-4 w-4" />
        Tampilkan di situs publik
      </label>
      <Pesan state={state} />
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Menyimpan..." : awal ? "Simpan Perubahan" : "Tambah Praktikum"}
        </button>
        {awal && <Link href={`/admin/praktikum/${awal.id}`} className="btn btn-outline">Batal</Link>}
      </div>
    </form>
  );
}

export function FormJudul({
  praktikumId,
  awal,
}: {
  praktikumId: number;
  awal: { id: number; urutan: number; judul: string };
}) {
  const [state, action, pending] = useActionState(simpanJudul, {} as FormState);
  const v = state.values ?? { judul: awal.judul };
  const e = state.fieldErrors ?? {};

  return (
    <form action={action} className="card space-y-4 p-5">
      <h3 className="font-semibold">Ubah judul {awal.urutan}</h3>
      <input type="hidden" name="id" value={awal.id} />
      <div>
        <label htmlFor="j-judul" className="text-sm font-medium">Judul praktikum *</label>
        <input id="j-judul" name="judul" defaultValue={v.judul} required className="input mt-1.5" />
        <Galat pesan={e.judul} />
      </div>
      <Pesan state={state} />
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Menyimpan..." : "Simpan Judul"}
        </button>
        <Link href={`/admin/praktikum/${praktikumId}`} className="btn btn-outline">Batal</Link>
      </div>
    </form>
  );
}

export function FormTes({
  awal,
}: {
  awal: { id: number; durasiMenit: number; aktif: boolean };
}) {
  const [state, action, pending] = useActionState(simpanTes, {} as FormState);
  const v = state.values ?? {
    durasiMenit: String(awal.durasiMenit),
    aktif: awal.aktif ? "on" : "",
  };
  const e = state.fieldErrors ?? {};

  return (
    <form action={action} className="card space-y-4 p-5">
      <h3 className="font-semibold">Pengaturan tes</h3>
      <input type="hidden" name="id" value={awal.id} />
      <div>
        <label htmlFor="t-dur" className="text-sm font-medium">Durasi (menit) *</label>
        <input id="t-dur" name="durasiMenit" inputMode="numeric" required defaultValue={v.durasiMenit} className="input mt-1.5" />
        <p className="mt-1 text-xs text-muted-foreground">Dihitung sejak praktikan menekan tombol Mulai.</p>
        <Galat pesan={e.durasiMenit} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="aktif" defaultChecked={v.aktif === "on"} className="h-4 w-4" />
        Aktif (peserta bisa mengerjakan)
      </label>
      <Pesan state={state} />
      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? "Menyimpan..." : "Simpan"}
      </button>
    </form>
  );
}

const HURUF = ["A", "B", "C", "D", "E"];

export function FormSoal({
  tesId,
  awal,
}: {
  tesId: number;
  awal?: { id: number; pertanyaan: string; opsi: string[]; jawabanBenar: number };
}) {
  const [state, action, pending] = useActionState(simpanSoal, {} as FormState);
  const v: Record<string, string> =
    state.values ??
    {
      pertanyaan: awal?.pertanyaan ?? "",
      benar: awal ? String(awal.jawabanBenar) : "0",
      ...Object.fromEntries(HURUF.map((_, i) => [`opsi${i}`, awal?.opsi[i] ?? ""])),
    };
  const e = state.fieldErrors ?? {};

  return (
    <form action={action} className="card space-y-4 p-5">
      <h3 className="font-semibold">{awal ? "Ubah soal" : "Soal baru"}</h3>
      <input type="hidden" name="tesId" value={tesId} />
      {awal && <input type="hidden" name="id" value={awal.id} />}

      <div>
        <label htmlFor="s-tanya" className="text-sm font-medium">Pertanyaan *</label>
        <textarea id="s-tanya" name="pertanyaan" rows={3} defaultValue={v.pertanyaan} required className="input mt-1.5" />
        <Galat pesan={e.pertanyaan} />
      </div>

      <fieldset>
        <legend className="text-sm font-medium">Opsi jawaban (isi 2-5, tandai yang benar) *</legend>
        <div className="mt-2 space-y-2">
          {HURUF.map((h, i) => (
            <div key={h} className="flex items-center gap-2">
              <input
                type="radio"
                name="benar"
                value={i}
                defaultChecked={v.benar === String(i)}
                aria-label={`Jawaban benar: opsi ${h}`}
                className="h-4 w-4 shrink-0"
              />
              <span className="w-4 shrink-0 text-sm font-semibold">{h}</span>
              <input name={`opsi${i}`} defaultValue={v[`opsi${i}`]} aria-label={`Opsi ${h}`} className="input h-9" />
            </div>
          ))}
        </div>
        <Galat pesan={e.opsi} />
        <Galat pesan={e.benar} />
      </fieldset>

      <Pesan state={state} />
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Menyimpan..." : awal ? "Simpan Perubahan" : "Tambah Soal"}
        </button>
        {awal && <Link href={`/admin/praktikum/tes/${tesId}`} className="btn btn-outline">Batal</Link>}
      </div>
    </form>
  );
}
