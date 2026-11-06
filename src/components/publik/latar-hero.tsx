// Latar dekoratif hero: grid sirkuit, bercak cahaya, dan jalur cahaya bergerak.
const jalur = [
  { top: 132, delay: "0s", durasi: "9s" },
  { top: 220, delay: "3s", durasi: "11s" },
  { top: 308, delay: "6s", durasi: "8s" },
  { top: 396, delay: "1.5s", durasi: "12s" },
];

export function LatarHero() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div className="bg-grid absolute inset-0" />
      <div className="glow absolute -top-24 left-1/2 h-[28rem] w-[44rem] -translate-x-1/2" />
      <div className="absolute inset-0 overflow-hidden motion-reduce:hidden">
        {jalur.map((j) => (
          <span
            key={j.top}
            className="animate-trace absolute left-0 h-px w-52 bg-gradient-to-r from-transparent via-foreground/60 to-transparent"
            style={{ top: j.top, animationDelay: j.delay, animationDuration: j.durasi }}
          />
        ))}
      </div>
    </div>
  );
}