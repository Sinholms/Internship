import { notFound } from 'next/navigation';
import CmsTestClient from './CmsTestClient';

export default function CmsTestPage() {
  if (process.env.NODE_ENV !== 'development') notFound();

  const baseUrl =
    process.env.NEXT_PUBLIC_STRAPI_BASE_URL ||
    process.env.STRAPI_BASE_URL ||
    'https://cms.dinkominfo.pekalongankab.go.id';

  const cdnUrl =
    process.env.NEXT_PUBLIC_CDN_URL ||
    process.env.NEXT_PUBLIC_CDN ||
    'https://cdn.pekalongankab.go.id';

  return (
    <CmsTestClient
      env={{
        baseUrl,
        cdnUrl,
        hasKey: Boolean(process.env.STRAPI_API_KEY),
      }}
    />
  );
}
