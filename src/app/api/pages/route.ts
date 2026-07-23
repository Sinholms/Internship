import { NextRequest, NextResponse } from 'next/server';
import { BASE_URL_SERVER, getHeadersServer } from '@/lib/api/client.server';

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.toString();
  const url = `${BASE_URL_SERVER}/pages${search ? `?${search}` : ''}`;
  try {
    const res = await fetch(url, { headers: getHeadersServer(), next: { revalidate: 3600, tags: ['pages'] } });
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch (e) {
    console.error('[pages-proxy] upstream request failed', e);
    return NextResponse.json({ error: 'Gagal memuat halaman.' }, { status: 502 });
  }
}
