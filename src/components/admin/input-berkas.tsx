"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, FileText } from "lucide-react";

// Kolom unggah berkas: foto (JPG/PNG/WebP) atau PDF, lengkap dengan pratinjau dan opsi hapus.
// Server tetap memeriksa isi berkas; pemeriksaan di sini hanya agar galat muncul lebih cepat.

export function InputBerkas({
  nama,
  namaHapus,
  label,
  jenis,
  awalUrl,
  maksMB,
  galat,
  petunjuk,
}: {
  nama: string;
  namaHapus?: string;
  label: string;
  jenis: "gambar" | "pdf";
  awalUrl?: string | null;
  maksMB?: number;
  galat?: string;
  petunjuk?: string;
}) {
  const batas = maksMB ?? (jenis === "gambar" ? 8 : 10);
  const [pratinjau, setPratinjau] = useState<string | null>(null);
  const [namaBerkas, setNamaBerkas] = useState<string | null>(null);
  const [pesan, setPesan] = useState<string | null>(null);
  const [hapus, setHapus] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => () => { if (pratinjau) URL.revokeObjectURL(pratinjau); }, [pratinjau]);

  function pilih(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setPratinjau(null);
    setNamaBerkas(null);
    setPesan(null);
    if (!f) return;

    const bolehTipe =
      jenis === "gambar"
        ? ["image/jpeg", "image/png", "image/webp"].includes(f.type)
        : f.type === "application/pdf" || /\.pdf$/i.test(f.name);
    if (!bolehTipe) {
      setPesan(jenis === "gambar" ? "Format harus JPG, PNG, atau WebP." : "Format harus PDF.");
      e.target.value = "";
      return;
    }
    if (f.size > batas * 1024 * 1024) {
      setPesan(`Ukuran maksimal ${batas} MB.`);
      e.target.value = "";
      return;
    }
    setNamaBerkas(f.name);
    if (jenis === "gambar") setPratinjau(URL.createObjectURL(f));
    setHapus(false);
  }

  const id = `f-${nama}`;
  const accept = jenis === "gambar" ? "image/jpeg,image/png,image/webp" : "application/pdf,.pdf";
  const tampilLama = !!awalUrl && !pratinjau && !namaBerkas;

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">{label}</label>

      <div className="mt-1.5 flex flex-wrap items-center gap-3">
        {jenis === "gambar" && (pratinjau || (tampilLama && !hapus)) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pratinjau ?? awalUrl ?? ""}
            alt="Pratinjau"
            className="h-16 w-16 rounded-lg border border-border object-cover"
          />
        )}
        {jenis === "pdf" && namaBerkas && (
          <span className="inline-flex items-center gap-1.5 text-sm">
            <FileText className="h-4 w-4" /> {namaBerkas}
          </span>
        )}
        {jenis === "pdf" && tampilLama && !hapus && (
          <a href={awalUrl!} target="_blank" rel="noopener noreferrer" className="btn btn-outline h-8 px-3">
            <ExternalLink className="h-4 w-4" /> Lihat berkas saat ini
          </a>
        )}
      </div>

      <input
        ref={ref}
        id={id}
        name={nama}
        type="file"
        accept={accept}
        onChange={pilih}
        className="input mt-2 file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1 file:text-sm file:font-medium"
      />

      {awalUrl && (
        <label className="mt-2 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name={namaHapus ?? `hapus_${nama}`}
            checked={hapus}
            onChange={(e) => setHapus(e.target.checked)}
            className="h-4 w-4"
          />
          Hapus {jenis === "gambar" ? "foto" : "berkas"} saat ini
        </label>
      )}

      {(pesan || galat) && (
        <p role="alert" className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{pesan ?? galat}</p>
      )}
      {!pesan && !galat && (
        <p className="mt-1 text-xs text-muted-foreground">
          {petunjuk ?? (jenis === "gambar" ? `JPG, PNG, atau WebP, maks ${batas} MB.` : `PDF, maks ${batas} MB.`)}
        </p>
      )}
    </div>
  );
}