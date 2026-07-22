import { NextRequest, NextResponse } from 'next/server';
import { BASE_URL_SERVER, getHeadersServer } from '@/lib/api/client.server';
import qs from 'qs';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const qp = req.nextUrl.searchParams;

  // If client already passes full query, forward that; otherwise try slug eq + fallback
  const hasFilters = qp.get('filters[slug][$eq]') || qp.get('filters[documentId][$eq]');
  
  let url: string;
  if (hasFilters || qp.toString().includes('populate')) {
    // Forward as-is but to articles endpoint
    const search = qp.toString();
    url = `${BASE_URL_SERVER}/articles${search ? `?${search}` : ''}`;
  } else {
    // Build slug query for single article
    const isDocId = /^[a-z0-9]{20,30}$/.test(id);
    const dashCount = (id.match(/-/g) || []).length;
    const looksLikeSlug = dashCount >= 3 && id.length > 30;
    const filterField = !looksLikeSlug && isDocId ? 'documentId' : 'slug';
    const q = qs.stringify(
      {
        filters: { [filterField]: { $eq: id } },
        populate: {
          category: { fields: ['name', 'slug'] },
          tags: { fields: ['name', 'slug'] },
          author: { fields: ['firstname', 'lastname'] },
          featuredImage: { populate: '*' },
          relatedArticles: { populate: { articles: { populate: { featuredImage: { populate: '*' }, category: { fields: ['name', 'slug'] } } } } },
          pdfViewer: { populate: '*' },
        },
      },
      { encodeValuesOnly: true }
    );
    url = `${BASE_URL_SERVER}/articles?${q}`;
  }

  try {
    const res = await fetch(url, {
      headers: getHeadersServer(),
      next: { revalidate: 3600, tags: [`article-${id}`] },
    });
    const json = await res.json();
    if (!res.ok) return NextResponse.json(json, { status: res.status });
    // If single fetch via filters returns list, normalize to single or list as requested
    return NextResponse.json(json, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
