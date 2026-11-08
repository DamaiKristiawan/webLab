"use client";

import Link from "next/link";
import { useActionState } from "react";
import { simpanPertanyaan, simpanSurvei } from "@/actions/survei";
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

export function FormSurvei({
  awal,
}: {
  awal: { id: number; judul: string; deskripsi: string | null; aktif: boolean };
}) {
  const [state, action, pending] = useActionState(simpanSurvei, {} as FormState);
  const v = state.values ?? {
    judul: awal.judul,
    deskripsi: awal.deskripsi ?? "",
    aktif: awal.aktif ? "on" : "",
  };
  const e = state.fieldErrors ?? {};

  return (
    <form action={action} className="card space-y-4 p-5">
      <h3 className="font-semibold">Pengaturan survei</h3>
      <input type="hidden" name="id" value={awal.id} />
      <div>
        <label htmlFor="sv-judul" className="text-sm font-medium">Judul *</label>
        <input id="sv-judul" name="judul" defaultValue={v.judul} required className="input mt-1.5" />
        <Galat pesan={e.judul} />
      </div>
      <div>
        <label htmlFor="sv-des" className="text-sm font-medium">Pengantar</label>
        <textarea id="sv-des" name="deskripsi" rows={2} defaultValue={v.deskripsi} className="input mt-1.5" />
        <Galat pesan={e.deskripsi} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="aktif" defaultChecked={v.aktif === "on"} className="h-4 w-4" />
        Survei dibuka untuk umum
      </label>
      <Pesan state={state} />
      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? "Menyimpan..." : "Simpan"}
      </button>
    </form>
  );
}

export function FormPertanyaan({
  surveiId,
  awal,
}: {
  surveiId: number;
  awal?: { id: number; teks: string; tipe: "SKALA" | "TEKS"; urutan: number };
}) {
  const [state, action, pending] = useActionState(simpanPertanyaan, {} as FormState);
  const v = state.values ?? {
    teks: awal?.teks ?? "",
    tipe: awal?.tipe ?? "SKALA",
    urutan: awal ? String(awal.urutan) : "",
  };
  const e = state.fieldErrors ?? {};

  return (
    <form action={action} className="card space-y-4 p-5">
      <h3 className="font-semibold">{awal ? "Ubah pertanyaan" : "Pertanyaan baru"}</h3>
      <input type="hidden" name="surveiId" value={surveiId} />
      {awal && <input type="hidden" name="id" value={awal.id} />}
      <div>
        <label htmlFor="pq-teks" className="text-sm font-medium">Pertanyaan *</label>
        <textarea id="pq-teks" name="teks" rows={2} defaultValue={v.teks} required className="input mt-1.5" />
        <Galat pesan={e.teks} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="pq-tipe" className="text-sm font-medium">Jenis jawaban</label>
          <select id="pq-tipe" name="tipe" defaultValue={v.tipe} className="input mt-1.5">
            <option value="SKALA">Skala 1-5</option>
            <option value="TEKS">Isian teks</option>
          </select>
          <Galat pesan={e.tipe} />
        </div>
        <div>
          <label htmlFor="pq-urut" className="text-sm font-medium">Urutan</label>
          <input id="pq-urut" name="urutan" inputMode="numeric" placeholder="Kosong = akhir" defaultValue={v.urutan} className="input mt-1.5" />
          <Galat pesan={e.urutan} />
        </div>
      </div>
      <Pesan state={state} />
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Menyimpan..." : awal ? "Simpan Perubahan" : "Tambah Pertanyaan"}
        </button>
        {awal && <Link href="/admin/survei" className="btn btn-outline">Batal</Link>}
      </div>
    </form>
  );
}