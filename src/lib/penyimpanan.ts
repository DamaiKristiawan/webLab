import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

// Satu-satunya tempat yang tahu di mana berkas disimpan. Untuk pindah ke penyimpanan lain
// (mis. S3/MinIO), cukup ganti isi simpanBerkas dan bacaBerkas.

export const MAKS_BYTE = 5 * 1024 * 1024;

const TIPE = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
} as const;
type Ekstensi = keyof typeof TIPE;

function akar() {
  return path.resolve(process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads"));
}

// Jenis berkas ditentukan dari isinya (magic bytes), bukan dari nama atau tipe kiriman browser.
function deteksi(b: Buffer): Ekstensi | null {
  if (b.length >= 5 && b.subarray(0, 5).toString("latin1") === "%PDF-") return "pdf";
  if (b.length >= 4 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "png";
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  return null;
}

export type BerkasValid = { buffer: Buffer; ekstensi: Ekstensi };

export async function periksaBerkas(file: File): Promise<{ error: string } | BerkasValid> {
  if (file.size > MAKS_BYTE) return { error: "Ukuran berkas maksimal 5 MB." };
  const buffer = Buffer.from(await file.arrayBuffer());
  const ekstensi = deteksi(buffer);
  if (!ekstensi) return { error: "Format berkas harus PDF, JPG, atau PNG." };
  return { buffer, ekstensi };
}

/** Mengembalikan kunci berkas (disimpan di kolom buktiUrl). */
export async function simpanBerkas({ buffer, ekstensi }: BerkasValid) {
  const sekarang = new Date();
  const tahun = String(sekarang.getUTCFullYear());
  const bulan = String(sekarang.getUTCMonth() + 1).padStart(2, "0");
  const kunci = `${tahun}/${bulan}/${randomUUID()}.${ekstensi}`;

  const tujuan = path.join(akar(), kunci);
  await mkdir(path.dirname(tujuan), { recursive: true });
  await writeFile(tujuan, buffer);
  return kunci;
}

const POLA_KUNCI = /^\d{4}\/\d{2}\/[0-9a-f-]{36}\.(pdf|png|jpg)$/;

export async function bacaBerkas(kunci: string) {
  if (!POLA_KUNCI.test(kunci)) return null; // mencegah path traversal
  try {
    const data = await readFile(path.join(akar(), kunci));
    const ekstensi = kunci.split(".").pop() as Ekstensi;
    return { data, ekstensi, mime: TIPE[ekstensi] };
  } catch {
    return null;
  }
}