"use client";

import React from "react";

export default function AnimasiLogoHero() {
  return (
    <div className="relative flex items-center justify-center w-full h-full min-h-[340px] md:min-h-[420px] select-none pointer-events-none">
      {/* Background Glow Biru (Menyatu dengan tema gelap Hero) */}
      <div className="absolute w-64 h-64 md:w-80 md:h-80 rounded-full bg-blue-600/30 blur-3xl animate-pulse" />
      <div className="absolute w-48 h-48 rounded-full bg-cyan-400/20 blur-2xl animate-ping [animation-duration:4s]" />

      {/* Cincin Orbit Teknologi Luar (Berputar Searah Jarum Jam) */}
      <div className="absolute w-72 h-72 md:w-96 md:h-96 rounded-full border border-dashed border-blue-400/30 animate-[spin_20s_linear_infinite]" />

      {/* Cincin Orbit Teknologi Dalam (Berputar Berlawanan Arah) */}
      <div className="absolute w-60 h-60 md:w-80 md:h-80 rounded-full border-2 border-transparent border-t-cyan-400/60 border-b-blue-500/40 animate-[spin_12s_linear_infinite_reverse]" />

      {/* Partikel Sudut Sirkuit */}
      <div className="absolute w-64 h-64 md:w-84 md:h-84 animate-[spin_30s_linear_infinite]">
        <span className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee]" />
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
      </div>

      {/* SVG Utama Logo Mikrochip LTD (Efek Floating / Melayang) */}
      <div className="relative z-10 animate-float-ltd">
        <svg
          viewBox="0 0 300 300"
          className="w-56 h-56 md:w-72 md:h-72 drop-shadow-[0_15px_35px_rgba(37,99,235,0.5)]"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Lingkaran Dasar Putih */}
          <circle
            cx="150"
            cy="150"
            r="125"
            fill="#ffffff"
            className="transition-all duration-500"
          />

          {/* Ring Tipis di Dalam Lingkaran Putih */}
          <circle
            cx="150"
            cy="150"
            r="118"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1.5"
            strokeDasharray="6 6"
          />

          {/* PIN ATAS (4 Pin) */}
          <g stroke="#0f172a" strokeWidth="8.5" strokeLinecap="round">
            <line x1="114" y1="50" x2="114" y2="78" className="ltd-pin pin-delay-1" />
            <line x1="138" y1="50" x2="138" y2="78" className="ltd-pin pin-delay-2" />
            <line x1="162" y1="50" x2="162" y2="78" className="ltd-pin pin-delay-3" />
            <line x1="186" y1="50" x2="186" y2="78" className="ltd-pin pin-delay-4" />
          </g>

          {/* PIN BAWAH (4 Pin) */}
          <g stroke="#0f172a" strokeWidth="8.5" strokeLinecap="round">
            <line x1="114" y1="222" x2="114" y2="250" className="ltd-pin pin-delay-4" />
            <line x1="138" y1="222" x2="138" y2="250" className="ltd-pin pin-delay-3" />
            <line x1="162" y1="222" x2="162" y2="250" className="ltd-pin pin-delay-2" />
            <line x1="186" y1="222" x2="186" y2="250" className="ltd-pin pin-delay-1" />
          </g>

          {/* PIN KIRI (4 Pin) */}
          <g stroke="#0f172a" strokeWidth="8.5" strokeLinecap="round">
            <line x1="50" y1="114" x2="78" y2="114" className="ltd-pin pin-delay-1" />
            <line x1="50" y1="138" x2="78" y2="138" className="ltd-pin pin-delay-2" />
            <line x1="50" y1="162" x2="78" y2="162" className="ltd-pin pin-delay-3" />
            <line x1="50" y1="186" x2="78" y2="186" className="ltd-pin pin-delay-4" />
          </g>

          {/* PIN KANAN (4 Pin) */}
          <g stroke="#0f172a" strokeWidth="8.5" strokeLinecap="round">
            <line x1="222" y1="114" x2="250" y2="114" className="ltd-pin pin-delay-4" />
            <line x1="222" y1="138" x2="250" y2="138" className="ltd-pin pin-delay-3" />
            <line x1="222" y1="162" x2="250" y2="162" className="ltd-pin pin-delay-2" />
            <line x1="222" y1="186" x2="250" y2="186" className="ltd-pin pin-delay-1" />
          </g>

          {/* Bingkai Kotak IC Utama */}
          <rect
            x="88"
            y="88"
            width="124"
            height="124"
            rx="22"
            fill="none"
            stroke="#0f172a"
            strokeWidth="10"
          />

          {/* Animasi Aliran Listrik Berjalan Mengelilingi Kotak IC */}
          <rect
            x="88"
            y="88"
            width="124"
            height="124"
            rx="22"
            fill="none"
            stroke="#2563eb"
            strokeWidth="10"
            strokeDasharray="70 380"
            strokeLinecap="round"
            className="animate-circuit-flow"
          />

          {/* Huruf Grafis "LTD" */}
          <g
            fill="none"
            stroke="#0f172a"
            strokeWidth="11"
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
  );
}