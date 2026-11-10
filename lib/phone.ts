/**
 * Normalizes a phone number for matching customer records. Best-effort:
 * assumes Zimbabwean numbers by default (the overwhelming majority of
 * guests), but leaves anything that already looks like it has a country
 * code alone rather than mangling international visitors' numbers.
 */
export function normalizePhone(raw: string): string {
  const trimmed = raw.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");

  if (hasPlus) return `+${digits}`;
  if (digits.startsWith("263")) return `+${digits}`;
  if (digits.startsWith("0") && digits.length >= 9) return `+263${digits.slice(1)}`;
  if (digits.length >= 9 && digits.length <= 15) return `+${digits}`;
  return digits;
}
