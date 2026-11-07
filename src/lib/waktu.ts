const SEHARI = 24 * 60 * 60 * 1000;
const WIB = 7 * 60 * 60 * 1000;
const ZONA = "Asia/Jakarta";

/** Batas awal dan akhir "hari ini" menurut WIB, apa pun zona waktu servernya. */
export function rentangHariIni(sekarang: number) {
  const awal = Math.floor((sekarang + WIB) / SEHARI) * SEHARI - WIB;
  return { awal: new Date(awal), akhir: new Date(awal + SEHARI) };
}

/** Bulan WIB dari sebuah timestamp, format "2026-11". */
export function bulanWib(ms: number) {
  const d = new Date(ms + WIB);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Batas awal dan akhir sebuah bulan ("2026-11") menurut WIB. */
export function rentangBulan(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return {
    awal: new Date(Date.UTC(y, m - 1, 1) - WIB),
    akhir: new Date(Date.UTC(y, m, 1) - WIB),
  };
}

export function geserBulan(ym: string, delta: number) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

const fmtBulan = new Intl.DateTimeFormat("id-ID", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function namaBulan(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return fmtBulan.format(new Date(Date.UTC(y, m - 1, 1)));
}

const fmtKunci = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: ZONA,
});

/** Kunci tanggal WIB, format "2026-11-06", untuk pengelompokan per hari. */
export const kunciHari = (d: Date) => fmtKunci.format(d);

/** Date -> "2026-11-06T14:30" (jam dinding WIB) untuk <input type="datetime-local">. */
export function keInputWib(d: Date) {
  return new Date(d.getTime() + WIB).toISOString().slice(0, 16);
}

/** "2026-11-06T14:30" (dianggap WIB) -> Date, atau null jika tidak valid. */
export function dariInputWib(s: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) return null;
  const d = new Date(`${s}:00+07:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

const fmtJam = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: ZONA,
});

const fmtTanggal = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: ZONA,
});

const fmtTanggalPendek = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: ZONA,
});

export const formatJam = (d: Date) => fmtJam.format(d);
export const formatTanggal = (d: Date) => fmtTanggal.format(d);
export const formatTanggalPendek = (d: Date) => fmtTanggalPendek.format(d);