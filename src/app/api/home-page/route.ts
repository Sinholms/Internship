import { NextRequest, NextResponse } from 'next/server';
import { BASE_URL_SERVER, getHeadersServer } from '@/lib/api/client.server';
import qs from 'qs';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  let search = sp.toString();
  if (!search) {
    const q = qs.stringify(
      {
        populate: {
          heroSlider: { populate: '*' },
          sections: { populate: { blocks: { on: { 'widgets.latest-articles': { populate: '*' } } } } },
          asides: { populate: { item: { on: { 'widgets.latest-articles': { populate: '*' } } } } },
        },
      },
      { encodeValuesOnly: true }
    );
    search = q;
  }
  const url = `${BASE_URL_SERVER}/home-page?${search}`;
  try {
    const res = await fetch(url, { headers: getHeadersServer(), next: { revalidate: 3600, tags: ['home-page'] } });
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch (e) {
    console.error('[home-page-proxy] upstream request failed', e);
    return NextResponse.json({ error: 'Gagal memuat beranda.' }, { status: 502 });
  }
}
