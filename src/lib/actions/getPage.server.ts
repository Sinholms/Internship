import 'server-only';
import qs from 'qs';
import { BASE_URL_SERVER, getHeadersServer } from '@/lib/api/client.server';
import type { PageCMS } from '@/types/cms';

/**
 * Server-only single-page fetch by slug. Bearer stays server-side.
 * Populates only title/description/content scalars (no dynamic zones) - the
 * catch-all CMS route renders a minimal page, not sections/asides/forms.
 * Returns the page or null when not found.
 */
export async function fetchPageBySlug(slug: string): Promise<PageCMS | null> {
  const q = qs.stringify(
    {
      filters: { slug: { $eq: slug } },
      fields: ['title', 'slug', 'description', 'content'],
      status: 'published',
    },
    { encodeValuesOnly: true }
  );

  const res = await fetch(`${BASE_URL_SERVER}/pages?${q}`, {
    headers: getHeadersServer(),
    next: { revalidate: 3600, tags: [`page-${slug}`] },
  });
  if (!res.ok) return null;

  const json = await res.json();
  const data: PageCMS[] = Array.isArray(json?.data) ? json.data : [];
  return data[0] ?? null;
}
