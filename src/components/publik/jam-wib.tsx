"use client";

import { useEffect, useState } from "react";

const fmtJam = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: "Asia/Jakarta",
});

const fmtTanggal = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

// Dipakai di dalam panel chip (permukaan "ink"), jadi warna mengikuti permukaan itu.
export function JamWib() {
  const [sekarang, setSekarang] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setSekarang(new Date());
    const awal = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(awal);
      clearInterval(id);
    };
  }, []);

  const [jam, menit, detik] = sekarang ? fmtJam.format(sekarang).split(".") : ["--", "--", "--"];

  return (
    <div>
      <p className="label-mono">{sekarang ? fmtTanggal.format(sekarang) : "\u00a0"}</p>
      <p className="my-2 flex items-baseline font-extrabold leading-none tracking-tighter tabular-nums">
        <span className="text-5xl sm:text-6xl lg:text-7xl">
          {jam}:{menit}
        </span>
        <span className="ml-1 text-2xl font-semibold text-ink-muted">:{detik}</span>
      </p>
      <p className="label-mono">Waktu Indonesia Barat</p>
    </div>
  );
}