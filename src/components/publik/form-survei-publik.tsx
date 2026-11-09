"use client";

import { startTransition, useActionState, useState } from "react";
import { CheckCircle2, Star } from "lucide-react";
import { kirimSurvei } from "@/actions/kirim-survei";
import type { FormState } from "@/lib/form";
import { LABEL_SKALA } from "@/lib/kuesioner";
import { cn } from "@/lib/utils";

type Pertanyaan = { id: number; teks: string; tipe: "SKALA" | "TEKS"; kelompok: string | null };

function Bintang({
  teks,
  nilai,
  onPilih,
}: {
  teks: string;
  nilai: number | undefined;
  onPilih: (n: number) => void;
}) {
  return (
    <div role="radiogroup" aria-label={teks} className="mt-4 grid max-w-md grid-cols-5 gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={nilai === n}
          aria-label={`${n}: ${LABEL_SKALA[n - 1]}`}
          onClick={() => onPilih(n)}
          className="flex flex-col items-center gap-1.5 rounded-lg py-2 transition-colors hover:bg-muted focus-visible:outline-2"
        >
          <span className="text-xs text-muted-foreground">{n}</span>
          <Star
            className={cn(
              "h-8 w-8 transition-colors",
              nilai !== undefined && n <= nilai ? "fill-amber-400 text-amber-400" : "text-muted-foreground/60",
            )}
          />
        </button>
      ))}
    </div>
  );
}

export function FormSurveiPublik({ surveiId, pertanyaan }: { surveiId: number; pertanyaan: Pertanyaan[] }) {
  const [state, action, pending] = useActionState(kirimSurvei, {} as FormState);
  const [nilai, setNilai] = useState<Record<number, number>>({});
  const e = state.fieldErrors ?? {};
  const v = state.values ?? {};

  const skala = pertanyaan.filter((p) => p.tipe === "SKALA");
  const terjawab = skala.filter((p) => nilai[p.id] !== undefined).length;

  if (state.sukses) {
    return (
      <div className="surface-ink rounded-3xl p-10 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10" />
        <p className="mt-4 text-2xl font-extrabold tracking-tight">{state.sukses}</p>
        <p className="mt-2 text-sm text-ink-muted">Terima kasih sudah membantu kami meningkatkan layanan.</p>
      </div>
    );
  }

  // Pertanyaan berurutan dengan dimensi yang sama ditampilkan dalam satu kelompok
  const bagian: { judul: string | null; butir: { p: Pertanyaan; no: number }[] }[] = [];
  pertanyaan.forEach((p, i) => {
    const akhir = bagian[bagian.length - 1];
    if (akhir && akhir.judul === p.kelompok) akhir.butir.push({ p, no: i + 1 });
    else bagian.push({ judul: p.kelompok, butir: [{ p, no: i + 1 }] });
  });

  // Dikirim lewat startTransition agar jawaban tidak terhapus saat ada pesan galat
  function kirim(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (pending) return;
    const fd = new FormData(ev.currentTarget);
    startTransition(() => action(fd));
  }

  return (
    <form onSubmit={kirim} className="space-y-6">
      <input type="hidden" name="surveiId" value={surveiId} />

      {/* Jebakan bot */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <section className="card space-y-4 p-5 sm:p-6">
        <p className="label-mono">Data pengisi</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="namaPeserta" className="text-sm font-medium">Nama lengkap *</label>
            <input
              id="namaPeserta"
              name="namaPeserta"
              defaultValue={v.namaPeserta ?? ""}
              autoComplete="name"
              required
              className="input mt-1.5"
            />
            {e.namaPeserta && (
              <p role="alert" className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{e.namaPeserta}</p>
            )}
          </div>
          <div>
            <label htmlFor="npm" className="text-sm font-medium">NPM / NIM *</label>
            <input id="npm" name="npm" defaultValue={v.npm ?? ""} required className="input mt-1.5" />
            {e.npm && <p role="alert" className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{e.npm}</p>}
          </div>
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <p className="label-mono">Skala penilaian</p>
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          {LABEL_SKALA.map((l, i) => (
            <li key={l}>
              <span className="font-bold">({i + 1})</span> {l}
            </li>
          ))}
        </ul>
      </section>

      {bagian.map((b, bi) => (
        <section key={bi} className="space-y-4">
          {b.judul && (
            <h2 className="surface-ink rounded-xl px-5 py-3 text-base font-bold tracking-tight">{b.judul}</h2>
          )}
          <ol className="space-y-4">
            {b.butir.map(({ p, no }) => (
              <li key={p.id} className="card p-5 sm:p-6">
                <div className="flex gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-foreground text-xs font-bold">
                    {no}
                  </span>
                  <fieldset className="min-w-0 flex-1">
                    <legend className="text-sm font-medium leading-relaxed">
                      {p.teks}
                      {p.tipe === "SKALA" && <span className="ml-1 text-red-600 dark:text-red-400">*</span>}
                    </legend>

                    {p.tipe === "SKALA" ? (
                      <>
                        <Bintang
                          teks={p.teks}
                          nilai={nilai[p.id]}
                          onPilih={(n) => setNilai((s) => ({ ...s, [p.id]: n }))}
                        />
                        <input type="hidden" name={`q_${p.id}`} value={nilai[p.id] ?? ""} />
                      </>
                    ) : (
                      <textarea
                        name={`q_${p.id}`}
                        rows={3}
                        defaultValue={v[`q_${p.id}`] ?? ""}
                        placeholder="Opsional"
                        className="input mt-3"
                      />
                    )}

                    {e[`q_${p.id}`] && (
                      <p role="alert" className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">
                        {e[`q_${p.id}`]}
                      </p>
                    )}
                  </fieldset>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}

      {state.error && (
        <p role="alert" className="rounded-xl border border-red-500/40 p-3 text-sm font-medium text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className="btn btn-primary btn-lg">
          {pending ? "Mengirim..." : "Kirim"}
        </button>
        <p className="text-sm text-muted-foreground">
          Terjawab {terjawab} dari {skala.length}
        </p>
      </div>
    </form>
  );
}