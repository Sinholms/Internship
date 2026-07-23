import { NextRequest, NextResponse } from 'next/server';
import { BASE_URL_SERVER, getHeadersServer } from '@/lib/api/client.server';
import { buildDetailUrl, detectPrimaryField } from '@/lib/actions/getArticleDetail.server';

function fetchStrapi(url: string, id: string) {
  return fetch(url, {
    headers: getHeadersServer(),
    next: { revalidate: 3600, tags: [`article-${id}`] },
  });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const qp = req.nextUrl.searchParams;

  // Back-compat: if client passes an explicit query, forward as-is to articles endpoint
  const hasFilters = qp.get('filters[slug][$eq]') || qp.get('filters[documentId][$eq]');
  if (hasFilters || qp.toString().includes('populate')) {
    const search = qp.toString();
    const url = `${BASE_URL_SERVER}/articles${search ? `?${search}` : ''}`;
    try {
      const res = await fetchStrapi(url, id);
      const json = await res.json();
      return NextResponse.json(json, { status: res.ok ? 200 : res.status });
    } catch (e) {
      console.error('[article-detail-proxy] upstream request failed', e);
      return NextResponse.json({ error: 'Gagal memuat artikel.' }, { status: 502 });
    }
  }

  // Scoped detail: server owns query, slug/docId detection, and slug<->docId fallback
  const primary = detectPrimaryField(id);
  const fallback: 'slug' | 'documentId' = primary === 'slug' ? 'documentId' : 'slug';

  try {
    let res = await fetchStrapi(buildDetailUrl(primary, id), id);
    let json = await res.json();
    if (!res.ok) return NextResponse.json(json, { status: res.status });

    const data = Array.isArray(json?.data) ? json.data : [];
    if (data.length === 0) {
      res = await fetchStrapi(buildDetailUrl(fallback, id), id);
      json = await res.json();
      if (!res.ok) return NextResponse.json(json, { status: res.status });
    }
    return NextResponse.json(json, { status: 200 });
  } catch (e) {
    console.error('[article-detail-proxy] upstream request failed', e);
    return NextResponse.json({ error: 'Gagal memuat artikel.' }, { status: 502 });
  }
}
