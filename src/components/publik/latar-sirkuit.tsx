// Ilustrasi chip dan jalur sirkuit untuk latar hero. Murni SVG, tanpa gambar.
const pinAtasBawah = Array.from({ length: 6 }, (_, i) => 480 + i * 32);
const pinKiriKanan = Array.from({ length: 6 }, (_, i) => 220 + i * 32);

const jalur = [
  "M444 256 H390 V176 H310 V120",
  "M444 320 H320 V380 H240",
  "M444 384 H400 V470 H330 V520",
  "M516 184 V130 H600 V70",
  "M580 184 V150 H690 V96 H760",
  "M676 256 H730 V330 H780",
  "M676 352 H716 V430 H770 V500",
  "M548 416 V480 H630 V550",
  "M612 416 V520 H690",
];

const ujung: [number, number][] = [
  [310, 120],
  [240, 380],
  [330, 520],
  [600, 70],
  [760, 96],
  [780, 330],
  [770, 500],
  [630, 550],
  [690, 520],
];

export function LatarSirkuit() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 800 600"
      preserveAspectRatio="xMaxYMid meet"
      className="pointer-events-none absolute inset-y-0 right-0 -z-10 h-full w-full opacity-60 lg:w-[64%] lg:opacity-100 [-webkit-mask-image:linear-gradient(to_right,transparent,#000_35%)] [mask-image:linear-gradient(to_right,transparent,#000_35%)]"
    >
      <defs>
        <radialGradient
          id="ltd-glow"
          cx="560"
          cy="300"
          r="330"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#4d84ff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#4d84ff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="560" cy="300" r="330" fill="url(#ltd-glow)" />

      {/* Jalur sirkuit */}
      <g fill="none" strokeLinejoin="round" strokeLinecap="round">
        {jalur.map((d) => (
          <path key={d} d={d} stroke="#7db1ff" strokeOpacity="0.32" strokeWidth="1.6" />
        ))}
        {jalur.map((d, i) => (
          <path
            key={`aliran-${d}`}
            d={d}
            stroke="#a9ccff"
            strokeOpacity="0.9"
            strokeWidth="1.8"
            strokeDasharray="6 42"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to="-48"
              dur={`${2.6 + (i % 3) * 0.5}s`}
              repeatCount="indefinite"
            />
          </path>
        ))}
      </g>

      {/* Titik di ujung jalur */}
      {ujung.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="9" fill="#4d84ff" fillOpacity="0.18" />
          <circle cx={x} cy={y} r="4" fill="#7db1ff" />
        </g>
      ))}

      {/* Kaki chip */}
      <g fill="#7db1ff" fillOpacity="0.6">
        {pinAtasBawah.map((x) => (
          <g key={`ab-${x}`}>
            <rect x={x} y="184" width="8" height="16" rx="2" />
            <rect x={x} y="400" width="8" height="16" rx="2" />
          </g>
        ))}
        {pinKiriKanan.map((y) => (
          <g key={`kk-${y}`}>
            <rect x="444" y={y} width="16" height="8" rx="2" />
            <rect x="660" y={y} width="16" height="8" rx="2" />
          </g>
        ))}
      </g>

      {/* Badan chip */}
      <rect
        x="460"
        y="200"
        width="200"
        height="200"
        rx="22"
        fill="#0b2a6f"
        fillOpacity="0.55"
        stroke="#7db1ff"
        strokeWidth="2"
      />
      <rect
        x="490"
        y="230"
        width="140"
        height="140"
        rx="12"
        fill="none"
        stroke="#7db1ff"
        strokeOpacity="0.6"
        strokeWidth="1.5"
      />
      <text
        x="560"
        y="312"
        textAnchor="middle"
        fontSize="38"
        fontWeight="800"
        fill="#a9ccff"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        LTD
      </text>
    </svg>
  );
}