import { cn } from "@/lib/utils";

interface PriceDisplayProps {
  amount: number;
  currency?: string;
  unit?: string;
  className?: string;
}

export function PriceDisplay({ amount, currency = "$", unit, className }: PriceDisplayProps) {
  return (
    <span className={cn("inline-flex items-baseline gap-1", className)}>
      <span className="font-serif text-2xl text-dv-forest">
        {currency}
        {amount}
      </span>
      {unit && <span className="text-sm text-muted-foreground">/ {unit}</span>}
    </span>
  );
}
