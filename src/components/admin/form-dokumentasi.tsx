"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { simpanDokumentasi } from "@/actions/dokumentasi";
import type { FormState } from "@/lib/form";

// Mengecilkan foto di browser sebelum diunggah (sisi terpanjang maks 1800 px, JPEG).
// Bila gagal, berkas asli yang dikirim.
async function kompres(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bmp = await createImageBitmap(file);
    const skala = Math.min(1, 1800 / Math.max(bmp.width, bmp.height));
    if (skala === 1 && file.size < 1.5 * 1024 * 1024) return file;

    const w = Math.round(bmp.width * skala);
    const h = Math.round(bmp.height * skala);
    const kanvas = document.createElement("canvas");
    kanvas.width = w;
    kanvas.height = h;
    const ctx = kanvas.getContext("2d");
    if (!ctx) return file;
    ctx.fillStyle = "#ffffff"; // PNG transparan tidak menjadi hitam
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bmp, 0, 0, w, h);

    const blob: Blob | null = await new Promise((r) => kanvas.toBlob(r, "image/jpeg", 0.85));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], `${file.name.replace(/\.\w+$/, "")}.jpg`, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

function Galat({ pesan }: { pesan?: string }) {
  return pesan ? <p role="alert" className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{pesan}</p> : null;
}

export function FormDokumentasi({
  awal,
  tanggalAwal,
}: {
  awal?: { id: number; judul: string; ringkasan: string | null; isi: string | null; terbit: boolean };
  tanggalAwal: string;
}) {
  const [state, action, pending] = useActionState(simpanDokumentasi, {} as FormState);
  const [memproses, setMemproses] = useState(false);
  const fotoRef = useRef<HTMLInputElement>(null);

  const v = state.values ?? {
    judul: awal?.judul ?? "",
    ringkasan: awal?.ringkasan ?? "",
    isi: awal?.isi ?? "",
    tanggal: tanggalAwal,
    terbit: awal ? (awal.terbit ? "on" : "") : "on",
  };
  const e = state.fieldErrors ?? {};
  const sibuk = pending || memproses;

  // Setelah tersimpan, kosongkan pilihan foto agar tidak terunggah dua kali
  useEffect(() => {
    if (state.sukses && fotoRef.current) fotoRef.current.value = "";
  }, [state]);

  async function kirim(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (sibuk) return;
    const form = ev.currentTarget;
    setMemproses(true);
    const fd = new FormData(form);
    const berkas = fd.getAll("foto").filter((f): f is File => f instanceof File && f.size > 0);
    fd.delete("foto");
    for (const b of berkas) fd.append("foto", await kompres(b));
    setMemproses(false);
    startTransition(() => action(fd));
  }

  return (
    <form onSubmit={kirim} className="card space-y-4 p-5 sm:p-6">
      {awal && <input type="hidden" name="id" value={awal.id} />}

      <div>
        <label htmlFor="d-judul" className="text-sm font-medium">Judul kegiatan *</label>
        <input id="d-judul" name="judul" defaultValue={v.judul} required className="input mt-1.5" />
        <Galat pesan={e.judul} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="d-tgl" className="text-sm font-medium">Tanggal kegiatan *</label>
          <input id="d-tgl" name="tanggal" type="date" defaultValue={v.tanggal} required className="input mt-1.5" />
          <Galat pesan={e.tanggal} />
        </div>
        <label className="flex items-center gap-2 self-end pb-2.5 text-sm">
          <input type="checkbox" name="terbit" defaultChecked={v.terbit === "on"} className="h-4 w-4" />
          Tampilkan di situs publik
        </label>
      </div>

      <div>
        <label htmlFor="d-ring" className="text-sm font-medium">Ringkasan</label>
        <input id="d-ring" name="ringkasan" defaultValue={v.ringkasan} placeholder="Satu kalimat untuk kartu daftar" className="input mt-1.5" />
        <Galat pesan={e.ringkasan} />
      </div>

      <div>
        <label htmlFor="d-isi" className="text-sm font-medium">Uraian kegiatan</label>
        <textarea id="d-isi" name="isi" rows={8} defaultValue={v.isi} className="input mt-1.5" />
        <Galat pesan={e.isi} />
      </div>

      <div>
        <label htmlFor="d-foto" className="text-sm font-medium">
          {awal ? "Tambah foto" : "Foto"} (JPG, PNG, atau WebP, maks 12 sekali unggah)
        </label>
        <input
          ref={fotoRef}
          id="d-foto"
          name="foto"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="input mt-1.5 file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1 file:text-sm file:font-medium"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Foto dikecilkan otomatis sebelum diunggah. Foto pertama menjadi sampul.
        </p>
      </div>

      {state.error && (
        <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">{state.error}</p>
      )}
      {state.sukses && <p role="status" className="text-sm font-medium">{state.sukses}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={sibuk} className="btn btn-primary">
          {memproses ? "Menyiapkan foto..." : pending ? "Menyimpan..." : awal ? "Simpan Perubahan" : "Buat Kegiatan"}
        </button>
        <Link href="/admin/dokumentasi" className="btn btn-outline">Kembali</Link>
      </div>
    </form>
  );
}