import getCdnBaseUrl from './getCdnBaseUrl';

export const getStrapiImageUrl = (imageUrl?: string | null): string => {
  if (!imageUrl) return '';

  // Same regex as next-strapi-main/src/lib/getStrapiImageUrl.ts
  const cmsRegex = /cms\.[^.]+\.pekalongankab\.go\.id/;
  if (cmsRegex.test(imageUrl)) {
    return imageUrl.replace(cmsRegex, 'cdn.pekalongankab.go.id');
  }

  if (imageUrl.startsWith('https://') || imageUrl.startsWith('http://')) {
    return imageUrl;
  }

  if (imageUrl.startsWith('/uploads')) {
    return `${getCdnBaseUrl()}${imageUrl}`;
  }

  return imageUrl;
};

export default getStrapiImageUrl;
