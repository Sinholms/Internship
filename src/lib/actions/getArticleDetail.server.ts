import 'server-only';
import qs from 'qs';
import { BASE_URL_SERVER, getHeadersServer } from '@/lib/api/client.server';
import type { ArticleCMS } from '@/types/cms';
import { detectArticleIdentifierField } from '@/lib/articleIdentifier';

export const ARTICLE_DETAIL_POPULATE = {
  category: { fields: ['name', 'slug'] },
  tags: { fields: ['name', 'slug'] },
  author: { fields: ['firstname', 'lastname'] },
  featuredImage: { populate: '*' },
  relatedArticles: {
    populate: {
      articles: {
        populate: {
          featuredImage: { populate: '*' },
          category: { fields: ['name', 'slug'] },
        },
      },
    },
  },
  pdfViewer: { populate: '*' },
} as const;

export function buildDetailUrl(field: 'slug' | 'documentId', id: string): string {
  const q = qs.stringify(
    { filters: { [field]: { $eq: id } }, populate: ARTICLE_DETAIL_POPULATE, status: 'published' },
    { encodeValuesOnly: true }
  );
  return `${BASE_URL_SERVER}/articles?${q}`;
}

/**
 * Decide whether to query by documentId or slug first.
 * Strapi v5 documentId: 20-30 chars alphanumeric lowercase, no dashes.
 * Long kebab-case slugs (dash>=3 && length>30) must be treated as slug.
 */
export function detectPrimaryField(id: string): 'slug' | 'documentId' {
  return detectArticleIdentifierField(id);
}

function fetchStrapi(url: string, id: string) {
  return fetch(url, {
    headers: getHeadersServer(),
    next: { revalidate: 3600, tags: [`article-${id}`] },
  });
}

/**
 * Server-only single-article fetch with slug<->documentId fallback.
 * Returns the article or null when not found (used by both the scoped proxy
 * route and the detail page server wrapper). Bearer stays server-side.
 */
export async function fetchArticleDetail(id: string): Promise<ArticleCMS | null> {
  const primary = detectPrimaryField(id);
  const fallback: 'slug' | 'documentId' = primary === 'slug' ? 'documentId' : 'slug';

  try {
    let res = await fetchStrapi(buildDetailUrl(primary, id), id);
    if (!res.ok) return null;
    let json = await res.json();
    let data: ArticleCMS[] = Array.isArray(json?.data) ? json.data : [];

    if (data.length === 0) {
      res = await fetchStrapi(buildDetailUrl(fallback, id), id);
      if (!res.ok) return null;
      json = await res.json();
      data = Array.isArray(json?.data) ? json.data : [];
    }

    return data[0] ?? null;
  } catch {
    return null;
  }
}
