import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ambilStaff } from "@/lib/auth";
import { FormLogin } from "@/components/admin/form-login";

export const metadata = { title: "Login Staf" };

// Membaca cookie adalah data per-permintaan, jadi harus di dalam <Suspense>.
async function CekSudahLogin() {
  if (await ambilStaff()) redirect("/admin");
  return null;
}

export default function HalamanLogin() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <Suspense fallback={null}>
        <CekSudahLogin />
      </Suspense>

      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image
            src="/logo-ltd.png"
            alt="Logo Laboratorium Teknik Digital"
            width={64}
            height={64}
            priority
            className="mb-3 h-16 w-16 dark:invert"
          />
          <h1 className="text-xl font-semibold">Login Staf</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Khusus kepala lab, PLP, dan asisten.
          </p>
        </div>

        <div className="card p-6">
          <FormLogin />
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">← Kembali ke beranda</Link>
        </p>
      </div>
    </main>
  );
}