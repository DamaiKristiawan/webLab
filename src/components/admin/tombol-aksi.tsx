"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/form";
import { cn } from "@/lib/utils";

// Tombol kecil untuk aksi per baris (nonaktifkan, hapus), lengkap dengan konfirmasi dan pesan galat.
export function TombolAksi({
  aksi,
  id,
  label,
  konfirmasi,
  bahaya,
}: {
  aksi: (prev: FormState, formData: FormData) => Promise<FormState>;
  id: number;
  label: string;
  konfirmasi?: string;
  bahaya?: boolean;
}) {
  const [state, action, pending] = useActionState(aksi, {} as FormState);

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (konfirmasi && !window.confirm(konfirmasi)) e.preventDefault();
      }}
      className="inline-flex flex-col gap-1"
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        className={cn("btn btn-outline h-8 px-3", bahaya && "text-red-600 dark:text-red-400")}
      >
        {pending ? "..." : label}
      </button>
      {state.error && (
        <span role="alert" className="max-w-52 text-xs text-red-600 dark:text-red-400">
          {state.error}
        </span>
      )}
    </form>
  );
}