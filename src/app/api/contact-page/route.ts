import { NextRequest, NextResponse } from 'next/server';
import { BASE_URL_SERVER, getHeadersServer } from '@/lib/api/client.server';
import qs from 'qs';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  let search = sp.toString();
  if (!search) {
    const q = qs.stringify(
      { populate: { featuredImage: { populate: '*' }, contactList: { populate: '*' } } },
      { encodeValuesOnly: true }
    );
    search = q;
  }
  const url = `${BASE_URL_SERVER}/contact-page?${search}`;
  try {
    const res = await fetch(url, { headers: getHeadersServer(), next: { revalidate: 3600, tags: ['contact-page'] } });
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
