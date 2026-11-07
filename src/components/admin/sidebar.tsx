"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  Images,
  Inbox,
  KeyRound,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Package,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { menuUntuk, type IkonKey, type Rol } from "@/lib/menu-admin";

const ikon: Record<IkonKey, LucideIcon> = {
  dash: LayoutDashboard,
  inbox: Inbox,
  cal: CalendarDays,
  book: BookOpen,
  clip: ClipboardCheck,
  box: Package,
  users: Users,
  mega: Megaphone,
  chat: MessageSquare,
  img: Images,
  cog: Settings,
  key: KeyRound,
};

// Dipakai di sidebar desktop dan laci menu ponsel (permukaan "ink").
export function MenuAdmin({ rol, onNavigate }: { rol: Rol; onNavigate?: () => void }) {
  const pathname = usePathname();
  const aktif = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <nav aria-label="Menu admin">
      {menuUntuk(rol).map((g) => (
        <div key={g.grup} className="mb-1">
          <p className="label-mono px-3 pb-1.5 pt-4">{g.grup}</p>
          <div className="grid gap-0.5">
            {g.items.map((t) => {
              const Ikon = ikon[t.ikon];
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink-foreground/65 transition-colors hover:bg-ink-foreground/10 hover:text-ink-foreground",
                    aktif(t.href) &&
                      "bg-ink-foreground/15 font-semibold text-ink-foreground shadow-[inset_3px_0_0_var(--ink-foreground)]",
                  )}
                >
                  <Ikon className="h-4 w-4 shrink-0" />
                  {t.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}