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
          page: { fields: ['slug'] },
          article: { fields: ['slug'] },
          category: { fields: ['slug'] },
          children: { populate: '*' },
          menu: { fields: ['name'] },
        },
        filters: { menu: { name: { $eq: 'Main Menu' } } },
        sort: 'order:asc',
        pagination: { pageSize: 100 },
      },
      { encodeValuesOnly: true }
    );
    search = q;
  }
  const url = `${BASE_URL_SERVER}/menu-items?${search}`;
  try {
    const res = await fetch(url, { headers: getHeadersServer(), next: { revalidate: 3600, tags: ['menu-items'] } });
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch (e) {
    console.error('[menu-items-proxy] upstream request failed', e);
    return NextResponse.json({ error: 'Gagal memuat navigasi.' }, { status: 502 });
  }
}
