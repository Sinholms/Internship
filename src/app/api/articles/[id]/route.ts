import { NextRequest, NextResponse } from 'next/server';
import { getHeadersServer } from '@/lib/api/client.server';
import { buildDetailUrl, detectPrimaryField } from '@/lib/actions/getArticleDetail.server';
import { isValidArticleIdentifier } from '@/lib/api/publicCmsProxyQuery';

function fetchStrapi(url: string, id: string) {
  return fetch(url, {
    headers: getHeadersServer(),
    next: { revalidate: 3600, tags: [`article-${id}`] },
  });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidArticleIdentifier(id)) return NextResponse.json({ error: 'Identitas artikel tidak valid.' }, { status: 400 });

  // Scoped detail: server owns query, slug/docId detection, and slug<->docId fallback
  const primary = detectPrimaryField(id);
  const fallback: 'slug' | 'documentId' = primary === 'slug' ? 'documentId' : 'slug';

  try {
    let res = await fetchStrapi(buildDetailUrl(primary, id), id);
    let json = await res.json();
    if (!res.ok) return NextResponse.json({ error: 'Artikel tidak ditemukan.' }, { status: res.status === 404 ? 404 : 502 });

    const data = Array.isArray(json?.data) ? json.data : [];
    if (data.length === 0) {
      res = await fetchStrapi(buildDetailUrl(fallback, id), id);
      json = await res.json();
      if (!res.ok) return NextResponse.json({ error: 'Artikel tidak ditemukan.' }, { status: res.status === 404 ? 404 : 502 });
    }
    return NextResponse.json(json, { status: 200 });
  } catch (error) {
    console.error('[article-detail-proxy] upstream request failed', error instanceof Error ? error.name : 'unknown');
    return NextResponse.json({ error: 'Gagal memuat artikel.' }, { status: 502 });
  }
}
