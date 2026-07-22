"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getStrapiImageUrl } from '@/lib/getStrapiImageUrl';

interface RawTestResult {
  status: number;
  ok: boolean;
  count?: number;
  sample?: string;
  error?: string;
}

interface Props {
  env?: {
    baseUrl: string;
    cdnUrl: string;
    apiKeyMasked: string;
    hasKey: boolean;
  };
}

export default function CmsTestClient({ env: serverEnv }: Props) {
  const displayBaseUrl = serverEnv?.baseUrl || 'https://cms.dinkominfo.pekalongankab.go.id';
  const displayCdnUrl = serverEnv?.cdnUrl || 'https://cdn.pekalongankab.go.id';
  const maskedKey = serverEnv?.apiKeyMasked || 'NOT SET (server)';
  const hasKey = serverEnv?.hasKey ?? false;

  const [rawTests, setRawTests] = useState<Record<string, RawTestResult>>({});
  const [articlesSample, setArticlesSample] = useState<{ count: number; title: string } | null>(null);
  const [categoriesCount, setCategoriesCount] = useState<number | null>(null);
  const [globalName, setGlobalName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const tests = [
      { name: 'articles', url: '/api/articles?pagination[pageSize]=1&populate=*' },
      { name: 'categories', url: '/api/categories?pagination[pageSize]=1' },
      { name: 'global', url: '/api/global?populate=*' },
      { name: 'home-page', url: '/api/home-page?populate=*' },
      { name: 'contact-page', url: '/api/contact-page?populate=*' },
      { name: 'pages', url: '/api/pages?pagination[pageSize]=1&populate=*' },
      { name: 'menu-items', url: '/api/menu-items?pagination[pageSize]=1&populate=*' },
    ];

    Promise.all(
      tests.map(async ({ name, url }) => {
        try {
          const res = await fetch(url);
          const json = await res.json().catch(() => ({}));
          const count = (json as any)?.meta?.pagination?.total ?? (Array.isArray((json as any)?.data) ? (json as any).data.length : (json as any)?.data ? 1 : 0);
          if (name === 'articles' && !cancelled) {
            setArticlesSample({ count, title: (json as any)?.data?.[0]?.title || (json as any)?.data?.title || '' });
          }
          if (name === 'categories' && !cancelled) setCategoriesCount(count);
          if (name === 'global' && !cancelled) setGlobalName((json as any)?.data?.siteName || null);
          return {
            name,
            result: {
              status: res.status,
              ok: res.ok,
              count,
              sample: JSON.stringify(json).slice(0, 200) + '...',
              error: !res.ok ? JSON.stringify(json).slice(0, 500) : undefined,
            } as RawTestResult,
          };
        } catch (e) {
          return { name, result: { status: 0, ok: false, error: (e as Error).message } as RawTestResult };
        }
      })
    ).then(results => {
      if (cancelled) return;
      const map: Record<string, RawTestResult> = {};
      results.forEach(r => { map[r.name] = r.result; });
      setRawTests(map);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  const allOk = Object.values(rawTests).length === 7 && Object.values(rawTests).every(t => t.ok);

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-8">
      <nav className="flex items-center gap-2 text-label-sm text-on-surface-variant mb-6">
        <Link href="/" className="hover:text-primary">Beranda</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-primary font-bold">CMS Test</span>
      </nav>

      <h1 className="font-headline-lg text-headline-lg text-primary">CMS Connection Test</h1>
      <p className="text-body-md text-on-surface-variant mt-2">Proxy /api/* mandatory — token di server, client fetch via proxy tanpa Bearer.</p>

      <div className="mt-8 bg-surface-white border border-border-light rounded-xl p-6 space-y-3">
        <h2 className="font-label-md text-label-md font-bold text-primary">ENV Config (server-masked)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-label-sm font-mono">
          <div><span className="text-on-surface-variant">NEXT_PUBLIC_STRAPI_BASE_URL:</span> <span className="text-primary font-bold">{displayBaseUrl}</span></div>
          <div><span className="text-on-surface-variant">NEXT_PUBLIC_CDN_URL:</span> <span className="text-primary font-bold">{displayCdnUrl}</span></div>
          <div><span className="text-on-surface-variant">STRAPI_API_KEY (masked server):</span> <span className={hasKey ? 'text-green-700' : 'text-error font-bold'}>{maskedKey}</span></div>
          <div><span className="text-on-surface-variant">Proxy mode:</span> <span className="text-primary font-bold">/api/* → server Bearer (no token in client bundle)</span></div>
          <div><span className="text-on-surface-variant">ENV file:</span> <span className="text-on-surface-variant">.env.local NEXT — server-only STRAPI_API_KEY</span></div>
          <div><span className="text-on-surface-variant">Image rewrite:</span> <span className="text-on-surface-variant">{getStrapiImageUrl('/uploads/test.jpg')}</span></div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-xl border ${allOk ? 'bg-green-50 border-green-200' : 'bg-error-container border-error-container'}`}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined">{allOk ? 'check_circle' : 'error'}</span>
            <span className="font-label-md font-bold">Overall: {loading ? 'LOADING...' : allOk ? 'CONNECTED ✅' : 'ISSUE ❌'}</span>
          </div>
          <p className="text-label-sm mt-1">{allOk ? 'Semua proxy 200 OK' : 'Ada yang gagal atau loading'}</p>
        </div>
        <div className="p-4 rounded-xl border bg-surface-white border-border-light">
          <p className="font-label-md font-bold text-primary">Articles via proxy</p>
          <p className="text-body-md mt-1">{articlesSample ? `${articlesSample.count} total ✅` : 'Loading...'}</p>
          {articlesSample?.title && <p className="text-label-sm text-on-surface-variant mt-1">Sample: {articlesSample.title.slice(0,60)}...</p>}
        </div>
        <div className="p-4 rounded-xl border bg-surface-white border-border-light">
          <p className="font-label-md font-bold text-primary">Categories / Global</p>
          <p className="text-label-sm">Cats: {categoriesCount !== null ? `${categoriesCount} ✅` : 'loading'}</p>
          <p className="text-label-sm">Global: {globalName || 'loading'}</p>
        </div>
      </div>

      <div className="mt-6 bg-surface-white border border-border-light rounded-xl p-6">
        <h2 className="font-label-md text-label-md font-bold text-primary mb-4">Proxy Endpoint Tests (/api/* → Strapi Bearer server)</h2>
        <div className="space-y-3">
          {Object.entries(rawTests).map(([name, result]) => (
            <div key={name} className={`p-3 rounded-lg border flex flex-col md:flex-row md:items-center gap-2 justify-between ${result.ok ? 'bg-green-50 border-green-200' : 'bg-error-container border-red-200'}`}>
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined ${result.ok ? 'text-green-700' : 'text-error'}`}>{result.ok ? 'check_circle' : 'cancel'}</span>
                <div>
                  <span className="font-label-md font-bold">/api/{name}</span>
                  <span className="text-label-sm text-on-surface-variant ml-2">Status: {result.status} {result.ok ? '200 OK ✅' : `${result.status} ❌`}</span>
                  {result.count !== undefined && <span className="text-label-sm ml-2">Count: {result.count}</span>}
                </div>
              </div>
              <div className="text-label-sm font-mono text-on-surface-variant max-w-[300px] truncate">
                {result.error ? `ERR: ${result.error.slice(0, 100)}` : result.sample?.slice(0, 80)}
              </div>
            </div>
          ))}
          {Object.keys(rawTests).length === 0 && <p className="text-body-md text-on-surface-variant">Running proxy tests...</p>}
        </div>
      </div>

      <div className="mt-6 bg-surface-container-low rounded-xl p-6">
        <h2 className="font-label-md font-bold text-primary">Verifikasi Token Tidak di Client Bundle (Phase5 QA)</h2>
        <pre className="bg-surface-white border border-border-light rounded-lg p-3 overflow-auto text-xs mt-3">
{`# After npm run build, check no token in static bundle:
grep -r "STRAPI_API_KEY" .next/static/  # should 0 results
grep -r "NEXT_PUBLIC_[REDACTED]_KEY" src/  # must 0
grep -r "f2f" .next/  # no raw token

# Proxy test:
curl http://localhost:3000/api/articles?pagination[pageSize]=1  # 200 OK JSON tanpa client Bearer
`}
        </pre>
      </div>

      <div className="mt-6 flex gap-3">
        <Link href="/" className="bg-primary text-on-primary px-6 py-3 rounded-lg font-label-md">Kembali ke Beranda</Link>
        <Link href="/berita" className="bg-surface-white border border-border-light text-primary px-6 py-3 rounded-lg font-label-md">Lihat Berita Real</Link>
      </div>
    </div>
  );
}
