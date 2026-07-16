import qs from 'qs';

const STRAPI_BASE_URL = import.meta.env.VITE_STRAPI_BASE_URL || 'https://cms.dinkominfo.pekalongankab.go.id';
const API_KEY = import.meta.env.VITE_STRAPI_API_KEY as string | undefined;

export const CDN_URL = import.meta.env.VITE_CDN_URL || 'https://cdn.pekalongankab.go.id';
export const BASE_URL = `${STRAPI_BASE_URL.replace(/\/$/, '')}/api`;

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: 'application/json',
  };
  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`;
  }
  return headers;
}

export interface StrapiMeta {
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

export interface StrapiListResponse<T> {
  data: T[];
  meta: StrapiMeta;
}

export interface StrapiSingleResponse<T> {
  data: T;
  meta: Record<string, unknown>;
}

export async function strapiFetch<T>(endpoint: string, queryObject?: Record<string, unknown>): Promise<T> {
  const queryString = queryObject ? qs.stringify(queryObject, { encodeValuesOnly: true }) : '';
  const url = `${BASE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;

  const res = await fetch(url, {
    headers: getHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Strapi fetch failed ${res.status} ${endpoint}: ${text.slice(0, 500)}`);
  }

  const json = await res.json();
  return json as T;
}

// Convenience wrappers mimicking next-strapi-main pattern
export async function getArticlesList(queryString: string) {
  const qsPart = queryString ? `?${queryString}` : '';
  const fullUrl = `${BASE_URL}/articles${qsPart}`;
  const res = await fetch(fullUrl, { headers: getHeaders() });
  if (!res.ok) throw new Error(`getArticles failed ${res.status}`);
  return res.json();
}
