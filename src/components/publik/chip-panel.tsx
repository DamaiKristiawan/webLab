import { cn } from "@/lib/utils";

// Panel berbentuk chip dengan kaki pin, mengikuti bentuk logo LTD.
export function ChipPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("chip-wrap", className)}>
      <span className="chip-pin x t" />
      <span className="chip-pin x b" />
      <span className="chip-pin y l" />
      <span className="chip-pin y r" />
      <div className="chip surface-ink">
        <div className="chip-die">{children}</div>
      </div>
    </div>
  );
}