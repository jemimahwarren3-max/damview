const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"; // no 0/O/1/l/I

/** A random access secret appended to a payment link, separate from the human-readable reference. */
export function generateAccessSecret(): string {
  const bytes = new Uint8Array(24);
  globalThis.crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

/** SHA-256 hex digest - only the hash is ever stored, never the secret itself. */
export async function hashAccessSecret(secret: string): Promise<string> {
  const data = new TextEncoder().encode(secret);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
