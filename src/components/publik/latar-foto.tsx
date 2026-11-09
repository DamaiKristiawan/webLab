"use client";

import React from "react";

export function LatarFoto() {
  return (
    <>
      {/* 1. Gradasi Latar Belakang Hero (Mempertahankan struktur asli Anda) */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 lg:hidden"
        style={{
          background: "linear-gradient(180deg, rgba(6,22,70,0.95), rgba(6,22,70,0.85))",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-20 hidden lg:block"
        style={{
          background:
            "linear-gradient(100deg, rgba(6,22,70,0.98) 0%, rgba(8,32,96,0.92) 40%, rgba(10,40,120,0.5) 70%, rgba(10,40,120,0.2) 100%)",
        }}
      />
      {/* Pudar halus ke bawah agar menyatu dengan halaman */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-20 h-24"
        style={{ background: "linear-gradient(to top, rgba(5,12,28,0.45), transparent)" }}
      />

      {/* 2. Animasi Logo LTD di Sisi Kanan (Pengganti Foto Bersama) */}
      <div className="absolute right-4 lg:right-16 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center pointer-events-none select-none z-10">
        <div className="relative flex items-center justify-center w-[340px] h-[340px] lg:w-[400px] lg:h-[400px]">
          
          {/* Pendaran Cahaya Belakang (Glow) */}
          <div className="absolute w-64 h-64 lg:w-80 lg:h-80 rounded-full bg-[#2f6bff]/30 blur-3xl animate-pulse" />
          
          {/* Cincin Orbit Luar (Berputar Searah Jarum Jam) */}
          <div className="absolute w-72 h-72 lg:w-96 lg:h-96 rounded-full border border-dashed border-[#7db1ff]/35 animate-[spin_22s_linear_infinite]" />

          {/* Cincin Orbit Dalam (Berputar Berlawanan Arah) */}
          <div className="absolute w-56 h-56 lg:w-80 lg:h-80 rounded-full border-2 border-transparent border-t-[#7db1ff]/70 border-b-[#2f6bff]/50 animate-[spin_14s_linear_infinite_reverse]" />

          {/* SVG Utama Logo Mikrochip LTD (Animasi Floating / Melayang) */}
          <div className="relative z-10 animate-float-ltd">
            <svg
              viewBox="0 0 300 300"
              className="w-60 h-60 lg:w-76 lg:h-76 drop-shadow-[0_20px_45px_rgba(47,107,255,0.6)]"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Lingkaran Dasar Putih Logo */}
              <circle cx="150" cy="150" r="126" fill="#ffffff" />

              {/* Garis Lingkaran Dalam Tipis */}
              <circle
                cx="150"
                cy="150"
                r="118"
                fill="none"
                stroke="#dbeafe"
                strokeWidth="1.5"
                strokeDasharray="6 6"
              />

              {/* 4 KAKI PIN ATAS */}
              <g stroke="#0b1b3d" strokeWidth="9" strokeLinecap="round">
                <line x1="114" y1="50" x2="114" y2="78" className="ltd-pin pin-delay-1" />
                <line x1="138" y1="50" x2="138" y2="78" className="ltd-pin pin-delay-2" />
                <line x1="162" y1="50" x2="162" y2="78" className="ltd-pin pin-delay-3" />
                <line x1="186" y1="50" x2="186" y2="78" className="ltd-pin pin-delay-4" />
              </g>

              {/* 4 KAKI PIN BAWAH */}
              <g stroke="#0b1b3d" strokeWidth="9" strokeLinecap="round">
                <line x1="114" y1="222" x2="114" y2="250" className="ltd-pin pin-delay-4" />
                <line x1="138" y1="222" x2="138" y2="250" className="ltd-pin pin-delay-3" />
                <line x1="162" y1="222" x2="162" y2="250" className="ltd-pin pin-delay-2" />
                <line x1="186" y1="222" x2="186" y2="250" className="ltd-pin pin-delay-1" />
              </g>

              {/* 4 KAKI PIN KIRI */}
              <g stroke="#0b1b3d" strokeWidth="9" strokeLinecap="round">
                <line x1="50" y1="114" x2="78" y2="114" className="ltd-pin pin-delay-1" />
                <line x1="50" y1="138" x2="78" y2="138" className="ltd-pin pin-delay-2" />
                <line x1="50" y1="162" x2="78" y2="162" className="ltd-pin pin-delay-3" />
                <line x1="50" y1="186" x2="78" y2="186" className="ltd-pin pin-delay-4" />
              </g>

              {/* 4 KAKI PIN KANAN */}
              <g stroke="#0b1b3d" strokeWidth="9" strokeLinecap="round">
                <line x1="222" y1="114" x2="250" y2="114" className="ltd-pin pin-delay-4" />
                <line x1="222" y1="138" x2="250" y2="138" className="ltd-pin pin-delay-3" />
                <line x1="222" y1="162" x2="250" y2="162" className="ltd-pin pin-delay-2" />
                <line x1="222" y1="186" x2="250" y2="186" className="ltd-pin pin-delay-1" />
              </g>

              {/* Bingkai Kotak Mikrochip Utama */}
              <rect
                x="88"
                y="88"
                width="124"
                height="124"
                rx="22"
                fill="none"
                stroke="#0b1b3d"
                strokeWidth="10"
              />

              {/* Sinyal Sirkuit Mengalir Mengelilingi Kotak */}
              <rect
                x="88"
                y="88"
                width="124"
                height="124"
                rx="22"
                fill="none"
                stroke="#2f6bff"
                strokeWidth="10"
                strokeDasharray="75 375"
                strokeLinecap="round"
                className="animate-circuit-flow"
              />

              {/* Tipografi "LTD" */}
              <g
                fill="none"
                stroke="#0b1b3d"
                strokeWidth="11.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* L */}
                <path d="M 115 122 L 115 162 L 125 172 L 143 172" />
                {/* T */}
                <path d="M 127 120 L 173 120 M 143 120 L 143 156" />
                {/* D */}
                <path d="M 157 136 L 157 172 L 178 172 L 188 154 L 178 136 Z" />
              </g>
            </svg>
          </div>

        </div>
      </div>
    </>
  );
}