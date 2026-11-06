"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  Images,
  Inbox,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Package,
  Settings,
  UserCog,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tautan = [
  { label: "Dashboard", href: "/admin", ikon: LayoutDashboard },
  { label: "Pengajuan", href: "/admin/pengajuan", ikon: Inbox },
  { label: "Jadwal", href: "/admin/jadwal", ikon: CalendarDays },
  { label: "Anggota Lab", href: "/admin/anggota", ikon: Users },
  { label: "Inventaris", href: "/admin/inventaris", ikon: Package },
  { label: "Praktikum", href: "/admin/praktikum", ikon: BookOpen },
  { label: "Hasil Tes", href: "/admin/hasil-tes", ikon: ClipboardCheck },
  { label: "Survei", href: "/admin/survei", ikon: MessageSquare },
  { label: "Dokumentasi", href: "/admin/dokumentasi", ikon: Images },
  { label: "Pengumuman", href: "/admin/pengumuman", ikon: Megaphone },
  { label: "Pengaturan", href: "/admin/pengaturan", ikon: Settings },
  { label: "Akun Staf", href: "/admin/staf", ikon: UserCog },
];

export function Sidebar() {
  const pathname = usePathname();
  const aktif = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <nav
      aria-label="Menu admin"
      className="flex gap-1 overflow-x-auto px-2 pb-2 lg:flex-col lg:overflow-visible lg:pb-4"
    >
      {tautan.map((t) => {
        const Ikon = t.ikon;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              aktif(t.href) && "bg-muted text-foreground",
            )}
          >
            <Ikon className="h-4 w-4" />
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}