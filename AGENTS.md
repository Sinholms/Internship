# AGENTS.md — Dinkominfo Pekalongan Portal

> Dokumen ini untuk AI agent & manusia yang kerjain repo ini. Baca dulu sebelum coding.

## 0. Ringkasan

- Portal Dinkominfo Kab. Pekalongan redesign. UI 100% persis static original, token `primary #002a58`, `secondary-container #fecb00`.
- Stack: Vite 6 + React 19 + TS 6 + React Router 7 + Tailwind 3.4 + Strapi CMS v5 (215 articles, 27 cats).
- Logic ref: `/home/holmes/Documents/MAGANG/next-strapi-main/` (Next.js 16 App Router). Struktur `src/lib/` di sini dibikin mirip ref, tapi tanpa inovasi — hanya yang perlu.
- Original live: https://dinkominfo.pekalongankab.go.id/

## 1. Cara Jalan

```bash
npm install
cp .env.example .env   # isi VITE_STRAPI_API_KEY read-only token
npm run dev            # http://localhost:5173/
npm run build          # tsc -b && vite build -> dist/
npm run preview
```

ENV (.env git-ignored):
```
VITE_STRAPI_BASE_URL=https://cms.dinkominfo.pekalongankab.go.id
VITE_CDN_URL=https://cdn.pekalongankab.go.id
VITE_STRAPI_API_KEY=f2f... (Bearer, public role 403 tanpa token)
```

## 2. Struktur Folder (mirip reference logic)

```
src/
├── lib/                          # mirip next-strapi-main/src/lib/
│   ├── getCdnBaseUrl.ts          # default export () -> CDN_BASE_URL (VITE_CDN_URL). Mirip lib/getCdnBaseUrl.ts ref.
│   ├── getStrapiImageUrl.ts      # regex cms\.[^.]+\.pekalongankab.go.id -> cdn.pekalongankab.go.id, /uploads -> CDN. Verbatim ref.
│   ├── formatDate.ts             # formatDateID (id-ID short) + formatDate long. Dari ref lib/fomatDate.ts (fix typo).
│   ├── constants.ts              # ARTICLES_PAGE_SIZE 9, LATEST_LIMIT 3, GALERI 12
│   ├── actions/                  # mirip ref lib/actions/ - 1 file 1 endpoint, no "use server"
│   │   ├── getArticles.ts        # params {query, category, page, pageSize, sort, limit} -> qs filters $or containsi + pub_date lte now + populate * + pagination
│   │   ├── getArticle.ts         # getArticleBySlug + getArticleByDocumentId, populate category/tags/author/featuredImage/relatedArticles/pdfViewer
│   │   ├── getLatestArticles.ts  # sort pub_date desc, pagination[limit]
│   │   ├── getCategories.ts      # filters slug containsi
│   │   ├── getGlobal.ts          # populate siteIcon/siteIconDark/favicon/socialMedia/footerItems/defaultSeo - mirip getGlobalSettings ref
│   │   ├── getHomePage.ts        # heroSlider + sections.blocks on widgets.* 18 types + asides.item on widgets.* - mirip getHomePage ref verbatim
│   │   ├── getPage.ts            # filters slug eq, populate sections.blocks on widgets.* + asides + forms - mirip getPage ref
│   │   ├── getMenuItems.ts       # getMenuItems (Main Menu) + getTopbarMenu (Top Left/Right) - mirip getMenuItems + getTopbarMenu ref
│   │   └── getContactPage.ts     # populate featuredImage + contactList - mirip getContactPage ref
│   └── api/
│       ├── client.ts             # BASE_URL = STRAPI_BASE_URL/api, CDN_URL re-export CDN_BASE_URL, getHeaders() Bearer, StrapiListResponse/Single + strapiFetch<T>(endpoint, queryObject)
│       ├── queries.ts            # SHIM re-export dari ../actions/* (backward compat)
│       └── image.ts              # SHIM re-export getStrapiImageUrl dari ../getStrapiImageUrl + formatDateID dari ../formatDate
├── hooks/
│   └── useCms.ts                 # useAsync + useArticles + useLatestArticles + useArticleBySlug (fallback docId) + useArticleByDocumentId + useCategories + useGlobal + useHomePage + usePageBySlug + useMenuItems - import dari lib/actions/*
├── types/
│   └── cms.ts                    # StrapiMedia, CategoryCMS, ArticleCMS, MenuItemCMS, GlobalCMS, HomePageCMS, PageCMS, SectionCMS - manual (ref ada strapi.d.ts generated)
├── components/
│   ├── Header.tsx                # sticky h-16 md:h-20, NAV_ITEMS hardcode 7, active isActive(), theme toggle, scroll shadow >20px, mobile menu
│   ├── Footer.tsx                # 12-col grid, fetch /global?populate=*, social dari CMS, newsletter, copyright
│   ├── Layout.tsx                # Header + main + Footer
│   └── ScrollToTop.tsx
├── pages/
│   ├── HomePage.tsx              # hero 500/600px + quick links -mt-10 + BERITA REAL useLatestArticles(3) + city news static + galeri bento static + social glass
│   ├── ArticlesPage.tsx          # filter kategori useCategories() 27 kategori + list REAL pagination ?page= + search ?query=&category= - import dari lib/getStrapiImageUrl + lib/formatDate
│   ├── ArticleDetailPage.tsx     # slug/docId detection isStrapiDocumentId() (regex ^[a-z0-9]{20,30}$, dash>=3 && len>30 => slug), fetch real, prose HTML, share, related 3
│   ├── ContentPage.tsx           # CMS-only 4 docs profil category=profil
│   ├── LayananPage.tsx           # 6 cards static + info query=layanan
│   ├── GaleriPage.tsx            # bento auto-rows 150/200, 12 articles REAL featuredImage
│   ├── UnduhanPage.tsx           # static 6 + check CMS download
│   ├── KontakPage.tsx            # contact-page REAL /api/contact-page?populate=*, form demo alert
│   └── CmsTestPage.tsx           # /cms-test - ENV + 7 endpoint raw tests + curl guide
├── context/ThemeContext.tsx      # light/dark localStorage + prefers + html class - mirip original js/components.js
├── data/articles.ts              # legacy mock fallback
├── styles/custom.css             # hero-gradient linear to right rgba(0,42,88,0.9->0.3), hover-card translateY -4px, line-clamp, html.dark surfaces #1a1c1e/#1e2023
├── index.css                     # @tailwind directives
├── App.tsx                       # BrowserRouter + Routes / /berita /berita/:id /profil /layanan /galeri /unduhan /kontak /cms-test + legacy /pages/*.html redirects
└── main.tsx
```

