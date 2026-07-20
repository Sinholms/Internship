import qs from 'qs';
import { BASE_URL, getHeaders } from '../api/client';
import type { StrapiListResponse } from '../api/client';
import type { ArticleCMS } from '../../types/cms';

export async function getArticles(params: {
  query?: string;
  category?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
  limit?: number;
}): Promise<StrapiListResponse<ArticleCMS>> {
  const { query, category, page, pageSize, sort, limit } = params;
  const q = qs.stringify(
    {
      sort: `publication_date:${sort || 'desc'}`,
      filters: {
        $or: query
          ? [
              { title: { $containsi: query } },
              { content: { $containsi: query } },
              { tags: { name: { $containsi: query } } },
            ]
          : undefined,
        category: category ? { slug: { $containsi: category } } : undefined,
        publication_date: { $lte: new Date().toISOString() },
      },
      populate: '*',
      pagination: {
        pageSize: limit || pageSize || 9,
        page: page || 1,
      },
      status: 'published',
    },
    { encodeValuesOnly: true }
  );

  const res = await fetch(`${BASE_URL}/articles?${q}`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`getArticles ${res.status}`);
  return res.json();
}
