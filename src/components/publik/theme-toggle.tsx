"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
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
      className={cn("btn btn-outline h-10 w-10 px-0", className)}
    >
      <Moon className="h-4 w-4 dark:hidden" />
      <Sun className="hidden h-4 w-4 dark:block" />
    </button>
  );
}