Mapping ke ref:
- `next-strapi-main/src/lib/actions/getArticles.ts` -> `src/lib/actions/getArticles.ts` (adapt process.env -> import.meta.env)
- `getStrapiImageUrl.ts` -> `src/lib/getStrapiImageUrl.ts` (regex verbatim)
- `getCdnBaseUrl.ts` -> `src/lib/getCdnBaseUrl.ts` (NEXT_PUBLIC_CDN -> VITE_CDN_URL)
- `fomatDate.ts` -> `src/lib/formatDate.ts` (fix typo, tambah formatDateID)
- `getGlobalSettings.ts` -> `getGlobal.ts`, `getHomePage.ts` sama, `getPage.ts` sama, `getMenuItems.ts` + `getTopbarMenu.ts` gabung 1 file

## 3. Pattern Fetch (wajib ikuti)

```ts
// client.ts
const STRAPI_BASE_URL = import.meta.env.VITE_STRAPI_BASE_URL
export const BASE_URL = `${STRAPI_BASE_URL}/api`
export function getHeaders() { return { Accept:'application/json', Authorization: `Bearer ${TOKEN}` } }

// actions/*.ts (mirip ref, tanpa "use server" + tanpa next revalidate)
import qs from 'qs'
import { BASE_URL, getHeaders } from '../api/client'
const q = qs.stringify({ filters: {...}, populate: {...}, pagination:{...} }, {encodeValuesOnly:true})
const res = await fetch(`${BASE_URL}/articles?${q}`, { headers: getHeaders() })
```

- `qs.stringify` selalu `encodeValuesOnly:true` - sama ref.
- Image: `getStrapiImageUrl(url)` -> cms subdomain rewrite + /uploads -> CDN.
- Types: manual di `types/cms.ts`, bukan generated `strapi.d.ts` (ref pakai openapi-typescript).

## 4. Import Rule Baru (setelah refactor mirip ref)

```ts
// BENAR (baru)
import { getStrapiImageUrl } from '../lib/getStrapiImageUrl'
import { formatDateID } from '../lib/formatDate'
import { getArticles } from '../lib/actions/getArticles'
import { getArticleBySlug } from '../lib/actions/getArticle'

// MASIH BOLEH (shim backward compat, tapi jangan pakai untuk kode baru)
import { getStrapiImageUrl, formatDateID } from '../lib/api/image'
import { getArticles } from '../lib/api/queries'

// hooks
import { useLatestArticles, useArticles } from '../hooks/useCms'
```

