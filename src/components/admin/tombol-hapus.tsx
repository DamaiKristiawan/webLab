"use client";

import { Trash2 } from "lucide-react";

export function TombolHapus({
  aksi,
  id,
  pesan = "Hapus data ini?",
}: {
  aksi: (formData: FormData) => Promise<void>;
  id: number;
  pesan?: string;
}) {
  return (
    <form
      action={aksi}
      onSubmit={(e) => {
        if (!confirm(pesan)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="btn btn-outline h-8 px-3 text-red-600 dark:text-red-400"
      >
        <Trash2 className="h-4 w-4" />
        Hapus
      </button>
    </form>
  );
}