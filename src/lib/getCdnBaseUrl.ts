export const CDN_BASE_URL =
  (typeof process !== 'undefined' && (process.env.NEXT_PUBLIC_CDN_URL || process.env.NEXT_PUBLIC_CDN)) ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_CDN_URL) ||
  'https://cdn.pekalongankab.go.id';

export default function getCdnBaseUrl(): string {
  return CDN_BASE_URL;
}
