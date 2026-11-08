"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";
import {
  kirimTes,
  mulaiTes,
  type KirimState,
  type MulaiState,
  type SoalPublik,
} from "@/actions/kerjakan-tes";
import { cn } from "@/lib/utils";

const HURUF = ["A", "B", "C", "D", "E"];

function format(detik: number) {
  const m = Math.floor(detik / 60);
  const s = detik % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function kunciSimpan(tesId: number, npm: string) {
  return `jawaban:${tesId}:${npm}`;
}

function bacaSimpan(kunci: string): Record<string, string> {
  try {
    const mentah = window.localStorage.getItem(kunci);
    return mentah ? (JSON.parse(mentah) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function Pengerjaan({
  tesId,
  slug,
  jenis,
  npm,
  soal,
  sisaDetik,
}: {
  tesId: number;
  slug: string;
  jenis: "PRETEST" | "POSTEST";
  npm: string;
  soal: SoalPublik[];
  sisaDetik: number;
}) {
  const [state, aksi, pending] = useActionState(kirimTes, {} as KirimState);
  const [akhir] = useState(() => Date.now() + sisaDetik * 1000);
  const [sisa, setSisa] = useState(sisaDetik);
  const kunci = kunciSimpan(tesId, npm);
  const [jawab, setJawab] = useState<Record<string, string>>(() => bacaSimpan(kunci));
  const sudahKirim = useRef(false);
  const terkirim = !!state.terkirim;

  function kirim(otomatis: boolean) {
    if (sudahKirim.current || pending) return;
    const kosong = soal.filter((s) => jawab[String(s.id)] === undefined).length;
    if (!otomatis && kosong > 0) {
      const ok = window.confirm(`Masih ada ${kosong} soal yang belum dijawab. Kirim sekarang?`);
      if (!ok) return;
    }
    sudahKirim.current = true;
    const fd = new FormData();
    fd.set("tesId", String(tesId));
    fd.set("npm", npm);
    for (const s of soal) {
      const nilai = jawab[String(s.id)];
      if (nilai !== undefined) fd.set(`j_${s.id}`, nilai);
    }
    startTransition(() => aksi(fd));
  }

  const kirimRef = useRef(kirim);
  useEffect(() => {
    kirimRef.current = kirim;
  });

  useEffect(() => {
    if (state.error) sudahKirim.current = false;
  }, [state]);

  useEffect(() => {
    if (terkirim) return;
    const id = setInterval(() => {
      const s = Math.max(0, Math.ceil((akhir - Date.now()) / 1000));
      setSisa(s);
      if (s === 0) {
        clearInterval(id);
        kirimRef.current(true);
      }
    }, 500);
    return () => clearInterval(id);
  }, [akhir, terkirim]);

  useEffect(() => {
    try {
      if (terkirim) window.localStorage.removeItem(kunci);
      else window.localStorage.setItem(kunci, JSON.stringify(jawab));
    } catch {}
  }, [jawab, kunci, terkirim]);

  useEffect(() => {
    if (terkirim) return;
    const cegah = (ev: BeforeUnloadEvent) => {
      ev.preventDefault();
    };
    window.addEventListener("beforeunload", cegah);
    return () => window.removeEventListener("beforeunload", cegah);
  }, [terkirim]);

  if (terkirim) {
    return (
      <div className="surface-ink rounded-3xl p-8 text-center sm:p-12">
        <p className="label-mono">{jenis === "PRETEST" ? "Pretest" : "Postest"}</p>
        <p className="mt-4 text-3xl font-extrabold tracking-tighter sm:text-4xl">Jawaban terkirim</p>
        <p className="mt-4 text-ink-muted">
          Terima kasih. Jawabanmu sudah tercatat dan nilai akan disampaikan oleh asisten.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href={`/praktikum/${slug}`}
            className="btn h-12 rounded-xl border border-ink-foreground/40 px-6 text-base font-semibold text-ink-foreground hover:bg-ink-foreground/10"
          >
            Kembali ke praktikum
          </Link>
        </div>
      </div>
    );
  }

  const terjawab = soal.filter((s) => jawab[String(s.id)] !== undefined).length;

  return (
    <div className="space-y-6">
      <div className="surface-ink sticky top-[76px] z-20 flex items-center justify-between rounded-xl px-4 py-3 text-sm">
        <span className="flex items-center gap-2 font-semibold">
          <Clock className="h-4 w-4" />
          Sisa waktu
        </span>
        <span className={cn("font-mono text-lg font-bold tabular-nums", sisa <= 60 && "animate-pulse-dot")}>
          {format(sisa)}
        </span>
      </div>

      <ol className="space-y-4">
        {soal.map((s, i) => (
          <li key={s.id} className="card p-5">
            <div className="flex gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-foreground text-xs font-bold">
                {i + 1}
              </span>
              <fieldset className="min-w-0 flex-1">
                <legend className="whitespace-pre-line text-sm font-medium">{s.pertanyaan}</legend>
                <div className="mt-3 space-y-2">
                  {s.opsi.map((o, k) => (
                    <label
                      key={k}
                      className="flex cursor-pointer items-start gap-3 rounded-lg border border-border px-3 py-2.5 text-sm transition-colors hover:bg-muted has-[:checked]:border-foreground has-[:checked]:bg-muted"
                    >
                      <input
                        type="radio"
                        name={`j_${s.id}`}
                        value={k}
                        checked={jawab[String(s.id)] === String(k)}
                        onChange={() => setJawab((p) => ({ ...p, [String(s.id)]: String(k) }))}
                        className="mt-0.5 h-4 w-4 shrink-0"
                      />
                      <span className="w-4 shrink-0 font-semibold">{HURUF[k]}.</span>
                      <span className="min-w-0 break-words">{o}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          </li>
        ))}
      </ol>

      {state.error && (
        <p role="alert" className="rounded-xl border border-red-500/40 p-3 text-sm font-medium text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button type="button" onClick={() => kirim(false)} disabled={pending} className="btn btn-primary btn-lg">
          {pending ? "Mengirim..." : "Kirim Jawaban"}
        </button>
        <p className="text-sm text-muted-foreground">
          Terjawab {terjawab} dari {soal.length}
        </p>
      </div>
    </div>
  );
}

export function FormTesPublik({
  tesId,
  slug,
  jenis,
  durasiMenit,
  jumlahSoal,
}: {
  tesId: number;
  slug: string;
  jenis: "PRETEST" | "POSTEST";
  durasiMenit: number;
  jumlahSoal: number;
}) {
  const [state, aksi, pending] = useActionState(mulaiTes, {} as MulaiState);
  const v = state.values ?? {};
  const e = state.fieldErrors ?? {};
  const nama = jenis === "PRETEST" ? "Pretest" : "Postest";

  if (state.sesi) {
    return (
      <Pengerjaan
        tesId={tesId}
        slug={slug}
        jenis={jenis}
        npm={state.sesi.npm}
        soal={state.sesi.soal}
        sisaDetik={state.sesi.sisaDetik}
      />
    );
  }

  return (
    <form action={aksi} className="space-y-6">
      <input type="hidden" name="tesId" value={tesId} />

      <section className="card space-y-4 p-5 sm:p-6">
        <div>
          <p className="label-mono">Data peserta</p>
          <p className="mt-1 text-sm text-muted-foreground">Tidak perlu login, cukup isi nama dan NPM.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="namaPeserta" className="text-sm font-medium">Nama lengkap *</label>
            <input id="namaPeserta" name="namaPeserta" defaultValue={v.namaPeserta ?? ""} required className="input mt-1.5" />
            {e.namaPeserta && <p role="alert" className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{e.namaPeserta}</p>}
          </div>
          <div>
            <label htmlFor="npm" className="text-sm font-medium">NPM / NIM *</label>
            <input id="npm" name="npm" defaultValue={v.npm ?? ""} required className="input mt-1.5" />
            {e.npm && <p role="alert" className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{e.npm}</p>}
          </div>
        </div>
        <div>
          <label htmlFor="kode" className="text-sm font-medium">Kode akses *</label>
          <input
            id="kode"
            name="kode"
            required
            autoComplete="off"
            maxLength={10}
            className="input mt-1.5 font-mono uppercase tracking-widest sm:max-w-xs"
          />
          <p className="mt-1 text-xs text-muted-foreground">Minta kode kepada asisten saat sesi tes dimulai.</p>
        </div>
      </section>

      <section className="card space-y-3 p-5 sm:p-6">
        <p className="font-semibold">Sebelum memulai</p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>{jumlahSoal} soal pilihan ganda.</li>
          <li>Waktu {durasiMenit} menit, dihitung sejak tombol Mulai ditekan dan tidak berhenti walau halaman ditutup.</li>
          <li>Jawaban terkirim otomatis saat waktu habis.</li>
          <li>Tes hanya dapat dikerjakan satu kali dan tidak bisa diulang.</li>
          <li>Nilai tidak ditampilkan; asisten yang akan menyampaikannya.</li>
        </ul>
        {state.error && (
          <p role="alert" className="rounded-xl border border-red-500/40 p-3 text-sm font-medium text-red-600 dark:text-red-400">
            {state.error}
          </p>
        )}
        <button type="submit" disabled={pending} className="btn btn-primary btn-lg">
          {pending ? "Memulai..." : `Mulai ${nama}`}
        </button>
      </section>
    </form>
  );
}
