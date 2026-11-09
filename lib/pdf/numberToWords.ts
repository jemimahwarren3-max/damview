const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function chunkToWords(n: number): string {
  if (n === 0) return "";
  if (n < 20) return ONES[n];
  if (n < 100) return `${TENS[Math.floor(n / 10)]}${n % 10 ? " " + ONES[n % 10] : ""}`;
  return `${ONES[Math.floor(n / 100)]} Hundred${n % 100 ? " " + chunkToWords(n % 100) : ""}`;
}

/** Converts a USD amount (e.g. 900 or 230.50) into words, matching the real Damview receipt format. */
export function amountToWords(amount: number): string {
  const dollars = Math.floor(amount);
  const cents = Math.round((amount - dollars) * 100);

  if (dollars === 0 && cents === 0) return "Zero United States Dollars Only";

  let whole = "";
  if (dollars >= 1_000_000) {
    whole += `${chunkToWords(Math.floor(dollars / 1_000_000))} Million `;
  }
  if (dollars % 1_000_000 >= 1000) {
    whole += `${chunkToWords(Math.floor((dollars % 1_000_000) / 1000))} Thousand `;
  }
  if (dollars % 1000 > 0 || dollars === 0) {
    whole += chunkToWords(dollars % 1000);
  }
  whole = whole.trim();

  const dollarsLabel = dollars === 1 ? "Dollar" : "Dollars";
  const base = `${whole || "Zero"} United States ${dollarsLabel}`;

  if (cents === 0) return `${base} Only`;
  return `${base} and ${chunkToWords(cents)} Cents Only`;
}
