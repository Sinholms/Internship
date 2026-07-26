import { NextRequest, NextResponse } from 'next/server';
import { BASE_URL_SERVER } from '@/lib/api/client.server';
import { validatePengaduan } from '@/lib/pengaduanSchema';

const FORM_API_KEY = process.env.STRAPI_FORM_API_KEY || process.env.STRAPI_API_KEY;
const PENGADUAN_FORM_ID = process.env.STRAPI_PENGADUAN_FORM_ID;

export async function POST(req: NextRequest) {
  if (!FORM_API_KEY) {
    return NextResponse.json(
      { error: 'Layanan pengaduan belum dikonfigurasi. Silakan hubungi kami via email atau telepon.' },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Format permintaan tidak valid.' }, { status: 400 });
  }

  const validated = validatePengaduan(body);
  if (!validated.ok) {
    return NextResponse.json({ error: 'Validasi gagal.', fieldErrors: validated.fieldErrors }, { status: 400 });
  }

  try {
    const res = await fetch(`${BASE_URL_SERVER}/form-submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${FORM_API_KEY}`,
      },
      body: JSON.stringify({
        data: {
          ...(PENGADUAN_FORM_ID ? { form: PENGADUAN_FORM_ID } : {}),
          data: validated.data,
        },
      }),
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('[pengaduan-proxy] upstream rejected submission', res.status);
      return NextResponse.json(
        { error: 'Pengaduan gagal dikirim. Silakan coba lagi atau hubungi kami via email.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('[pengaduan-proxy] upstream request failed', error instanceof Error ? error.name : 'unknown');
    return NextResponse.json(
      { error: 'Pengaduan gagal dikirim. Silakan coba lagi atau hubungi kami via email.' },
      { status: 502 }
    );
  }
}
