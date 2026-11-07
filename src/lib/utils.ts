import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Inisial dua huruf dari sebuah nama, mis. "M. Sidiq Firdaus" -> "MS". */
export function inisial(nama: string) {
  const bagian = nama.replace(/[.,]/g, " ").trim().split(/\s+/).filter(Boolean);
  if (bagian.length === 0) return "?";
  const dua = bagian.length === 1 ? bagian[0].slice(0, 2) : bagian[0][0] + bagian[1][0];
  return dua.toUpperCase();
}