Pages sudah migrasi ke path baru. Shim `api/image.ts` + `api/queries.ts` cuma re-export.

## 5. UI Rules (JANGAN DILANGGAR)

- 100% persis redesign static. className verbatim: `bg-primary`, `text-on-primary`, `surface-white rounded-xl border border-light shadow-sm hover-card`, `h-16 md:h-20 shadow-md`, `material-symbols-outlined`.
- Token di `tailwind.config.js`: `primary #002a58`, `secondary-container #fecb00`, `surface-white #FFF`, `surface-container-low #f6f3f2`, `border-light #DEE2E6`, `container-max 1200px`, `margin-desktop 32px`, `gutter 24px`, `section-padding 64px`.
- Typography: Inter `display-lg 48/56 700`, `headline-lg 32/40 700`, `body-lg 18/30` etc.
- Dark: `html.dark` overrides di `custom.css` - surfaces `#1a1c1e/#1e2023`, text `#e6e1e0`.
- Mobile: tap target min 44px, grid `grid-cols-2 md:grid-cols-4`, `h-[500px] md:h-[600px]`.

## 6. Bugfix Penting

- Slug panjang Not Found: `/berita/dinkominfo-kab-...` slug panjang 120 chars banyak `-` ke-detect docId. Fix `isStrapiDocumentId()`: docId Strapi v5 = `^[a-z0-9]{20,30}$` no dash (e.g. `a3rkzd3y47hqddmhtso115np`), slug = kebab-case `dash>=3 && length>30` -> slug. Hooks fallback retry slug <-> docId.

## 7. Testing Manual CMS

- `/cms-test` paling gampang: ENV masked + 7 endpoint (articles 215, categories, global, home-page, contact-page, pages, menu-items) harus 200 OK hijau + count.
- DevTools F12 Network filter `cms.dinkominfo` -> `api/articles?...` 200 OK.
- curl:
```bash
curl -H "Authorization: Bearer $TOKEN" "https://cms.dinkominfo.pekalongankab.go.id/api/articles?pagination[pageSize]=1&populate=*" | python3 -m json.tool | head
```

Visual: `/` -> Berita Terbaru 3 judul real CMS (bukan hardcode 2023), `/berita` 9 artikel real, filter pills kategori CMS real 27, `/berita/visi-misi` content HTML panjang, `/galeri` 12 foto.

## 8. Do & Don't

Do:
- Logic baru taruh di `lib/actions/` per-file, mirip ref, tanpa inovasi.
- Import image/date dari `lib/getStrapiImageUrl`, `lib/formatDate`.
- `useCms.ts` import dari `lib/actions/*`.
- Build harus pass `npm run build`.
- ENV via `import.meta.env.VITE_*`, bukan `process.env`.

Don't:
- Don't ubah className/tailwind tokens/custom.css - UI locked.
- Don't tambah deps baru (clsx, tailwind-merge, embla, react-markdown dll) - belum perlu, struktur mirip aja cukup.
- Don't pakai `"use server"`, `next: {revalidate, tags}`, `cookies()` - itu Next-only. Vite client fetch biasa.
- Don't `as any`, `@ts-ignore`.

## 9. Git Rules

1. NO force push unless absolutely necessary. If forced, MUST ask user permission first every time.
2. NO AI/dev attribution in commits. No co-author trailers, no "Generated with"/"Ultraworked with" footers. Only user's account appears in git history.
3. User minta "jangan langsung push n commit" -> jangan push/commit sampai diminta. Kerja local dulu.

## 10. Modes

- Caveman mode: repo root punya global AGENTS.md di `~/.config/opencode/AGENTS.md` -> terse like smart caveman. Technical terms exact, code unchanged. Switch `/caveman lite|full|ultra|wenyan`, stop `stop caveman` / `normal mode`. Boundaries: code/commits/PRs written normal.
- Ponytail available: `simplest working, YAGNI`.

## 11. Files Diabaikan

`.omo/`, `docs/superpowers/plans/`, `.env`, `node_modules/`, `dist/`, `build/`, `.superpowers/`, `.codex/`, `.claude/` git-ignored. `.env.example` tracked sebagai template.
`NEXT_AGENT_README.md` tracked ringkas, full doc `.omo/docs/CMS_INTEGRATION_STATUS.md` git-ignored (342 baris).
