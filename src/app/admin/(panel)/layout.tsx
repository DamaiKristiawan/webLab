import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { KeyRound, LogOut } from "lucide-react";
import { wajibStaf } from "@/lib/auth";
import { logout } from "@/actions/auth";
import { labelRol } from "@/lib/konstanta";
import { inisial } from "@/lib/utils";
import { MenuAdmin } from "@/components/admin/sidebar";
import { MobileBar } from "@/components/admin/mobile-bar";
import { ThemeToggle } from "@/components/publik/theme-toggle";

async function PanelIsi({ children }: { children: React.ReactNode }) {
  const staff = await wajibStaf();

  // Kotak akun: dipakai di sidebar desktop dan laci menu ponsel (permukaan ink).
  const kotakAkun = (
    <div className="space-y-2">
      <div className="flex items-center gap-3 rounded-xl border border-ink-foreground/20 p-3 text-sm">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink-foreground text-xs font-extrabold text-ink">
          {inisial(staff.nama)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium">{staff.nama}</p>
          <p className="truncate text-xs text-ink-muted">
            {labelRol[staff.rol]} · @{staff.username}
          </p>
        </div>
      </div>
      <Link
        href="/admin/akun"
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-foreground/65 hover:bg-ink-foreground/10 hover:text-ink-foreground"
      >
        <KeyRound className="h-4 w-4" />
        Ubah password
      </Link>
      <form action={logout} className="lg:hidden">
        <button
          type="submit"
          className="btn w-full border border-ink-foreground/30 text-ink-foreground hover:bg-ink-foreground/10"
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[256px_1fr]">
      {/* Sidebar desktop */}
      <aside className="surface-ink relative hidden overflow-hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:p-4">
        <div className="grid-ink absolute inset-0" aria-hidden />
        <div className="relative flex min-h-0 flex-1 flex-col">
          <Link href="/admin" className="flex items-center gap-3 px-1 py-1">
            <Image src="/logo-ltd.png" alt="" width={38} height={38} className="logo-img h-[38px] w-[38px]" />
            <span className="leading-tight">
              <span className="block text-sm font-semibold">Panel Admin</span>
              <span className="block text-xs text-ink-muted">Lab Teknik Digital</span>
            </span>
          </Link>
          <div className="mt-2 min-h-0 flex-1 overflow-y-auto">
            <MenuAdmin rol={staff.rol} />
          </div>
          <div className="pt-4">{kotakAkun}</div>
        </div>
      </aside>

      {/* Bar atas dan laci menu ponsel */}
      <MobileBar rol={staff.rol} footer={kotakAkun} />

      <div className="flex min-w-0 flex-col">
        <header className="hidden h-16 items-center justify-between gap-4 border-b border-border px-7 lg:flex">
          <Link
            href="/"
            target="_blank"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Lihat situs publik ↗
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <form action={logout}>
              <button type="submit" className="btn btn-outline h-10 px-4">
                <LogOut className="h-4 w-4" />
                Keluar
              </button>
            </form>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-7">{children}</main>
      </div>
    </div>
  );
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
          Memuat panel...
        </div>
      }
    >
      <PanelIsi>{children}</PanelIsi>
    </Suspense>
  );
}