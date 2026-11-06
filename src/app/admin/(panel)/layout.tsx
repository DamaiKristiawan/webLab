import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { LogOut } from "lucide-react";
import { wajibLogin } from "@/lib/auth";
import { logout } from "@/actions/auth";
import { Sidebar } from "@/components/admin/sidebar";
import { ThemeToggle } from "@/components/publik/theme-toggle";

async function PanelIsi({ children }: { children: React.ReactNode }) {
  const staff = await wajibLogin();

  return (
    <div className="min-h-screen lg:flex">
      <aside className="border-b border-border bg-card lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3 px-4 py-4">
          <Image
            src="/logo-ltd.png"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 dark:invert"
          />
          <div className="leading-tight">
            <p className="text-sm font-semibold">Panel Admin</p>
            <p className="text-xs text-muted-foreground">Lab Teknik Digital</p>
          </div>
        </div>
        <Sidebar />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border px-4 sm:px-6">
          <Link
            href="/"
            target="_blank"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Lihat situs publik ↗
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm sm:inline">{staff.nama}</span>
            <ThemeToggle />
            <form action={logout}>
              <button type="submit" className="btn btn-outline h-9 px-3">
                <LogOut className="h-4 w-4" />
                Keluar
              </button>
            </form>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
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