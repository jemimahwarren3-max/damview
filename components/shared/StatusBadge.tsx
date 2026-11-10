import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Status = "available" | "held" | "booked" | "maintenance" | "pending" | "confirmed";

const STATUS_STYLES: Record<Status, string> = {
  available: "bg-dv-leaf/15 text-dv-leaf",
  held: "bg-dv-sunshine/30 text-dv-black",
  booked: "bg-dv-forest/15 text-dv-forest",
  maintenance: "bg-dv-gold/20 text-dv-gold",
  pending: "bg-dv-sunshine/30 text-dv-black",
  confirmed: "bg-dv-pool/15 text-dv-pool",
};

const STATUS_LABELS: Record<Status, string> = {
  available: "Available",
  held: "Held",
  booked: "Booked",
  maintenance: "Maintenance",
  pending: "Pending",
  confirmed: "Confirmed",
};

interface StatusBadgeProps {
  status: Status;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn("border-transparent", STATUS_STYLES[status], className)}>
      {label ?? STATUS_LABELS[status]}
    </Badge>
  );
}
