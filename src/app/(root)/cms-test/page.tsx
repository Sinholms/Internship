import CmsTestClient from './CmsTestClient';

export default function CmsTestPage() {
  const baseUrl =
    process.env.NEXT_PUBLIC_STRAPI_BASE_URL ||
    process.env.STRAPI_BASE_URL ||
    'https://cms.dinkominfo.pekalongankab.go.id';

  const cdnUrl =
    process.env.NEXT_PUBLIC_CDN_URL ||
    process.env.NEXT_PUBLIC_CDN ||
    'https://cdn.pekalongankab.go.id';

  // Server-only token, never NO_PUBLIC_TOKEN
  const apiKey = process.env.STRAPI_API_KEY || '';

  const apiKeyMasked = apiKey ? `${apiKey.slice(0, 8)}...${apiKey.slice(-8)} (${apiKey.length} chars)` : 'NOT SET (set STRAPI_API_KEY in .env.local)';

  return (
    <CmsTestClient
      env={{
        baseUrl,
        cdnUrl,
        apiKeyMasked,
        hasKey: !!apiKey,
      }}
    />
  );
}
