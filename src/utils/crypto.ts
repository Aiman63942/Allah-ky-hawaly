/**
 * SHA-256 Utility for computing real cryptographic hashes for forensic evidence verification
 */
export async function calculateSHA256(data: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export async function calculateFileSHA256(file: File | Blob): Promise<string> {
  const buffer = await file.arrayBuffer();
  return calculateSHA256(buffer);
}

export async function calculateStringSHA256(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  return calculateSHA256(data.buffer);
}

export function verifyHashMatch(inputHash: string, targetHash: string): boolean {
  return inputHash.trim().toLowerCase() === targetHash.trim().toLowerCase();
}

export function generateMockSignature(prefix: string = '0xA4B2'): string {
  const characters = '0123456789ABCDEF';
  let hex = prefix;
  for (let i = 0; i < 28; i++) {
    hex += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return hex;
}

