"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export function KartuSorot({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  function gerak(e: React.MouseEvent<HTMLAnchorElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
  }

  return (
    <Link
      href={href}
      onMouseMove={gerak}
      className={cn(
        "card card-sorot group relative block overflow-hidden p-5 transition-transform duration-300 hover:-translate-y-1 hover:border-foreground/30",
        className,
      )}
    >
      {children}
    </Link>
  );
}