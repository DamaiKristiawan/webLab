import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatTanggal } from "@/lib/waktu";
import { Skeleton } from "@/components/publik/beranda-data";

export const metadata = { title: "Dokumentasi" };

async function Isi({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;

  const d = await prisma.dokumentasi.findFirst({
    where: { slug, terbit: true },
    include: { foto: { orderBy: [{ urutan: "asc" }, { id: "asc" }] } },
  });
  if (!d) notFound();

  return (
    <>
      <Link
        href="/dokumentasi"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Semua dokumentasi
      </Link>

      <p className="label-mono mt-6">{formatTanggal(d.tanggal)}</p>
      <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tighter sm:text-5xl">{d.judul}</h1>
      {d.ringkasan && <p className="mt-3 text-lg text-muted-foreground">{d.ringkasan}</p>}
      {d.isi && <p className="mt-6 max-w-3xl whitespace-pre-line leading-relaxed">{d.isi}</p>}

      {d.foto.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-extrabold tracking-tight">Galeri ({d.foto.length})</h2>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {d.foto.map((f) => (
              <li key={f.id}>
                <a
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted"
                >
                  <Image
                    src={f.url}
                    alt={f.caption ?? d.judul}
                    fill
                    unoptimized
                    sizes="(min-width: 1024px) 33vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

export default function DetailDokumentasi({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-12 sm:pt-16">
      <Suspense fallback={<Skeleton className="h-96" />}>
        <Isi params={params} />
      </Suspense>
    </div>
  );
}