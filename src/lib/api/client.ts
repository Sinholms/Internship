import qs from 'qs';
import { CDN_BASE_URL } from '../getCdnBaseUrl';

const STRAPI_BASE_URL =
  (typeof process !== 'undefined' && (process.env.NEXT_PUBLIC_STRAPI_BASE_URL || process.env.STRAPI_BASE_URL)) ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_STRAPI_BASE_URL) ||
  'https://cms.dinkominfo.pekalongankab.go.id';

// For Vite backward compat only - reads VITE token if present (Vite exposes via import.meta)
// For Next, this will be empty (no token) - client must use /api/* proxy which injects server token
const VITE_API_KEY =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_STRAPI_API_KEY) ||
  undefined;

export const CDN_URL = CDN_BASE_URL;
export const BASE_URL = `${STRAPI_BASE_URL.replace(/\/$/, '')}/api`;

export function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: 'application/json',
  };
  if (VITE_API_KEY) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${VITE_API_KEY}`;
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
