import { cn } from "@/lib/utils";

interface StickerBadgeProps {
  children: React.ReactNode;
  tone?: "gold" | "pool" | "forest";
  tilt?: "left" | "right";
  className?: string;
}

const TONE_STYLES = {
  gold: "bg-dv-sunshine text-dv-forest",
  pool: "bg-dv-pool text-dv-ivory",
  forest: "bg-dv-forest text-dv-ivory",
} as const;

export function StickerBadge({ children, tone = "gold", tilt = "left", className }: StickerBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border-2 border-dv-black px-4 py-2 font-promo text-sm tracking-wider shadow-[3px_4px_0_rgba(23,61,43,0.28)]",
        TONE_STYLES[tone],
        tilt === "left" ? "-rotate-3" : "rotate-2",
        className
      )}
    >
      {children}
    </span>
  );
}
