import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
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
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <Suspense fallback={null}>
        <CekSudahLogin />
      </Suspense>

      {/* Panel kiri (permukaan ink), hanya di layar lebar */}
      <aside className="surface-ink relative hidden overflow-hidden p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="grid-ink absolute inset-0" aria-hidden />
        <Link href="/" className="relative flex items-center gap-3">
          <Image src="/logo-ltd.png" alt="" width={40} height={40} className="logo-img h-10 w-10" />
          <span className="text-sm font-semibold">Lab Teknik Digital</span>
        </Link>

        <div className="relative">
          <p className="label-mono">Panel pengelola</p>
          <h1 className="mt-4 text-5xl font-extrabold leading-[1.05] tracking-tighter">
            Kelola lab,
            <span className="block text-transparent [-webkit-text-stroke:1.5px_var(--ink-foreground)]">
              dari satu tempat.
            </span>
          </h1>
          <p className="mt-5 max-w-sm leading-relaxed text-ink-muted">
            Jadwal, pengajuan, inventaris, dan praktikum Laboratorium Teknik Digital Universitas Lampung.
          </p>
        </div>

        <p className="relative text-xs text-ink-muted">
          © Laboratorium Teknik Digital, Universitas Lampung.
        </p>
      </aside>

      <section className="relative flex items-center justify-center px-4 py-12">
        <div className="bg-grid absolute inset-0 -z-10 opacity-60" aria-hidden />
        <div className="w-full max-w-sm">
          <div className="mb-7 flex flex-col items-center text-center lg:items-start lg:text-left">
            <Image
              src="/logo-ltd.png"
              alt="Logo Laboratorium Teknik Digital"
              width={56}
              height={56}
              priority
              className="logo-img mb-4 h-14 w-14 lg:hidden"
            />
            <h2 className="text-2xl font-extrabold tracking-tight">Masuk</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Gunakan username dan password dari admin lab.
            </p>
          </div>

          <div className="card p-6">
            <FormLogin />
          </div>

          <p className="mt-5 text-center text-sm text-muted-foreground lg:text-left">
            <Link href="/" className="inline-flex items-center gap-1.5 hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke beranda
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}