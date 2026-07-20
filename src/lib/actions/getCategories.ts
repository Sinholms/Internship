import qs from 'qs';
import { BASE_URL, getHeaders } from '../api/client';
import type { StrapiListResponse } from '../api/client';
import type { CategoryCMS } from '../../types/cms';

export async function getCategories(slug?: string): Promise<StrapiListResponse<CategoryCMS>> {
  const q = slug ? qs.stringify({ filters: { slug: { $containsi: slug } } }, { encodeValuesOnly: true }) : '';
  const url = `${BASE_URL}/categories${q ? `?${q}` : ''}`;
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) throw new Error(`getCategories ${res.status}`);
  return res.json();
}
