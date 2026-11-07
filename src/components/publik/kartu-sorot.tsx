"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export function KartuSorot({
  href,
  children,
  className,
  featured,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  featured?: boolean;
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
        "card card-sorot group relative block overflow-hidden p-6 transition-transform duration-300 hover:-translate-y-1",
        featured && "surface-ink border-ink",
        className,
      )}
    >
      {children}
    </Link>
  );
}