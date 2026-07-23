import { NextRequest, NextResponse } from 'next/server';
import { BASE_URL_SERVER, getHeadersServer } from '@/lib/api/client.server';
import qs from 'qs';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  let search = sp.toString();
  if (!search) {
    // default populate *
    const q = qs.stringify(
      {
        populate: {
          siteIcon: { fields: ['url'] },
          siteIconDark: { fields: ['url'] },
          favicon: { fields: ['url'] },
          socialMedia: { populate: { icon: { fields: ['url'] } } },
          footerItems: { populate: '*' },
          defaultSeo: { populate: '*' },
        },
      },
      { encodeValuesOnly: true }
    );
    search = q;
  }
  const url = `${BASE_URL_SERVER}/global?${search}`;
  try {
    const res = await fetch(url, { headers: getHeadersServer(), next: { revalidate: 3600, tags: ['global'] } });
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch (e) {
    console.error('[global-proxy] upstream request failed', e);
    return NextResponse.json({ error: 'Gagal memuat pengaturan situs.' }, { status: 502 });
  }
}
