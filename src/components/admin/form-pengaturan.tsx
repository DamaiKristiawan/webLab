"use client";

import { useActionState } from "react";
import { simpanPengaturan } from "@/actions/pengaturan";
import type { FormState } from "@/lib/form";

const BAWAAN = "Belum diisi.";

function Bidang({
  nama,
  label,
  awal,
  baris,
  petunjuk,
}: {
  nama: string;
  label: string;
  awal: string;
  baris?: number;
  petunjuk?: string;
}) {
  const nilai = awal === BAWAAN ? "" : awal;
  return (
    <div>
      <label htmlFor={nama} className="text-sm font-medium">{label}</label>
      {baris ? (
        <textarea id={nama} name={nama} rows={baris} defaultValue={nilai} className="input mt-1.5" />
      ) : (
        <input id={nama} name={nama} defaultValue={nilai} className="input mt-1.5" />
      )}
      {petunjuk && <p className="mt-1 text-xs text-muted-foreground">{petunjuk}</p>}
    </div>
  );
}

export function FormPengaturan({ nilai }: { nilai: Record<string, string> }) {
  const [state, action, pending] = useActionState(simpanPengaturan, {} as FormState);
  const n = { ...nilai, ...(state.values ?? {}) };

  return (
    <form action={action} className="space-y-6">
      <div className="card space-y-4 p-5">
        <h2 className="font-semibold">Profil laboratorium</h2>
        <Bidang nama="visi" label="Visi" awal={n.visi ?? ""} baris={3} />
        <Bidang
          nama="misi"
          label="Misi"
          awal={n.misi ?? ""}
          baris={5}
          petunjuk="Satu poin per baris; akan tampil sebagai daftar."
        />
        <Bidang nama="sejarah" label="Sejarah singkat" awal={n.sejarah ?? ""} baris={6} />
      </div>

      <div className="card space-y-4 p-5">
        <h2 className="font-semibold">Kontak dan layanan</h2>
        <Bidang nama="alamat" label="Alamat" awal={n.alamat ?? ""} baris={2} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Bidang nama="email" label="Email" awal={n.email ?? ""} />
          <Bidang nama="telepon" label="Telepon / WhatsApp" awal={n.telepon ?? ""} />
        </div>
        <Bidang
          nama="jam_layanan"
          label="Jam layanan"
          awal={n.jam_layanan ?? ""}
          baris={3}
          petunjuk="Mis. Senin-Jumat, 08.00-16.00 WIB (satu baris per keterangan)."
        />
      </div>

      {state.error && (
        <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">{state.error}</p>
      )}
      {state.sukses && <p role="status" className="text-sm font-medium">{state.sukses}</p>}

      <button type="submit" disabled={pending} className="btn btn-primary btn-lg">
        {pending ? "Menyimpan..." : "Simpan Pengaturan"}
      </button>
    </form>
  );
}