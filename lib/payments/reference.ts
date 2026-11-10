const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I - easier to read/type

/**
 * Unguessable reference used both as the payment's public id and its access
 * secret. Uses the Web Crypto API (available in both the browser and the
 * Node runtime) so this is safe to import from client or server code.
 */
export function generatePaymentReference(): string {
  const bytes = new Uint8Array(10);
  globalThis.crypto.getRandomValues(bytes);
  let out = "DV-";
  for (let i = 0; i < 10; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}
