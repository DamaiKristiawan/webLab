"use client";

import { startTransition, useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { kirimSurvei } from "@/actions/kirim-survei";
import type { FormState } from "@/lib/form";

type Pertanyaan = { id: number; teks: string; tipe: "SKALA" | "TEKS" };

export function FormSurveiPublik({ surveiId, pertanyaan }: { surveiId: number; pertanyaan: Pertanyaan[] }) {
  const [state, action, pending] = useActionState(kirimSurvei, {} as FormState);
  const e = state.fieldErrors ?? {};
  const v = state.values ?? {};

  if (state.sukses) {
    return (
      <div className="surface-ink rounded-3xl p-10 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10" />
        <p className="mt-4 text-2xl font-extrabold tracking-tight">{state.sukses}</p>
        <p className="mt-2 text-sm text-ink-muted">Jawaban Anda tercatat tanpa identitas.</p>
      </div>
    );
  }

  // Dikirim lewat startTransition agar jawaban tidak terhapus saat ada pesan galat
  function kirim(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (pending) return;
    const fd = new FormData(ev.currentTarget);
    startTransition(() => action(fd));
  }

  return (
    <form onSubmit={kirim} className="space-y-4">
      <input type="hidden" name="surveiId" value={surveiId} />

      {/* Jebakan bot */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <ol className="space-y-4">
        {pertanyaan.map((p, i) => (
          <li key={p.id} className="card p-5 sm:p-6">
            <div className="flex gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-foreground text-xs font-bold">
                {i + 1}
              </span>
              <fieldset className="min-w-0 flex-1">
                <legend className="text-sm font-medium leading-relaxed">{p.teks}</legend>

                {p.tipe === "SKALA" ? (
                  <>
                    <div className="mt-3 grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <label
                          key={n}
                          className="grid h-12 cursor-pointer place-items-center rounded-lg border border-border text-lg font-bold transition-colors hover:bg-muted has-[:checked]:border-foreground has-[:checked]:bg-foreground has-[:checked]:text-background has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-foreground"
                        >
                          <input
                            type="radio"
                            name={`q_${p.id}`}
                            value={n}
                            defaultChecked={v[`q_${p.id}`] === String(n)}
                            className="sr-only"
                          />
                          {n}
                        </label>
                      ))}
                    </div>
                    <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
                      <span>Sangat kurang</span>
                      <span>Sangat baik</span>
                    </div>
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

      {state.error && (
        <p role="alert" className="rounded-xl border border-red-500/40 p-3 text-sm font-medium text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary btn-lg w-full sm:w-auto">
        {pending ? "Mengirim..." : "Kirim Survei"}
      </button>
    </form>
  );
}