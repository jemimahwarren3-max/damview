"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

interface ChevronDividerProps {
  className?: string;
}

/**
 * A decorative band echoing the chevron frieze on Great Zimbabwe's Great
 * Enclosure — a real Zimbabwean architectural motif, reused across post-
 * colonial buildings, rather than a generic gradient divider.
 */
export function ChevronDivider({ className }: ChevronDividerProps) {
  const patternId = useId();

  return (
    <div className={cn("h-8 w-full overflow-hidden bg-dv-forest", className)} aria-hidden="true">
      <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 320 34">
        <defs>
          <pattern id={patternId} width="32" height="34" patternUnits="userSpaceOnUse">
            <path d="M0 0 L16 17 L0 34" fill="none" stroke="#E5A05B" strokeWidth="3" opacity="0.9" />
            <path d="M16 0 L32 17 L16 34" fill="none" stroke="#E5A05B" strokeWidth="3" opacity="0.5" />
          </pattern>
        </defs>
        <rect width="320" height="34" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}
