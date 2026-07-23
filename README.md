# Dinkominfo Kabupaten Pekalongan — Portal Informasi Resmi

Portal resmi Dinas Komunikasi dan Informatika Kabupaten Pekalongan. UI/UX redesign dari [dinkominfo.pekalongankab.go.id](https://dinkominfo.pekalongankab.go.id/), dibangun dengan **Next.js + React + TypeScript + Tailwind CSS** dan terhubung ke **Strapi CMS** read-only.

- **Live Original:** https://dinkominfo.pekalongankab.go.id/
- **Logic Reference:** `/home/holmes/Documents/MAGANG/next-strapi-main/` (Next.js 16 App Router yang currently dipakai)

## Tech Stack

- **Next.js 15.5.4** + **React 19** + **TypeScript 6**
- **Tailwind CSS 3.4** + `@tailwindcss/forms` + `@tailwindcss/container-queries`
- **Strapi CMS v5** — 215 articles, 27 categories, pages, menus, global settings
- Fonts: Inter + Material Symbols Outlined (Google Fonts)

## Design — 100% Persis dari Redesign

- **Tokens:** `primary #002a58` navy, `secondary-container #fecb00` yellow, `surface-white #FFF`, `surface-container-low #f6f3f2`, `border-light #DEE2E6`, `on-surface #1b1c1c`, layout `container-max 1200px`, `margin-desktop 32px`, `gutter 24px`, `section-padding 64px`
- **Typography:** Inter — `display-lg 48/56 700`, `headline-lg 32/40 700`, `headline-md 24/32 600`, `body-lg 18/30`, `body-md 16/26`, `label-md 14/20 600`
- **Effects:** `hero-gradient` linear to right `rgba(0,42,88,0.9→0.3)`, `hover-card` translateY -4px shadow, `line-clamp-2/3`, `glass-effect` blur 8px, mobile 44px tap targets, `html.dark` overrides surfaces `#1a1c1e/#1e2023`, text `#e6e1e0`
- **Semua className verbatim** dari static original — header sticky `h-16 md:h-20 shadow-md`, footer `bg-primary dark:bg-surface-container-lowest`, cards `surface-white rounded-xl border border-light shadow-sm hover-card`

## Cara Jalan

```bash
# Install
npm install

# Env (wajib untuk CMS)
cp .env.example .env.local
# isi STRAPI_API_KEY dengan token read-only dari Strapi Admin > Settings > API Tokens

# Dev
npm run dev
# http://localhost:3000/

# Build
npm run build
npm run start
```

### ENV

```
NEXT_PUBLIC_STRAPI_BASE_URL=https://cms.dinkominfo.pekalongankab.go.id
NEXT_PUBLIC_CDN_URL=https://cdn.pekalongankab.go.id
STRAPI_BASE_URL=https://cms.dinkominfo.pekalongankab.go.id
STRAPI_API_KEY=f2fdbf50... (server-only, token read-only)
```

Public role CMS saat ini **403 Forbidden** tanpa token — wajib Bearer. Token disimpan di `.env.local` (git-ignored) dan hanya dipakai server.

## Struktur

```
.
├── next.config.mjs
├── tailwind.config.js      # 40+ colors, spacing, fontSize - persis dari tailwind-config.js lama — KEEP v3.4 untuk 100% verbatim UI (jangan v4)
├── postcss.config.js
├── public/
│   └── assets/
│       ├── logo-kominfo.png
│       └── foto-kominfo.png
└── src/
    ├── assets/             # logo + foto
    ├── components/
    │   ├── Header/Header.tsx # sticky h-16 md:h-20, active nav, theme toggle, mobile menu
    │   └── Footer/FooterNext.tsx # CMS social/copyright and newsletter
    ├── context/
    │   └── ThemeContext.tsx# light/dark, localStorage, prefers, html class — anti-FOUC, same as original js/components.js — jadi providers.tsx di Next ("use client")
    ├── data/
    │   └── articles.ts     # legacy mock fallback
    ├── lib/
    │   ├── getCdnBaseUrl.ts      # public NEXT_PUBLIC_CDN_URL helper
    │   ├── getStrapiImageUrl.ts  # regex cms\.[^.]+\.pekalongankab.go.id -> cdn, /uploads -> CDN — verbatim ref, public safe
    │   ├── formatDate.ts         # formatDateID id-ID short + formatDate long — dari ref lib/fomatDate.ts (fix typo)
    │   ├── constants.ts          # ARTICLES_PAGE_SIZE 9, LATEST_LIMIT 3, GALERI 12
    │   ├── actions/              # CMS query/transformation logic, one endpoint per file
    │   │   ├── getArticles.ts        # params {query, category, page, pageSize, sort, limit} -> qs filters $or containsi + pub_date lte now + populate * + pagination
    │   │   ├── getArticle.ts         # getArticleBySlug + getArticleByDocumentId, populate category/tags/author/featuredImage/relatedArticles/pdfViewer
    │   │   ├── getLatestArticles.ts  # sort pub_date desc, pagination[limit]
    │   │   ├── getCategories.ts      # filters slug containsi
    │   │   ├── getGlobal.ts          # populate siteIcon/siteIconDark/favicon/socialMedia/footerItems/defaultSeo — mirip getGlobalSettings ref
    │   │   ├── getHomePage.ts        # heroSlider + sections.blocks on widgets.* 18 types + asides.item — mirip getHomePage ref verbatim
    │   │   ├── getPage.ts            # filters slug eq, populate sections.blocks on widgets.* + asides + forms — mirip getPage ref
    │   │   ├── getMenuItems.ts       # getMenuItems (Main Menu) + getTopbarMenu (Top Left/Right) — mirip getMenuItems + getTopbarMenu ref
    │   │   └── getContactPage.ts     # populate featuredImage + contactList — mirip getContactPage ref
    │   └── api/
    │       ├── client.ts       # public URL/query types; browser code uses same-origin proxy
    │       ├── client.server.ts# NEW di Next — server-only getHeaders reading STRAPI_API_KEY + STRAPI_BASE_URL with import "server-only" — token tidak di client bundle
    │       └── client.server.ts # server-only STRAPI_API_KEY and Bearer headers
    ├── types/
    │   └── cms.ts          # ArticleCMS, CategoryCMS, StrapiMedia, MenuItemCMS, GlobalCMS, HomePageCMS, PageCMS, SectionCMS — manual (ref ada strapi.d.ts generated)
    ├── pages/              # Next App Router pages live under src/app/(root)
    │   ├── HomePage.tsx          # hero 500/600px + quick links -mt-10 + BERITA REAL useLatestArticles(3) + city news + galeri bento + social glass
    │   ├── ArticlesPage.tsx      # filter kategori useCategories() 27 kategori + list REAL pagination ?page= + search ?query=&category= — akan jadi berita/page.tsx server + BeritaClient.tsx "use client" fetch /api/articles proxy
    │   ├── ArticleDetailPage.tsx # slug/docId detection isStrapiDocumentId() regex ^[a-z0-9]{20,30}$, dash>=3 && len>30 => slug, fetch real, prose HTML, share, related 3 — akan jadi berita/[id]/page.tsx server
    │   ├── ContentPage.tsx       # CMS-only 4 docs profil category=profil
    │   ├── LayananPage.tsx       # 6 cards static + info query=layanan
    │   ├── GaleriPage.tsx        # bento auto-rows 150/200, 12 articles REAL featuredImage
    │   ├── UnduhanPage.tsx       # static 6 + check CMS download
    │   ├── KontakPage.tsx        # contact-page REAL /api/contact-page?populate=*, form demo alert — akan jadi kontak/page.tsx server + KontakFormClient.tsx "use client"
    │   └── CmsTestPage.tsx       # /cms-test — ENV + 7 endpoint raw tests + curl guide — akan jadi cms-test/page.tsx server wrapper + CmsTestClient.tsx "use client" fetch /api/* proxy
    ├── app/                # Next App Router aktif; primary runtime `npm run dev`
    │   ├── layout.tsx            # Root layout html lang="id" + anti-FOUC script + Inter + providers
    │   ├── globals.css           # @tailwind base/components/utilities + custom.css verbatim
    │   ├── providers.tsx         # "use client" ThemeProvider
    │   ├── (root)/layout.tsx     # Header + main + Footer
    │   ├── (root)/page.tsx       # Home UI current; CMS read via /api proxy
    │   ├── (root)/berita/page.tsx + BeritaClient.tsx + [id]/page.tsx
    │   ├── (root)/kontak/page.tsx + KontakFormClient.tsx
    │   └── api/ (proxy mandatory) — articles, articles/[id], categories, global, contact-page, menu-items, home-page, pages
    └── app/                # Next App Router pages and /api/* CMS proxy
```

## Routes

| Path | Halaman | Data |
|------|---------|------|
| `/` | Beranda | Hero static + Berita REAL `latest-articles` 3 + Galeri + Social |
| `/berita` | Berita Terkini | List REAL 9/pagination `?page=` + filter kategori CMS `?category=` + search `?query=` |
| `/berita/:id` | Detail Berita | Slug atau documentId - `GET /api/articles?filters[slug][$eq]` + populate |
| `/profil` | Profil Dinkominfo | CMS-only - 4 docs `category=profil` |
| `/layanan` | Layanan | 6 cards static + info `query=layanan` |
| `/galeri` | Galeri Kegiatan | Bento `col-span-2 row-span-2` - 12 featuredImage REAL |
| `/unduhan` | Unduhan & Informasi Publik | Static 6 docs + check CMS download |
| `/kontak` | Kontak & Pengaduan | `/api/contact-page?populate=*` + form |
| `/cms-test` | CMS Test Manual | ENV + 7 endpoint raw tests + curl + devtools guide |
| `/pages/*.html` | Legacy | Redirect ke route baru |

## CMS Integration (Logic dari next-strapi-main)

Pattern fetch identik dengan `next-strapi-main/src/lib/actions/*.ts`:

```ts
// next-strapi-main/src/lib/actions/getArticle.ts
const qs = qs.stringify({
  filters: { slug: { $eq: slug } },
  populate: { category: { fields: ["name","slug"] }, featuredImage: { populate: "*" } }
})
fetch(`${STRAPI_BASE_URL}/api/articles?${qs}`, {
  headers: { Authorization: `Bearer ${API_KEY}` },
  next: { revalidate: 86400, tags: [`article-${slug}`] }
})

// src/lib/actions/getArticles.ts tetap menjadi query/transformation owner.
import { BASE_URL, getHeaders } from '../api/client' // Vite: getHeaders ada token, Next final: getHeadersServer dari client.server.ts server-only
const q = qs.stringify({
  sort: "publication_date:desc",
  filters: { $or: [...], category: { slug: { $containsi } }, publication_date: { $lte: now } },
  populate: "*", pagination: { pageSize: 9 }
}, { encodeValuesOnly: true })
fetch(`${BASE_URL}/articles?${q}`, { headers: getHeaders() })
// Proxy route memakai getHeadersServer() untuk Bearer server-only.
// Client interaktif (BeritaClient, KontakFormClient, CmsTestClient) tidak import actions langsung, tapi fetch('/api/articles?...) proxy yang pakai server token internally
```

- **Image:** `getStrapiImageUrl` — `/uploads/...` → `https://cdn.pekalongankab.go.id/uploads/...`, `https://cms.dinkominfo.../uploads/...` → `https://cdn.../...` (same `getStrapiImageUrl.ts`)
- **Endpoints:** `/api/articles` (215), `/categories` (27), `/pages` (8), `/global`, `/home-page`, `/contact-page`, `/menu-items` (Main Menu 12 items)
- **Auth:** Bearer read-only API Token, public 403 without token
- **Response Strapi v5:** `{ data: [...], meta: { pagination: { page, pageSize, pageCount, total } } }` + `documentId` field

## Test Manual Koneksi CMS

### 1. Halaman /cms-test (Paling Gampang)

```bash
npm run dev
# buka http://localhost:3000/cms-test
```

Di halaman ini:
- ENV config (masked API key, BASE_URL, CDN_URL)
- Overall CONNECTED ✅ / ISSUE ❌
- Articles 3 loaded, Categories, Global
- **7 endpoint raw tests** `/api/articles`, `/categories`, `/global`, `/home-page`, `/contact-page`, `/pages`, `/menu-items` — masing-masing harus **200 OK hijau** + count (e.g. articles total 215)
- Guide curl + devtools + console + visual check

### 2. Browser DevTools F12

- F12 → Network → Refresh → filter `cms.dinkominfo`
- Request `api/articles?pagination...` → 200 OK → Preview → JSON articles masuk
- 403 → token salah/belum set, 401 → invalid

### 3. Console (F12)

```js
fetch("https://cms.dinkominfo.pekalongankab.go.id/api/articles?pagination[pageSize]=1&populate=*", {
  headers: { Authorization: `Bearer YOUR_TOKEN` }
}).then(r => r.json()).then(j => console.log("✅ total:", j.meta?.pagination?.total, j.data?.[0]?.title))
```

### 4. curl

```bash
TOKEN="f2fdbf50..."
curl -H "Authorization: Bearer $TOKEN" \
  "https://cms.dinkominfo.pekalongankab.go.id/api/articles?pagination%5BpageSize%5D=1&populate=%2A" | python3 -m json.tool | head -n 20
# Expected: {"data": [{"title": "Struktur Organisasi", ...}], "meta": {"pagination": {"total": 215}}}
```

### 5. Visual UI

- `/` → Berita Terbaru harus 3 judul real CMS (bukan hardcode 2023/2024 static), ada loading skeleton bentar
- `/berita` → 9 artikel real, filter pills harus kategori CMS real (27 kategori), pagination real pageCount
- `/berita/visi-misi` → content HTML panjang dari CMS
- `/galeri` → 12 foto featuredImage
- `/cms-test` → semua hijau

## Bugfix History

- **Slug panjang Not Found:** `/berita/dinkominfo-kabupaten-pekalongan-perkuat-...` slug panjang 120 chars dengan banyak `-` ke-detect sebagai `documentId` → fetch by documentId gagal. Fix `isStrapiDocumentId()` — documentId Strapi v5 = 25 alphanum lowercase no dash (e.g. `a3rkzd3y47hqddmhtso115np`), slug = kebab-case `dash>=3 && length>30` → slug. Hooks fallback retry slug ↔ documentId.

## Build

```bash
npm run build
# dist/index.html 0.99kB + css 34kB + js 372kB gzip 106kB + assets logo 102kB + foto 1.8MB
```

## Gitignore

```
.omo/ DESIGN.md docs/superpowers/plans/ node_modules/ dist/ build/ .env .env.local NEXT_AGENT_README.md NEXT_AGENT*.md CMS_STATUS*.md .superpowers/ .codex/ .claude/
```

`docs/superpowers/plans/` berisi plan lama static->React yang git-ignored. `NEXT_AGENT_README.md` deprecated dan digantikan `AGENTS.md`. `.omo/plans/pure-next-finalization.md` memegang keputusan dan cleanup Vite bila disetujui; `.omo/docs/UI_LOGIC_POSITION_MAPPING.md` memetakan logic referensi ke UI redesign. `.env` dan `.env.local` git-ignored; `.env.example` tetap tracked.

Runtime portal adalah pure Next: `npm run dev`, `npm run build`, dan `npm run start`. ENV contract: server-only `STRAPI_API_KEY` + `STRAPI_BASE_URL`, public `NEXT_PUBLIC_STRAPI_BASE_URL` + `NEXT_PUBLIC_CDN_URL`, proxy `/api/*` mandatory, Tailwind v3.4 dan Next 15.5.4 tetap pinned, dan `NEXT_PUBLIC_STRAPI_API_KEY` dilarang.

## Reference

- Static redesign original: `index.html` 308 lines + `pages/` 7 html + `components/header/footer.html` + `css/style.css` + `tailwind-config.js` (commit history sebelum React)
- CMS CMS logic ref: `/home/holmes/Documents/MAGANG/next-strapi-main` — Next.js 16.1.6 App Router, `qs` 6.14.1, `@tanstack/react-query` 5.66, `@plaiceholder/next`, `openapi-typescript` generated `strapi.d.ts`, server actions `fetch(...Bearer...)` + `next revalidate 86400 tags`, `getStrapiImageUrl` cdn rewrite, image blurData, dynamic zone `widgets.*` 18 types, markdown `react-markdown` + `rehypeRaw`, forms zod, auth JWT httpOnly cookie
