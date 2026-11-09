import { MessageCircle } from "lucide-react";
import { CONTACT_NUMBERS } from "@/lib/constants";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

interface WhatsAppButtonProps {
  phone?: string;
  message?: string;
  variant?: "floating" | "inline";
  label?: string;
  className?: string;
}

const DEFAULT_MESSAGE = "Hi, I'd like to enquire about Dam View Resort.";

export function WhatsAppButton({
  phone = CONTACT_NUMBERS.primary,
  message = DEFAULT_MESSAGE,
  variant = "inline",
  label = "Chat on WhatsApp",
  className,
}: WhatsAppButtonProps) {
  const href = buildWhatsAppUrl(phone, message);

  if (variant === "floating") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "fixed right-5 bottom-5 z-40 flex size-14 items-center justify-center rounded-full bg-dv-leaf text-dv-ivory shadow-lg transition-transform hover:scale-105",
          className
        )}
      >
        <MessageCircle size={26} />
        <span className="sr-only">{label}</span>
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-2 rounded-lg bg-dv-leaf px-4 py-2 text-sm font-medium text-dv-ivory transition-colors hover:bg-dv-forest",
        className
      )}
    >
      <MessageCircle size={17} />
      {label}
    </a>
  );
}
