import { BASE_URL_SERVER, getHeadersServer } from '@/lib/api/client.server';
import qs from 'qs';
import BeritaClient from './BeritaClient';

async function fetchInitialArticles(searchParams: { page?: string; category?: string; query?: string }) {
  const page = parseInt(searchParams.page || '1', 10);
  const category = searchParams.category;
  const query = searchParams.query;
  try {
    const q = qs.stringify(
      {
        sort: 'publication_date:desc',
        filters: {
          $or: query ? [{ title: { $containsi: query } }, { content: { $containsi: query } }] : undefined,
          category: category ? { slug: { $containsi: category } } : undefined,
          publication_date: { $lte: new Date().toISOString() },
        },
        populate: '*',
        pagination: { pageSize: 9, page },
        status: 'published',
      },
      { encodeValuesOnly: true }
    );
    const res = await fetch(`${BASE_URL_SERVER}/articles?${q}`, {
      headers: getHeadersServer(),
      next: { revalidate: 60, tags: ['articles'] },
    });
    if (!res.ok) return undefined;
    const json = await res.json();
    return { articles: json.data, total: json.meta?.pagination?.total || 0, pageCount: json.meta?.pagination?.pageCount || 1 };
  } catch {
    return undefined;
  }
}

export default async function BeritaPage({ searchParams }: { searchParams: Promise<{ page?: string; category?: string; query?: string }> }) {
  const sp = await searchParams;
  const initial = await fetchInitialArticles(sp);
  return <BeritaClient initialData={initial} />;
}
