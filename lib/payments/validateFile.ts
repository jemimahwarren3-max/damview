const SIGNATURES: { type: string; ext: string; bytes: number[] }[] = [
  { type: "image/jpeg", ext: "jpg", bytes: [0xff, 0xd8, 0xff] },
  { type: "image/png", ext: "png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { type: "application/pdf", ext: "pdf", bytes: [0x25, 0x50, 0x44, 0x46] }, // "%PDF"
];

/**
 * Sniffs the file's actual bytes rather than trusting its name or the
 * browser-supplied MIME type, which either can lie about.
 */
export function detectFileType(buffer: Uint8Array): { type: string; ext: string } | null {
  for (const sig of SIGNATURES) {
    if (sig.bytes.every((byte, i) => buffer[i] === byte)) {
      return { type: sig.type, ext: sig.ext };
    }
  }
  return null;
}
