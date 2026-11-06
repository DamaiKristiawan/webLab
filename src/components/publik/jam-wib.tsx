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
    <div className="card p-6">
      <p className="text-sm text-muted-foreground">
        {sekarang ? fmtTanggal.format(sekarang) : "\u00a0"}
      </p>
      <p className="mt-2 flex items-baseline font-bold leading-none tabular-nums">
        <span className="text-6xl sm:text-7xl">
          {jam}:{menit}
        </span>
        <span className="ml-1 text-2xl text-muted-foreground">:{detik}</span>
      </p>
      <p className="mt-3 text-sm text-muted-foreground">Waktu Indonesia Barat</p>
    </div>
  );
}