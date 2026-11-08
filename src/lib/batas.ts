import { headers } from "next/headers";

// Pembatas laju sederhana di memori. Cukup untuk satu proses server;
// hitungan kembali nol saat server dimulai ulang.
const catatan = new Map<string, number[]>();

/** true = boleh lanjut. Setiap panggilan yang lolos dihitung. */
export function batasi(kunci: string, maks: number, jendelaMs: number) {
  const sekarang = Date.now();
  const daftar = (catatan.get(kunci) ?? []).filter((t) => sekarang - t < jendelaMs);
  if (daftar.length >= maks) {
    catatan.set(kunci, daftar);
    return false;
  }
  daftar.push(sekarang);
  catatan.set(kunci, daftar);

  if (catatan.size > 5000) {
    for (const [k, v] of catatan) {
      if (v.every((t) => sekarang - t >= jendelaMs)) catatan.delete(k);
    }
  }
  return true;
}

export const IP_TAK_DIKENAL = "tak-dikenal";

/** IP pengunjung dari header proxy (Nginx harus meneruskan X-Forwarded-For). */
export async function ambilIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || IP_TAK_DIKENAL;
}