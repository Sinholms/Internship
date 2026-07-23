import { NextRequest, NextResponse } from 'next/server';
import { BASE_URL_SERVER, getHeadersServer } from '@/lib/api/client.server';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams.toString();
  const url = `${BASE_URL_SERVER}/categories${searchParams ? `?${searchParams}` : ''}`;
  try {
    const res = await fetch(url, { headers: getHeadersServer(), next: { revalidate: 3600, tags: ['categories'] } });
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch (e) {
    console.error('[categories-proxy] upstream request failed', e);
    return NextResponse.json({ error: 'Gagal memuat kategori.' }, { status: 502 });
  }
}
