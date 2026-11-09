import Link from "next/link";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function NavLink({ href, label, active, onClick, className }: NavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "text-sm font-medium text-foreground/80 transition-colors hover:text-primary",
        active && "text-primary",
        className
      )}
    >
      {label}
    </Link>
  );
}
