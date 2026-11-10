import { ECOCASH } from "@/lib/constants";

export function PaymentNote() {
  return (
    <p className="mt-4 text-xs text-muted-foreground">
      Payment is on arrival or confirmation, in cash or via EcoCash (dial {ECOCASH.dialCode}).
    </p>
  );
}
