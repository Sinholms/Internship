import qs from 'qs';
import { BASE_URL, getHeaders } from '../api/client';
import type { StrapiListResponse } from '../api/client';
import type { ArticleCMS } from '../../types/cms';

export async function getLatestArticles(params: {
  limit?: number;
  category?: string;
}): Promise<StrapiListResponse<ArticleCMS>> {
  const { limit = 3, category } = params;
  const q = qs.stringify(
    {
      sort: 'publication_date:desc',
      filters: category ? { category: { slug: category } } : undefined,
      'pagination[limit]': limit,
      populate: '*',
    },
    { encodeValuesOnly: true }
  );
  const res = await fetch(`${BASE_URL}/articles?${q}`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`getLatestArticles ${res.status}`);
  return res.json();
}
