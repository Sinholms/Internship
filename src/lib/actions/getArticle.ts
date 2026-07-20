import qs from 'qs';
import { BASE_URL, getHeaders } from '../api/client';
import type { StrapiListResponse } from '../api/client';
import type { ArticleCMS } from '../../types/cms';

function articlePopulate() {
  return {
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
            tags: { fields: ['name', 'slug'] },
          },
        },
      },
    },
    pdfViewer: { populate: '*' },
  };
}

export async function getArticleBySlug(slug: string): Promise<ArticleCMS | null> {
  const q = qs.stringify(
    {
      filters: { slug: { $eq: slug } },
      populate: articlePopulate(),
    },
    { encodeValuesOnly: true }
  );
  const res = await fetch(`${BASE_URL}/articles?${q}`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`getArticleBySlug ${res.status}`);
  const json: StrapiListResponse<ArticleCMS> = await res.json();
  return json.data[0] || null;
}

export async function getArticleByDocumentId(documentId: string): Promise<ArticleCMS | null> {
  const q = qs.stringify(
    {
      filters: { documentId: { $eq: documentId } },
      populate: articlePopulate(),
    },
    { encodeValuesOnly: true }
  );
  const res = await fetch(`${BASE_URL}/articles?${q}`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`getArticleByDocumentId ${res.status}`);
  const json: StrapiListResponse<ArticleCMS> = await res.json();
  return json.data[0] || null;
}
