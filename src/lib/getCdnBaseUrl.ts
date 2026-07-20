export const CDN_BASE_URL =
  import.meta.env.VITE_CDN_URL || 'https://cdn.pekalongankab.go.id';

export default function getCdnBaseUrl(): string {
  return CDN_BASE_URL;
}
