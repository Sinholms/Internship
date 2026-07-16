import { CDN_URL } from './client';

export function getStrapiImageUrl(imageUrl?: string | null): string {
  if (!imageUrl) return '';

  // Replace cms.[any].pekalongankab.go.id with cdn.pekalongankab.go.id
  const cmsRegex = /cms\.[^.]+\.pekalongankab\.go\.id/;
  if (cmsRegex.test(imageUrl)) {
    return imageUrl.replace(cmsRegex, 'cdn.pekalongankab.go.id');
  }

  if (imageUrl.startsWith('https://') || imageUrl.startsWith('http://')) {
    return imageUrl;
  }

  if (imageUrl.startsWith('/uploads')) {
    const base = CDN_URL || '';
    return `${base}${imageUrl}`;
  }

  return imageUrl;
}

export function formatDateID(dateStr?: string | null): string {
  if (!dateStr) return '';
  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateStr));
  } catch {
    return dateStr || '';
  }
}
