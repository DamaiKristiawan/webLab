const SEHARI = 24 * 60 * 60 * 1000;
const WIB = 7 * 60 * 60 * 1000;
const ZONA = "Asia/Jakarta";

/** Batas awal dan akhir "hari ini" menurut WIB, apa pun zona waktu servernya. */
export function rentangHariIni(sekarang: number) {
  const awal = Math.floor((sekarang + WIB) / SEHARI) * SEHARI - WIB;
  return { awal: new Date(awal), akhir: new Date(awal + SEHARI) };
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