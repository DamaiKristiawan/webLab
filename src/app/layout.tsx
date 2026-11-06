import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Laboratorium Teknik Digital - Universitas Lampung",
    template: "%s | Lab Teknik Digital Unila",
  },
  description:
    "Informasi jadwal praktikum dan seminar, layanan peminjaman alat dan ruangan, serta kegiatan Laboratorium Teknik Digital Universitas Lampung.",
};

// Mode terang adalah bawaan; mode gelap dipakai hanya jika pengguna memilihnya.
const skripTema = `try{if(localStorage.getItem("tema")==="dark")document.documentElement.classList.add("dark")}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: skripTema }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
      >
        {children}
      </body>
    </html>
  );
}