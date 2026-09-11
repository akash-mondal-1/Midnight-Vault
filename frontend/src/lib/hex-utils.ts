/**
 * Lightweight, dependency-free hex string conversion utilities.
 * Does not require Node Buffer or WASM packages, safe for browser initial bundle.
 */

export const toHex = (arr: Uint8Array): string => {
  return Array.from(arr)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

export const fromHex = (hex: string): Uint8Array => {
  const clean = hex.startsWith('0x') || hex.startsWith('0X') ? hex.slice(2) : hex;
  if (clean.length === 0) return new Uint8Array(0);
  const match = clean.match(/.{1,2}/g);
  return new Uint8Array(match ? match.map(byte => parseInt(byte, 16)) : []);
};
