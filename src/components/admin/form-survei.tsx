"use client";

import Link from "next/link";
import { useActionState } from "react";
import { bukaPeriodeBaru, buatKuesionerStandar, simpanPertanyaan, simpanSurvei } from "@/actions/survei";
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

// ---------- Membuat keempat kuesioner standar untuk satu tahun ----------

export function FormBuatStandar({ tahunAwal }: { tahunAwal: number }) {
  const [state, action, pending] = useActionState(buatKuesionerStandar, {} as FormState);

  return (
    <form action={action} className="card space-y-3 p-5">
      <div>
        <h3 className="font-semibold">Buat 4 kuesioner standar</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Kepuasan Pengguna, Pengguna, Praktikum, dan Penelitian, lengkap dengan pertanyaannya. Yang sudah ada untuk tahun
          itu dilewati.
        </p>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="bs-tahun" className="text-sm font-medium">Tahun</label>
          <input
            id="bs-tahun"
            name="tahun"
            inputMode="numeric"
            defaultValue={state.values?.tahun ?? String(tahunAwal)}
            className="input mt-1.5 w-28"
          />
        </div>
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Membuat..." : "Buat kuesioner"}
        </button>
      </div>
      <Pesan state={state} />
    </form>
  );
}

// ---------- Periode baru (salin dari kuesioner ini) ----------

export function FormPeriodeBaru({ id, tahunSaran }: { id: number; tahunSaran: number }) {
  const [state, action, pending] = useActionState(bukaPeriodeBaru, {} as FormState);

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm("Buka periode baru? Periode ini akan ditutup dan jawabannya tetap tersimpan sebagai riwayat.")) {
          e.preventDefault();
        }
      }}
      className="card space-y-3 p-5"
    >
      <div>
        <h3 className="font-semibold">Buka periode baru</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Menyalin pertanyaan kuesioner ini ke tahun baru dan menutup periode lama. Jawaban lama tidak dihapus, dan NPM
          yang sama bisa mengisi lagi di periode baru.
        </p>
      </div>
      <input type="hidden" name="id" value={id} />
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor={`pb-tahun-${id}`} className="text-sm font-medium">Tahun baru</label>
          <input
            id={`pb-tahun-${id}`}
            name="tahun"
            inputMode="numeric"
            defaultValue={state.values?.tahun ?? String(tahunSaran)}
            className="input mt-1.5 w-28"
          />
        </div>
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Membuka..." : "Buka periode"}
        </button>
      </div>
      <Pesan state={state} />
    </form>
  );
}

// ---------- Pengaturan kuesioner ----------

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
      <h3 className="font-semibold">Pengaturan kuesioner</h3>
      <input type="hidden" name="id" value={awal.id} />
      <div>
        <label htmlFor="sv-judul" className="text-sm font-medium">Judul *</label>
        <input id="sv-judul" name="judul" defaultValue={v.judul} required className="input mt-1.5" />
        <Galat pesan={e.judul} />
      </div>
      <div>
        <label htmlFor="sv-des" className="text-sm font-medium">Pengantar</label>
        <textarea id="sv-des" name="deskripsi" rows={3} defaultValue={v.deskripsi} className="input mt-1.5" />
        <Galat pesan={e.deskripsi} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="aktif" defaultChecked={v.aktif === "on"} className="h-4 w-4" />
        Kuesioner dibuka untuk umum
      </label>
      <Pesan state={state} />
      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? "Menyimpan..." : "Simpan"}
      </button>
    </form>
  );
}

// ---------- Pertanyaan ----------

export function FormPertanyaan({
  surveiId,
  awal,
}: {
  surveiId: number;
  awal?: { id: number; teks: string; tipe: "SKALA" | "TEKS"; kelompok: string | null; urutan: number };
}) {
  const [state, action, pending] = useActionState(simpanPertanyaan, {} as FormState);
  const v = state.values ?? {
    teks: awal?.teks ?? "",
    tipe: awal?.tipe ?? "SKALA",
    kelompok: awal?.kelompok ?? "",
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
      <div>
        <label htmlFor="pq-kel" className="text-sm font-medium">Dimensi / kelompok</label>
        <input
          id="pq-kel"
          name="kelompok"
          defaultValue={v.kelompok}
          placeholder="Mis. Empati (pertanyaan sekelompok tampil berdampingan)"
          className="input mt-1.5"
        />
        <Galat pesan={e.kelompok} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="pq-tipe" className="text-sm font-medium">Jenis jawaban</label>
          <select id="pq-tipe" name="tipe" defaultValue={v.tipe} className="input mt-1.5">
            <option value="SKALA">Bintang 1-5</option>
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
        {awal && <Link href={`/admin/survei/${surveiId}`} className="btn btn-outline">Batal</Link>}
      </div>
    </form>
  );
}