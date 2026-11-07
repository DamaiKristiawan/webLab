"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/actions/auth";

export function FormLogin() {
  const [state, action, pending] = useActionState(login, {} as LoginState);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="username" className="text-sm font-medium">Username</label>
        <input
          id="username"
          name="username"
          type="text"
          required
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          defaultValue={state.username ?? ""}
          className="input h-11"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="input h-11"
        />
      </div>

      {state.error && (
        <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary btn-lg w-full">
        {pending ? "Memproses..." : "Masuk"}
      </button>
    </form>
  );
}