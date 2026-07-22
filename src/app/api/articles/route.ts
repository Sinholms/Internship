import { NextRequest, NextResponse } from 'next/server';
import { BASE_URL_SERVER, getHeadersServer } from '@/lib/api/client.server';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams.toString();
  const url = `${BASE_URL_SERVER}/articles${searchParams ? `?${searchParams}` : ''}`;
  try {
    const res = await fetch(url, {
      headers: getHeadersServer(),
      next: { revalidate: 3600, tags: ['articles'] },
    });
    const json = await res.json();
    if (!res.ok) {
      return NextResponse.json(json, { status: res.status });
    }
    return NextResponse.json(json, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
