"use client";

import { useActionState } from "react";
import {
  resetPasswordStaf,
  tambahStaf,
  ubahPasswordSendiri,
  type StafState,
} from "@/actions/staf";

function Pesan({ state }: { state: StafState }) {
  if (state.error) {
    return (
      <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
        {state.error}
      </p>
    );
  }
  if (state.sukses) {
    return (
      <p role="status" className="text-sm font-medium">
        {state.sukses}
      </p>
    );
  }
  return null;
}

function Galat({ pesan }: { pesan?: string }) {
  return pesan ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{pesan}</p> : null;
}

export function FormTambahStaf() {
  const [state, action, pending] = useActionState(tambahStaf, {} as StafState);
  const v = state.values ?? {};
  const e = state.fieldErrors ?? {};

  return (
    <form action={action} className="card space-y-4 p-5">
      <div>
        <label htmlFor="nama" className="text-sm font-medium">Nama lengkap *</label>
        <input id="nama" name="nama" defaultValue={v.nama ?? ""} required className="input mt-1.5" />
        <Galat pesan={e.nama} />
      </div>

      <div>
        <label htmlFor="username" className="text-sm font-medium">Username *</label>
        <input
          id="username"
          name="username"
          defaultValue={v.username ?? ""}
          required
          autoCapitalize="none"
          spellCheck={false}
          placeholder="contoh: asisten1"
          className="input mt-1.5"
        />
        <Galat pesan={e.username} />
      </div>

      <div>
        <label htmlFor="rol" className="text-sm font-medium">Peran *</label>
        <select id="rol" name="rol" defaultValue={v.rol ?? "ASISTEN"} className="input mt-1.5">
          <option value="ASISTEN">Asisten (hanya praktikum)</option>
          <option value="ADMIN">Admin (kuasa penuh)</option>
        </select>
      </div>

      <div>
        <label htmlFor="password" className="text-sm font-medium">Password awal *</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="input mt-1.5"
        />
        <p className="mt-1 text-xs text-muted-foreground">Minimal 8 karakter. Sampaikan ke yang bersangkutan.</p>
        <Galat pesan={e.password} />
      </div>

      <Pesan state={state} />

      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? "Menyimpan..." : "Buat Akun"}
      </button>
    </form>
  );
}

export function FormResetPassword({ id }: { id: number }) {
  const [state, action, pending] = useActionState(resetPasswordStaf, {} as StafState);

  return (
    <details className="group">
      <summary className="btn btn-outline h-8 cursor-pointer list-none px-3">Reset password</summary>
      <form action={action} className="mt-2 flex flex-wrap items-center gap-2">
        <input type="hidden" name="id" value={id} />
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Password baru"
          className="input h-8 w-44"
        />
        <button type="submit" disabled={pending} className="btn btn-primary h-8 px-3">
          {pending ? "..." : "Simpan"}
        </button>
        <Pesan state={state} />
      </form>
    </details>
  );
}

export function FormPasswordSendiri() {
  const [state, action, pending] = useActionState(ubahPasswordSendiri, {} as StafState);

  return (
    <form action={action} className="card space-y-4 p-5">
      <div>
        <label htmlFor="lama" className="text-sm font-medium">Password lama</label>
        <input id="lama" name="lama" type="password" required autoComplete="current-password" className="input mt-1.5" />
      </div>
      <div>
        <label htmlFor="baru" className="text-sm font-medium">Password baru</label>
        <input id="baru" name="baru" type="password" required minLength={8} autoComplete="new-password" className="input mt-1.5" />
      </div>
      <div>
        <label htmlFor="konfirmasi" className="text-sm font-medium">Ulangi password baru</label>
        <input id="konfirmasi" name="konfirmasi" type="password" required minLength={8} autoComplete="new-password" className="input mt-1.5" />
      </div>

      <Pesan state={state} />

      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? "Menyimpan..." : "Ubah Password"}
      </button>
    </form>
  );
}