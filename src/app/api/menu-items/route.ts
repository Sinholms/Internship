import { NextRequest, NextResponse } from 'next/server';
import { BASE_URL_SERVER, getHeadersServer } from '@/lib/api/client.server';
import { buildMenuItemsQuery } from '@/lib/api/publicCmsProxyQuery';

export async function GET(req: NextRequest) {
  const query = buildMenuItemsQuery(req.nextUrl.searchParams);
  if (!query.ok) return NextResponse.json({ error: query.message }, { status: 400 });
  const url = `${BASE_URL_SERVER}/menu-items?${query.search}`;
  try {
    const res = await fetch(url, { headers: getHeadersServer(), next: { revalidate: 3600, tags: ['menu-items'] } });
    const json = await res.json();
    if (!res.ok) return NextResponse.json({ error: 'Gagal memuat navigasi.' }, { status: 502 });
    return NextResponse.json(json, { status: 200 });
  } catch (error) {
    console.error('[menu-items-proxy] upstream request failed', error instanceof Error ? error.name : 'unknown');
    return NextResponse.json({ error: 'Gagal memuat navigasi.' }, { status: 502 });
  }
}
