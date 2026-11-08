import { randomInt } from "node:crypto";

const WIB = 7 * 60 * 60 * 1000;

/** "2026-11-07T14:30" (input datetime-local, dianggap WIB) -> Date UTC. null bila tidak valid. */
export function parseWib(teks: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(teks.trim());
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  const t = Date.UTC(y, mo - 1, d, h, mi) - WIB;
  const cek = new Date(t + WIB);
  // Tolak tanggal yang tidak nyata (mis. 31 Februari)
  if (cek.getUTCMonth() !== mo - 1 || cek.getUTCDate() !== d) return null;
  return new Date(t);
}

const HURUF = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // tanpa I, O, 0, 1

/** Contoh: LTD-20261107-K7QD */
export function buatKode() {
  const tgl = new Date(Date.now() + WIB).toISOString().slice(0, 10).replaceAll("-", "");
  let acak = "";
  for (let i = 0; i < 4; i++) acak += HURUF[randomInt(HURUF.length)];
  return `LTD-${tgl}-${acak}`;
}

export function rapikanKode(teks: string) {
  return teks.trim().toUpperCase().replace(/\s+/g, "");
}