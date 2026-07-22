import 'server-only';

const STRAPI_BASE_URL =
  process.env.STRAPI_BASE_URL ||
  process.env.NEXT_PUBLIC_STRAPI_BASE_URL ||
  'https://cms.dinkominfo.pekalongankab.go.id';

const API_KEY = process.env.STRAPI_API_KEY;

export const BASE_URL_SERVER = `${STRAPI_BASE_URL.replace(/\/$/, '')}/api`;

export function getHeadersServer(): HeadersInit {
  if (!API_KEY) {
    // Fallback: allow no token but warn - server should still work if public 403
    return { Accept: 'application/json' };
  }
  return {
    Accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`,
  };
}

if (!API_KEY) {
  console.warn('[client.server] STRAPI_API_KEY missing — requests may 403 if CMS requires auth');
}
