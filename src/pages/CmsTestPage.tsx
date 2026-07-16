import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BASE_URL, CDN_URL } from '../lib/api/client';
import { getStrapiImageUrl } from '../lib/api/image';
import { useArticles, useCategories, useGlobal } from '../hooks/useCms';

export default function CmsTestPage() {
  const apiKey = (import.meta.env.VITE_STRAPI_API_KEY as string) || '';
  const maskedKey = apiKey ? `${apiKey.slice(0, 8)}...${apiKey.slice(-8)} (${apiKey.length} chars)` : 'NOT SET';

  const [rawTests, setRawTests] = useState<Record<string, { status: number; ok: boolean; count?: number; sample?: string; error?: string }>>({});

  const { articles, loading: loadingArticles, error: errorArticles } = useArticles({ pageSize: 3 });
  const { data: categories, loading: loadingCats, error: errorCats } = useCategories();
  const { data: globalData, loading: loadingGlobal, error: errorGlobal } = useGlobal();

  useEffect(() => {
    const tests = [
      { name: 'articles', url: `${BASE_URL}/articles?pagination[pageSize]=1&populate=*` },
      { name: 'categories', url: `${BASE_URL}/categories?pagination[pageSize]=1` },
      { name: 'global', url: `${BASE_URL}/global?populate=*` },
      { name: 'home-page', url: `${BASE_URL}/home-page?populate=*` },
      { name: 'contact-page', url: `${BASE_URL}/contact-page?populate=*` },
      { name: 'pages', url: `${BASE_URL}/pages?pagination[pageSize]=1&populate=*` },
      { name: 'menu-items', url: `${BASE_URL}/menu-items?pagination[pageSize]=1&populate=*` },
    ];

    tests.forEach(async ({ name, url }) => {
      try {
        const res = await fetch(url, {
          headers: {
            Accept: 'application/json',
            ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
          },
        });
        const json = await res.json().catch(() => ({}));
        setRawTests(prev => ({
          ...prev,
          [name]: {
            status: res.status,
            ok: res.ok,
            count: json?.meta?.pagination?.total ?? (Array.isArray(json?.data) ? json.data.length : json?.data ? 1 : 0),
            sample: JSON.stringify(json).slice(0, 200) + '...',
            error: !res.ok ? JSON.stringify(json).slice(0, 500) : undefined,
          },
        }));
      } catch (e) {
        setRawTests(prev => ({
          ...prev,
          [name]: { status: 0, ok: false, error: (e as Error).message },
        }));
      }
    });
  }, [apiKey]);

  const allOk = Object.values(rawTests).every(t => t.ok) && rawTests.articles?.ok;

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-8">
      <nav className="flex items-center gap-2 text-label-sm text-on-surface-variant mb-6">
        <Link to="/" className="hover:text-primary">Beranda</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-primary font-bold">CMS Test</span>
      </nav>

      <h1 className="font-headline-lg text-headline-lg text-primary">CMS Connection Test</h1>
      <p className="text-body-md text-on-surface-variant mt-2">Manual cek koneksi Strapi CMS read-only. Semua harus 200 OK hijau.</p>

      {/* Env Info */}
      <div className="mt-8 bg-surface-white border border-border-light rounded-xl p-6 space-y-3">
        <h2 className="font-label-md text-label-md font-bold text-primary">ENV Config</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-label-sm font-mono">
          <div><span className="text-on-surface-variant">VITE_STRAPI_BASE_URL:</span> <span className="text-primary font-bold">{import.meta.env.VITE_STRAPI_BASE_URL || 'NOT SET'}</span></div>
          <div><span className="text-on-surface-variant">VITE_CDN_URL:</span> <span className="text-primary font-bold">{CDN_URL}</span></div>
          <div><span className="text-on-surface-variant">BASE_URL (full):</span> <span className="text-primary font-bold">{BASE_URL}</span></div>
          <div><span className="text-on-surface-variant">VITE_STRAPI_API_KEY:</span> <span className={apiKey ? 'text-green-700' : 'text-error font-bold'}>{maskedKey}</span></div>
          <div><span className="text-on-surface-variant">API Key exists:</span> <span className={apiKey ? 'text-green-700 font-bold' : 'text-error font-bold'}>{apiKey ? 'YES ✅' : 'NO ❌ - buat .env'}</span></div>
          <div><span className="text-on-surface-variant">.env file:</span> <span className="text-on-surface-variant">Cek root, lihat .env.example</span></div>
        </div>
        {!apiKey && (
          <div className="bg-error-container text-on-error-container p-3 rounded-lg text-label-sm mt-2">
            API key belum diset! Buat file .env di root: <br />
            <code className="block bg-black/20 p-2 rounded mt-2">VITE_STRAPI_BASE_URL=https://cms.dinkominfo.pekalongankab.go.id<br/>VITE_CDN_URL=https://cdn.pekalongankab.go.id<br/>VITE_STRAPI_API_KEY=TOKEN_KAMU_PANJANG</code>
          </div>
        )}
      </div>

      {/* Quick status */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-xl border ${allOk ? 'bg-green-50 border-green-200' : 'bg-error-container border-error-container'}`}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined">{allOk ? 'check_circle' : 'error'}</span>
            <span className="font-label-md font-bold">Overall: {allOk ? 'CONNECTED ✅' : 'ISSUE ❌'}</span>
          </div>
          <p className="text-label-sm mt-1">{allOk ? 'Semua endpoint 200 OK, CMS terkoneksi' : 'Ada yang gagal, lihat detail bawah'}</p>
        </div>
        <div className="p-4 rounded-xl border bg-surface-white border-border-light">
          <p className="font-label-md font-bold text-primary">Articles</p>
          <p className="text-body-md mt-1">{loadingArticles ? 'Loading...' : errorArticles ? `Error: ${errorArticles}` : `${articles.length} loaded ✅ (total dari CMS: ${rawTests.articles?.count || '?'})`}</p>
          {articles.length > 0 && <p className="text-label-sm text-on-surface-variant mt-1">Sample: {articles[0].title.slice(0, 60)}...</p>}
        </div>
        <div className="p-4 rounded-xl border bg-surface-white border-border-light">
          <p className="font-label-md font-bold text-primary">Categories / Global</p>
          <p className="text-label-sm">Cats: {loadingCats ? 'loading' : errorCats ? `err ${errorCats}` : `${categories?.length} ✅`}</p>
          <p className="text-label-sm">Global: {loadingGlobal ? 'loading' : errorGlobal ? `err ${errorGlobal}` : globalData?.siteName ? `${globalData.siteName} ✅` : 'no'}</p>
          <p className="text-label-sm mt-1">Image rewrite test: {getStrapiImageUrl('/uploads/test.jpg')}</p>
        </div>
      </div>

      {/* Raw endpoint tests */}
      <div className="mt-6 bg-surface-white border border-border-light rounded-xl p-6">
        <h2 className="font-label-md text-label-md font-bold text-primary mb-4">Raw Endpoint Tests (fetch direct ke CMS)</h2>
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
          {Object.keys(rawTests).length === 0 && <p className="text-body-md text-on-surface-variant">Running tests...</p>}
        </div>
      </div>

      {/* Manual curl test commands */}
      <div className="mt-6 bg-surface-container-low rounded-xl p-6">
        <h2 className="font-label-md font-bold text-primary">Cara Test Manual (curl / browser / devtools)</h2>
        <div className="mt-3 space-y-4 text-label-sm font-mono">
          <div>
            <p className="font-bold text-primary font-sans">1. Browser DevTools (paling gampang):</p>
            <ul className="list-disc ml-5 mt-1 text-on-surface-variant font-sans space-y-1">
              <li>Buka halaman ini, tekan F12 → Tab Network → Refresh</li>
              <li>Lihat request ke <code>cms.dinkominfo.pekalongankab.go.id/api/articles</code> → harus 200 OK</li>
              <li>Klik request → Preview → lihat data JSON articles masuk</li>
              <li>Jika 403 Forbidden → API key salah / belum set / public role belum enable</li>
              <li>Jika 401 → token invalid / expired</li>
            </ul>
          </div>

          <div>
            <p className="font-bold text-primary font-sans mt-4">2. Console Test (paste di browser console F12):</p>
            <pre className="bg-surface-white border border-border-light rounded-lg p-3 overflow-auto text-xs mt-1">
{`const token = import.meta ? import.meta.env.VITE_STRAPI_API_KEY : "${maskedKey}";
// atau pakai token hardcode untuk test:
fetch("${BASE_URL}/articles?pagination[pageSize]=1&populate=*", {
  headers: { Authorization: \`Bearer \${"${apiKey ? apiKey.slice(0, 20) + '...': 'YOUR_TOKEN'}" }\` }
}).then(r => r.json()).then(j => console.log("✅ CMS OK, total:", j.meta?.pagination?.total, "sample:", j.data?.[0]?.title)).catch(e => console.error("❌", e))`}
            </pre>
          </div>

          <div>
            <p className="font-bold text-primary font-sans mt-4">3. curl (terminal):</p>
            <pre className="bg-surface-white border border-border-light rounded-lg p-3 overflow-auto text-xs mt-1">
{`TOKEN="${apiKey ? apiKey.slice(0, 20) + '...' : 'PASTE_TOKEN_HERE'}"
curl -H "Authorization: Bearer $TOKEN" \\
  "${BASE_URL}/articles?pagination%5BpageSize%5D=1&populate=%2A" | python3 -m json.tool | head -n 30

# Expected: {"data": [{"id": 6, "title": "Struktur Organisasi", ...}], "meta": {"pagination": {"total": 215}}}

# Jika 403:
# {"data":null,"error":{"status":403,"name":"ForbiddenError","message":"Forbidden"}}
# → Fix: cek token, atau enable public role di Strapi Admin > Users & Permissions > Public > article find, findOne

# Test tanpa token (harus 403 karena public belum enable):
curl "${BASE_URL}/articles?pagination%5BpageSize%5D=1" | python3 -m json.tool
`}
            </pre>
          </div>

          <div>
            <p className="font-bold text-primary font-sans mt-4">4. Cek di UI (visual):</p>
            <ul className="list-disc ml-5 mt-1 text-on-surface-variant font-sans space-y-1">
              <li>Buka <Link to="/" className="text-primary underline">Beranda</Link> → bagian Berita Terbaru harus 3 artikel dari CMS (judul real, bukan hardcode), kalau masih hardcode fallback → CMS gagal</li>
              <li>Buka <Link to="/berita" className="text-primary underline">Berita</Link> → harus list 9 artikel real dari CMS, filter kategori harus kategori CMS (27 kategori), bukan cuma 4 static</li>
              <li>Buka <Link to="/berita/visi-misi" className="text-primary underline">Detail Berita</Link> → harus load content HTML dari CMS (bukan static lorem)</li>
              <li>Buka <Link to="/galeri" className="text-primary underline">Galeri</Link> → harus 12 foto dari featuredImage CMS (kalau CMS ada image)</li>
              <li>Loading skeleton muncul dulu → lalu real data → berarti konek</li>
              <li>Kalau muncul "Gagal memuat berita" → cek error message di halaman ini</li>
            </ul>
          </div>

          <div>
            <p className="font-bold text-primary font-sans mt-4">5. Cek ENV:</p>
            <pre className="bg-surface-white border border-border-light rounded-lg p-3 overflow-auto text-xs mt-1">
{`cat .env
# Harus ada:
VITE_STRAPI_BASE_URL=https://cms.dinkominfo.pekalongankab.go.id
VITE_CDN_URL=https://cdn.pekalongankab.go.id
VITE_STRAPI_API_KEY=f2fdbf50... panjang

# Jika belum ada, copy dari .env.example:
cp .env.example .env
# lalu isi token

# Restart dev server setelah ganti .env:
npm run dev
`}
            </pre>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Link to="/" className="bg-primary text-on-primary px-6 py-3 rounded-lg font-label-md">Kembali ke Beranda</Link>
        <Link to="/berita" className="bg-surface-white border border-border-light text-primary px-6 py-3 rounded-lg font-label-md">Lihat Berita Real</Link>
      </div>
    </div>
  );
}
