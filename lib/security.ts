import { createHash, timingSafeEqual } from "crypto";

/**
 * Constant-time string comparison to prevent timing attacks.
 * Hashes both strings with SHA-256 before comparing them with timingSafeEqual.
 * This ensures that the comparison takes the same amount of time regardless of
 * where a mismatch occurs, and handles strings of different lengths safely.
 */
export function safeCompare(a: string, b: string): boolean {
  const hashA = createHash("sha256").update(a).digest();
  const hashB = createHash("sha256").update(b).digest();
  return timingSafeEqual(hashA, hashB);
}
