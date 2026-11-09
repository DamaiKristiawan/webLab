"use client";

import { useEffect, useRef, useState } from "react";
import "./animasi-logo-hero.css";

type Varian = "light" | "dark";

const OPSI_TEMA: ReadonlyArray<readonly [Varian, string]> = [
  ["light", "Putih Asli"],
  ["dark", "Dark Hologram"],
];

/* 16 pin: 4 per sisi chip. n = urutan gelombang (1..4) */
const POS = [160, 187, 213, 240];
const PINS = POS.flatMap((p, i) => [
  { x1: p, y1: 112, x2: p, y2: 136, cx: p, cy: 104, n: i + 1 }, // atas
  { x1: p, y1: 264, x2: p, y2: 288, cx: p, cy: 296, n: i + 1 }, // bawah
  { x1: 112, y1: p, x2: 136, y2: p, cx: 104, cy: p, n: i + 1 }, // kiri
  { x1: 264, y1: p, x2: 288, y2: p, cx: 296, cy: p, n: i + 1 }, // kanan
]);

export default function AnimasiLogoHero({
  className = "",
}: {
  className?: string;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [varian, setVarian] = useState<Varian>("light");

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const layers = Array.from(
      stage.querySelectorAll<HTMLElement>("[data-depth]")
    );
    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    let raf = 0;

    const tick = () => {
      // Lerp: makin kecil angkanya, makin halus & lambat mengikuti kursor
      cur.x += (target.x - cur.x) * 0.07;
      cur.y += (target.y - cur.y) * 0.07;

      for (const el of layers) {
        const d = parseFloat(el.dataset.depth || "0");
        const tx = cur.x * d;
        const ty = cur.y * d;
        el.style.transform =
          el.dataset.tilt === "1"
            ? `translate3d(${tx}px, ${ty}px, 0) rotateY(${cur.x * 10}deg) rotateX(${-cur.y * 10}deg)`
            : `translate3d(${tx}px, ${ty}px, 0)`;
      }

      const diff = Math.abs(target.x - cur.x) + Math.abs(target.y - cur.y);
      raf = diff > 0.0005 ? requestAnimationFrame(tick) : 0;
    };

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
      target.x = Math.max(-1, Math.min(1, nx));
      target.y = Math.max(-1, Math.min(1, ny));
      kick();
    };

    const onLeave = () => {
      target.x = 0;
      target.y = 0;
      kick();
    };

    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", onLeave);
    return () => {
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      className={`ltd-hero mx-auto flex w-full max-w-[460px] flex-col items-center gap-6 ${className}`}
      data-variant={varian}
    >
      <div ref={stageRef} className="ltd-stage">
        {/* Lapisan 1: glow */}
        <div data-depth="6" className="ltd-layer">
          <div className="ltd-glow" />
        </div>

        {/* Lapisan 2: cincin (titik-titik, putus-putus, busur) */}
        <div data-depth="12" className="ltd-layer">
          <svg className="ltd-svg" viewBox="0 0 400 400" aria-hidden="true">
            {/* cincin titik-titik */}
            <g className="ltd-orbit-3">
              <circle
                cx="200"
                cy="200"
                r="192"
                fill="none"
                stroke="#60a5fa"
                strokeOpacity="0.65"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="0.1 14"
              />
            </g>
            {/* cincin putus-putus + titik orbit */}
            <g className="ltd-orbit-2">
              <circle
                cx="200"
                cy="200"
                r="176"
                fill="none"
                stroke="#38bdf8"
                strokeOpacity="0.5"
                strokeWidth="1.5"
                strokeDasharray="8 8"
              />
              <circle
                cx="200"
                cy="24"
                r="6"
                fill="#38bdf8"
                style={{ filter: "drop-shadow(0 0 6px #38bdf8)" }}
              />
            </g>
            {/* busur terang */}
            <g className="ltd-orbit-1">
              <circle
                cx="200"
                cy="200"
                r="162"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="170 848"
              />
            </g>
          </svg>
        </div>

        {/* Lapisan 3: logo (ikut kursor + miring 3D halus) */}
        <div data-depth="22" data-tilt="1" className="ltd-layer">
          <div className="ltd-float">
            <svg
              className="ltd-svg"
              viewBox="0 0 400 400"
              role="img"
              aria-label="Logo Laboratorium Teknik Digital"
            >
              <defs>
                <radialGradient id="ltd-badge-grad" cx="50%" cy="40%" r="70%">
                  <stop offset="0%" className="ltd-stop-1" />
                  <stop offset="100%" className="ltd-stop-2" />
                </radialGradient>
              </defs>

              <circle cx="200" cy="200" r="140" className="ltd-badge" />

              {PINS.map((p, i) => (
                <g key={i}>
                  <line
                    x1={p.x1}
                    y1={p.y1}
                    x2={p.x2}
                    y2={p.y2}
                    className={`ltd-pin ltd-pin-${p.n}`}
                  />
                  <circle
                    cx={p.cx}
                    cy={p.cy}
                    r="3.5"
                    className="ltd-signal"
                    style={{ animationDelay: `${(p.n - 1) * 0.25}s` }}
                  />
                </g>
              ))}

              <rect
                x="140"
                y="140"
                width="120"
                height="120"
                rx="20"
                className="ltd-chip-body"
              />
              <rect
                x="140"
                y="140"
                width="120"
                height="120"
                rx="20"
                pathLength={520}
                className="ltd-chip-flow"
              />

              <text
                x="200"
                y="217"
                textAnchor="middle"
                className="ltd-letters"
              >
                LTD
              </text>
            </svg>
          </div>
        </div>
      </div>

      {/* Pilihan tema logo */}
      <div className="flex items-center gap-1 rounded-full border border-white/10 bg-slate-900/70 p-1 text-xs backdrop-blur">
        <span className="px-2 text-slate-400">Tema Logo:</span>
        {OPSI_TEMA.map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setVarian(k)}
            className={`rounded-full px-3 py-1.5 font-semibold transition ${
              varian === k
                ? "bg-blue-600 text-white shadow"
                : "text-slate-300 hover:bg-white/10"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}