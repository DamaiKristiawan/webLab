"use client";

import { useId, useRef } from "react";
import "./animasi-logo-hero.css";

type Props = {
  /** "light" = lingkaran putih + huruf gelap (default, seperti screenshot). "dark" = lingkaran gelap + huruf putih. */
  variant?: "dark" | "light";
  className?: string;
};

const PIN_CLASS = ["ltd-pin-1", "ltd-pin-2", "ltd-pin-3", "ltd-pin-4"] as const;
const DELAY = [0, 0.25, 0.5, 0.75] as const;
const POS = [121, 147, 173, 199] as const;

export function AnimasiLogoHero({ variant = "light", className = "" }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const gradId = `ltdGrad${uid}`;
  const surfId = `ltdSurf${uid}`;

  const zoneRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  function tilt(e: React.PointerEvent<HTMLDivElement>) {
    const zone = zoneRef.current;
    const svg = svgRef.current;
    if (!zone || !svg) return;
    const r = zone.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    svg.style.transform = `perspective(700px) rotateX(${(-y / 14).toFixed(2)}deg) rotateY(${(x / 14).toFixed(2)}deg) scale(1.04)`;
  }

  function reset() {
    if (svgRef.current) {
      svgRef.current.style.transform =
        "perspective(700px) rotateX(0deg) rotateY(0deg) scale(1)";
    }
  }

  return (
    <div
      ref={zoneRef}
      data-variant={variant}
      onPointerMove={tilt}
      onPointerLeave={reset}
      onPointerCancel={reset}
      className={`ltd-hero relative flex h-full w-full min-h-[360px] md:min-h-[520px] flex-col items-center justify-center ${className}`}
    >
      {/* Panggung: semua lapisan diukur dari satu kotak persegi supaya selalu di tengah */}
      <div className="relative mx-auto flex aspect-square w-[320px] max-w-full items-center justify-center sm:w-[440px] lg:w-[500px]">
        {/* Cahaya belakang */}
        <div className="ltd-glow pointer-events-none absolute inset-0 m-auto h-[78%] w-[78%] rounded-full bg-gradient-to-tr from-blue-600/50 via-sky-400/40 to-cyan-300/30 blur-2xl" />

        {/* Cincin orbit */}
        <div className="ltd-orbit-1 pointer-events-none absolute inset-0 m-auto h-[80%] w-[80%] rounded-full border-2 border-dashed border-sky-400/30" />
        <div className="ltd-orbit-2 pointer-events-none absolute inset-0 m-auto h-[90%] w-[90%] rounded-full border border-transparent border-t-sky-400/70 border-b-blue-500/40">
          <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee]" />
        </div>
        <div className="ltd-orbit-3 pointer-events-none absolute inset-0 m-auto h-full w-full rounded-full border border-slate-500/40">
          <span className="absolute -right-1 top-1/2 h-2 w-2 rounded-full bg-blue-400/80" />
          <span className="absolute -left-1 top-1/2 h-2 w-2 rounded-full bg-blue-400/80" />
        </div>

        {/* Logo */}
        <div className="ltd-float relative z-20 h-[72%] w-[72%] cursor-pointer">
          <svg
            ref={svgRef}
            viewBox="0 0 320 320"
            role="img"
            aria-label="Logo Laboratorium Teknik Digital"
            className="h-full w-full drop-shadow-[0_20px_45px_rgba(37,99,235,0.55)] transition-transform duration-300"
            style={{
              transform:
                "perspective(700px) rotateX(0deg) rotateY(0deg) scale(1)",
            }}
          >
            <defs>
              <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <radialGradient id={surfId} cx="50%" cy="35%" r="65%">
                <stop
                  offset="0%"
                  style={{ stopColor: "var(--ltd-surface-1)" }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: "var(--ltd-surface-2)" }}
                />
              </radialGradient>
            </defs>

            {/* Lingkaran dasar */}
            <circle
              cx="160"
              cy="160"
              r="138"
              fill={`url(#${surfId})`}
              strokeWidth="3"
              style={{ stroke: "var(--ltd-ring-stroke)" }}
            />
            <circle
              cx="160"
              cy="160"
              r="126"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="1"
              strokeDasharray="6 6"
              opacity="0.3"
            />

            {/* 16 pin IC */}
            {/* Atas */}
            <g strokeWidth="9.5" strokeLinecap="round">
              {POS.map((x, i) => (
                <line
                  key={`t${x}`}
                  x1={x}
                  y1={54}
                  x2={x}
                  y2={82}
                  className={PIN_CLASS[i]}
                />
              ))}
            </g>
            <g fill="#38bdf8">
              {POS.map((x, i) => (
                <circle
                  key={`tn${x}`}
                  cx={x}
                  cy={46}
                  r={3}
                  className="ltd-signal"
                  style={{ animationDelay: `${DELAY[i]}s` }}
                />
              ))}
            </g>

            {/* Bawah */}
            <g strokeWidth="9.5" strokeLinecap="round">
              {POS.map((x, i) => (
                <line
                  key={`b${x}`}
                  x1={x}
                  y1={238}
                  x2={x}
                  y2={266}
                  className={PIN_CLASS[3 - i]}
                />
              ))}
            </g>
            <g fill="#38bdf8">
              {POS.map((x, i) => (
                <circle
                  key={`bn${x}`}
                  cx={x}
                  cy={274}
                  r={3}
                  className="ltd-signal"
                  style={{ animationDelay: `${DELAY[3 - i]}s` }}
                />
              ))}
            </g>

            {/* Kiri */}
            <g strokeWidth="9.5" strokeLinecap="round">
              {POS.map((y, i) => (
                <line
                  key={`l${y}`}
                  x1={54}
                  y1={y}
                  x2={82}
                  y2={y}
                  className={PIN_CLASS[i]}
                />
              ))}
            </g>
            <g fill="#38bdf8">
              {POS.map((y, i) => (
                <circle
                  key={`ln${y}`}
                  cx={46}
                  cy={y}
                  r={3}
                  className="ltd-signal"
                  style={{ animationDelay: `${DELAY[i]}s` }}
                />
              ))}
            </g>

            {/* Kanan */}
            <g strokeWidth="9.5" strokeLinecap="round">
              {POS.map((y, i) => (
                <line
                  key={`r${y}`}
                  x1={238}
                  y1={y}
                  x2={266}
                  y2={y}
                  className={PIN_CLASS[3 - i]}
                />
              ))}
            </g>
            <g fill="#38bdf8">
              {POS.map((y, i) => (
                <circle
                  key={`rn${y}`}
                  cx={274}
                  cy={y}
                  r={3}
                  className="ltd-signal"
                  style={{ animationDelay: `${DELAY[3 - i]}s` }}
                />
              ))}
            </g>

            {/* Body chip */}
            <rect
              x="94"
              y="94"
              width="132"
              height="132"
              rx="24"
              fill="none"
              strokeWidth="11"
              style={{ stroke: "var(--ltd-chip-base)" }}
            />
            <rect
              x="94"
              y="94"
              width="132"
              height="132"
              rx="24"
              fill="none"
              stroke={`url(#${gradId})`}
              strokeWidth="11"
              strokeLinecap="round"
              className="ltd-chip-flow"
            />

            {/* Huruf LTD */}
            <g className="ltd-letters" style={{ fill: "var(--ltd-letter)" }}>
              <path d="M 118 124 L 129 133 L 129 173 L 135 179 L 157 179 L 157 190 L 130 190 L 118 178 Z" />
              <path d="M 130 119 L 185 119 L 190 130 L 157 130 L 157 172 L 146 172 L 146 130 L 135 130 Z" />
              <path
                fillRule="evenodd"
                d="M 165 136 L 192 136 L 205 163 L 192 190 L 165 190 Z M 176 147 L 185 147 L 193 163 L 185 179 L 176 179 Z"
              />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

export default AnimasiLogoHero;