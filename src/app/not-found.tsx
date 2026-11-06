import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
        Error 404
      </p>
      <h1 className="text-3xl font-bold">Halaman tidak ditemukan</h1>
      <p className="max-w-md text-muted-foreground">
        Alamat yang kamu buka tidak ada atau sudah dipindahkan.
      </p>
      <Link href="/" className="btn btn-primary">
        Kembali ke Beranda
      </Link>
    </main>
  );
}