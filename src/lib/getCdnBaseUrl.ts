export const CDN_BASE_URL =
  (typeof process !== 'undefined' && (process.env.NEXT_PUBLIC_CDN_URL || process.env.NEXT_PUBLIC_CDN)) ||
  'https://cdn.pekalongankab.go.id';

export default function getCdnBaseUrl(): string {
  return CDN_BASE_URL;
}
