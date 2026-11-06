"use client";

import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  function ubah() {
    const gelap = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("tema", gelap ? "dark" : "light");
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={ubah}
      aria-label="Ganti tema terang/gelap"
      className="btn btn-outline h-9 w-9 px-0"
    >
      <Moon className="h-4 w-4 dark:hidden" />
      <Sun className="hidden h-4 w-4 dark:block" />
    </button>
  );
}