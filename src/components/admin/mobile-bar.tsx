"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import type { Rol } from "@/lib/menu-admin";
import { ThemeToggle } from "@/components/publik/theme-toggle";
import { MenuAdmin } from "./sidebar";

const tombolInk = "border-ink-foreground/30 bg-transparent text-ink-foreground hover:bg-ink-foreground/10";

// Bar atas dan laci menu untuk layar kecil (di bawah lg). Sidebar desktop ada di layout.
export function MobileBar({ rol, footer }: { rol: Rol; footer: React.ReactNode }) {
  const [buka, setBuka] = useState(false);
  const tutup = () => setBuka(false);

  return (
    <>
      <div className="surface-ink sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-3 lg:hidden">
        <Link href="/admin" className="flex items-center gap-3">
          <Image src="/logo-ltd.png" alt="" width={32} height={32} className="logo-img h-8 w-8" />
          <span className="text-sm font-semibold">Panel Admin</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle className={tombolInk} />
          <button
            type="button"
            onClick={() => setBuka(true)}
            aria-label="Buka menu"
            className={`btn btn-outline h-10 w-10 px-0 ${tombolInk}`}
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>

      {buka && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={tutup}
            className="absolute inset-0 bg-black/55"
          />
          <div className="surface-ink absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col overflow-y-auto p-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-3">
                <Image src="/logo-ltd.png" alt="" width={32} height={32} className="logo-img h-8 w-8" />
                <span className="text-sm font-semibold">Panel Admin</span>
              </span>
              <button
                type="button"
                onClick={tutup}
                aria-label="Tutup menu"
                className={`btn btn-outline h-9 w-9 px-0 ${tombolInk}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <MenuAdmin rol={rol} onNavigate={tutup} />
            <div className="mt-auto pt-6">{footer}</div>
          </div>
        </div>
      )}
    </>
  );
}