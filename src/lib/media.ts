import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

// Penyimpanan berkas publik: foto (dokumentasi, anggota, dll) dan PDF (modul, template surat).
// Berbeda dari berkas bukti pengajuan (lib/penyimpanan.ts, privat), berkas ini disajikan lewat /media/...
// Jenis berkas ditentukan dari isinya (magic bytes), bukan dari nama atau tipe kiriman browser.
// Untuk pindah ke penyimpanan lain, ganti isi fungsi di sini.

export const MAKS_FOTO_BYTE = 8 * 1024 * 1024;
export const MAKS_PDF_BYTE = 10 * 1024 * 1024;

const TIPE = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  pdf: "application/pdf",
} as const;
export type EkstensiMedia = keyof typeof TIPE;
export type EkstensiGambar = Exclude<EkstensiMedia, "pdf">;

function akar() {
  return path.resolve(process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads"), "media");
}

function deteksi(b: Buffer): EkstensiMedia | null {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b.length >= 4 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "png";
  if (
    b.length >= 12 &&
    b.subarray(0, 4).toString("latin1") === "RIFF" &&
    b.subarray(8, 12).toString("latin1") === "WEBP"
  ) {
    return "webp";
  }
  if (b.length >= 5 && b.subarray(0, 5).toString("latin1") === "%PDF-") return "pdf";
  return null;
}

// ---------- Foto ----------

export type GambarValid = { buffer: Buffer; ekstensi: EkstensiGambar };

export async function periksaGambar(file: File): Promise<{ error: string } | GambarValid> {
  if (file.size > MAKS_FOTO_BYTE) return { error: "Ukuran foto maksimal 8 MB." };
  const buffer = Buffer.from(await file.arrayBuffer());
  const ekstensi = deteksi(buffer);
  if (!ekstensi || ekstensi === "pdf") return { error: "Format foto harus JPG, PNG, atau WebP." };
  return { buffer, ekstensi };
}

// ---------- PDF ----------

export type PdfValid = { buffer: Buffer; ekstensi: "pdf" };

export async function periksaPdf(file: File): Promise<{ error: string } | PdfValid> {
  if (file.size > MAKS_PDF_BYTE) return { error: "Ukuran berkas maksimal 10 MB." };
  const buffer = Buffer.from(await file.arrayBuffer());
  if (deteksi(buffer) !== "pdf") return { error: "Berkas harus berformat PDF." };
  return { buffer, ekstensi: "pdf" };
}

// ---------- Simpan, baca, hapus ----------

/** Mengembalikan alamat publik, mis. /media/2026/11/xxxx.jpg */
export async function simpanGambar({ buffer, ekstensi }: GambarValid | PdfValid) {
  const sekarang = new Date();
  const tahun = String(sekarang.getUTCFullYear());
  const bulan = String(sekarang.getUTCMonth() + 1).padStart(2, "0");
  const rel = `${tahun}/${bulan}/${randomUUID()}.${ekstensi}`;

  const tujuan = path.join(akar(), rel);
  await mkdir(path.dirname(tujuan), { recursive: true });
  await writeFile(tujuan, buffer);
  return `/media/${rel}`;
}
export const simpanPdf = simpanGambar;

const POLA = /^\d{4}\/\d{2}\/[0-9a-f-]{36}\.(jpg|png|webp|pdf)$/;

export async function bacaGambar(rel: string) {
  if (!POLA.test(rel)) return null; // mencegah path traversal
  try {
    const data = await readFile(path.join(akar(), rel));
    return { data, mime: TIPE[rel.split(".").pop() as EkstensiMedia] };
  } catch {
    return null;
  }
}

/** Menghapus berkas dari alamat publiknya. Alamat luar (https://...) dan galat diabaikan. */
export async function hapusGambar(url: string | null | undefined) {
  if (!url || !url.startsWith("/media/")) return;
  const rel = url.slice("/media/".length);
  if (!POLA.test(rel)) return;
  try {
    await unlink(path.join(akar(), rel));
  } catch {}
}
export const hapusMedia = hapusGambar;