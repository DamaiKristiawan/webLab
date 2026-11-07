// Latar dekoratif hero: grid sirkuit, bercak cahaya, dan jalur cahaya yang bergerak
// (jalur hanya di sisi kanan, di belakang panel chip, supaya tidak menembus teks).
const jalur = [
  { top: "26%", delay: "0s", durasi: "9s" },
  { top: "48%", delay: "3s", durasi: "11s" },
  { top: "70%", delay: "6s", durasi: "8s" },
];

export function LatarHero() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div className="bg-grid absolute inset-0" />
      <div className="glow absolute -right-[6%] -top-1/4 h-[700px] w-[700px]" />
      <div className="absolute inset-y-0 right-0 hidden w-[55%] overflow-hidden motion-reduce:hidden lg:block">
        {jalur.map((j) => (
          <span
            key={j.top}
            className="animate-trace-zone absolute left-0 h-px w-[40%] bg-gradient-to-r from-transparent via-foreground/50 to-transparent"
            style={{ top: j.top, animationDelay: j.delay, animationDuration: j.durasi }}
          />
        ))}
      </div>
    </div>
  );
}