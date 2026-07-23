# AGENTS.md — Dinkominfo Pekalongan Portal

> Dokumen ini untuk AI agent & manusia yang kerjain repo ini. Baca dulu sebelum coding.

## 0. Ringkasan

- Portal Dinkominfo Kab. Pekalongan redesign. UI 100% persis static original, token `primary #002a58`, `secondary-container #fecb00`.
- Stack: **Next.js 15.5.4** (App Router) + React 19.2.4 + TS + Tailwind 3.4.17 + Strapi CMS v5 (215 articles, 27 cats). Repository pure Next; Vite runtime has been retired.
- Logic ref: `/home/holmes/Documents/MAGANG/next-strapi-main/` (Next.js 16 App Router). Struktur `src/lib/` dibikin mirip ref.
- Original live: https://dinkominfo.pekalongankab.go.id/
- Branch: `feat/next-migration` — Next final, proxy `/api/*` mandatory, token server-only `STRAPI_API_KEY`, public URL `NEXT_PUBLIC_STRAPI_BASE_URL` + `NEXT_PUBLIC_CDN_URL`, no `NEXT_PUBLIC_STRAPI_API_KEY`.

## 1. Cara Jalan

```bash
npm install
cp .env.example .env.local   # Next: isi STRAPI_API_KEY + NEXT_PUBLIC_* 
npm run dev                  # Next dev http://localhost:3000/
npm run build                # Next build -> .next/
npm run start                # Next start -p 3000
```

ENV (.env.local git-ignored):
```
# Next final - ENV contract (Momus OKAY)
NEXT_PUBLIC_STRAPI_BASE_URL=https://cms.dinkominfo.pekalongankab.go.id
NEXT_PUBLIC_CDN_URL=https://cdn.pekalongankab.go.id
NEXT_PUBLIC_CDN=https://cdn.pekalongankab.go.id
STRAPI_BASE_URL=https://cms.dinkominfo.pekalongankab.go.id (server copy, same as public)
STRAPI_API_KEY=f2f... (Bearer, server-only, never NEXT_PUBLIC)

```

## 2. Struktur Folder (Next final)

```
src/
├── app/                              # Next App Router (baru, final)
│   ├── layout.tsx                    # html lang="id" light scroll-smooth, anti-FOUC script, Inter + material symbols, body
│   ├── globals.css                   # @tailwind base/components/utilities + custom.css verbatim (hero-gradient, hover-card, dark overrides)
│   ├── providers.tsx                 # "use client" ThemeProvider wrapper
│   ├── (root)/
│   │   ├── layout.tsx                # Header + main + FooterNext (client)
│   │   ├── page.tsx                  # Home hero 500/600px + quick links -mt-10 + BERITA REAL via /api/articles proxy 3 + galeri bento + social glass
│   │   ├── berita/
│   │   │   ├── page.tsx              # Server wrapper: fetch initial via BASE_URL_SERVER + getHeadersServer, passes to BeritaClient
│   │   │   ├── BeritaClient.tsx      # "use client" filter pills 27 cats via /api/categories proxy + list 9 pagination via /api/articles proxy + search ?query=&category=
│   │   │   └── [id]/page.tsx         # "use client" slug/docId detection isStrapiDocumentId() regex ^[a-z0-9]{20,30}$, long slug 120 NOT docId, fetch /api/articles?filters[slug|docId]&populate=*, related 3 via proxy
│   │   ├── profil/page.tsx           # "use client" category=profil 4 docs via /api proxy, TOC sticky top-28
│   │   ├── layanan/page.tsx          # 6 cards static + info query=layanan via proxy
│   │   ├── galeri/page.tsx           # bento auto-rows 150/200, 12 articles via /api proxy featuredImage
│   │   ├── unduhan/page.tsx          # static 6 + check CMS download via proxy
│   │   ├── kontak/
│   │   │   ├── page.tsx              # Server wrapper: fetch contact-page via getHeadersServer server-only, passes to KontakFormClient
│   │   │   └── KontakFormClient.tsx  # "use client" form demo alert, displays contactList from props, no server-only import
│   │   └── cms-test/
│   │       ├── page.tsx              # Server wrapper: reads NEXT_PUBLIC_* env server-masked + STRAPI_API_KEY existence, passes masked to client
│   │       └── CmsTestClient.tsx     # "use client" 7 endpoint raw tests via /api/* proxy (no token), loading skeleton, cancel flag
│   └── api/                          # Proxy mandatory - Bearer server injected, client no token
│       ├── articles/route.ts         # Forwards searchParams to Strapi with getHeadersServer(), revalidate 3600 tags articles
│       ├── articles/[id]/route.ts    # Slug OR docId detection + fallback, populate category/tags/author/featuredImage/relatedArticles/pdfViewer
│       ├── categories/route.ts       # Forward categories
│       ├── global/route.ts           # Forward global?populate=* siteIcon/socialMedia/footerItems/defaultSeo
│       ├── contact-page/route.ts     # Forward contact-page?populate=*
│       ├── menu-items/route.ts       # Forward menu-items Main Menu sort order asc pageSize 100
│       ├── home-page/route.ts        # Forward home-page heroSlider sections.blocks
│       └── pages/route.ts            # Forward pages
├── components/
│   ├── Header/Header.tsx             # "use client" sticky h-16 md:h-20, NAV_ITEMS 7 hardcode, active isActive(), usePathname(), theme toggle, scroll shadow >20px, mobile menu 44px tap
│   └── Footer/FooterNext.tsx         # "use client" fetch /api/global proxy, 12-col grid, social CMS, newsletter, copyright
├── lib/
│   ├── getCdnBaseUrl.ts              # NEXT_PUBLIC_CDN_URL || NEXT_PUBLIC_CDN fallback
│   ├── getStrapiImageUrl.ts          # regex cms\.[^.]+\.pekalongankab.go.id -> cdn, /uploads -> CDN - verbatim ref, public safe
│   ├── formatDate.ts                 # formatDateID id-ID short + formatDate long
│   ├── constants.ts                  # ARTICLES_PAGE_SIZE 9, LATEST_LIMIT 3, GALERI 12
│   ├── actions/                      # mirror ref lib/actions/ - 1 file 1 endpoint, query/transformation logic
│   │   ├── getArticles.ts            # qs filters $or containsi + pub_date lte now + populate * + pagination
│   │   ├── getArticle.ts             # BySlug + ByDocId populate
│   │   ├── getLatestArticles.ts      # sort pub_date desc limit
│   │   ├── getCategories.ts          # slug containsi
│   │   ├── getGlobal.ts              # populate siteIcon etc
│   │   ├── getHomePage.ts            # heroSlider + sections.blocks on widgets.* 18 types
│   │   ├── getPage.ts                # filters slug eq
│   │   ├── getMenuItems.ts           # Main Menu + Topbar
│   │   └── getContactPage.ts         # populate featuredImage + contactList
│   └── api/
│       ├── client.ts                 # Public URL/query helper; client UI uses same-origin proxy
│       ├── client.server.ts          # Server-only: import "server-only", BASE_URL_SERVER = STRAPI_BASE_URL/api, getHeadersServer() Bearer STRAPI_API_KEY (never NEXT_PUBLIC token), warn if missing
├── hooks/
│   └── types/cms.ts                  # manual CMS types
├── types/
│   └── cms.ts                        # manual types
├── context/ThemeContext.tsx          # light/dark localStorage + prefers + html class, SSR guard (typeof window/document)
├── data/articles.ts                  # legacy mock fallback
├── index.css                         # @tailwind directives for Vite
└── types/cms.ts                      # manual CMS types
```

Mapping ke ref:
- `next-strapi-main/src/lib/actions/getArticles.ts` -> `src/lib/actions/getArticles.ts`
- `getStrapiImageUrl.ts` verbatim, `getCdnBaseUrl.ts` dual, `fomatDate.ts` fix typo
- `getGlobalSettings.ts` -> `getGlobal.ts`, etc.
- `src/lib/api/client.server.ts` NEW server-only `STRAPI_API_KEY` + `STRAPI_BASE_URL` with `import "server-only"` - token tidak di client bundle

## 3. Pattern Fetch (final Next)

```ts
// client.server.ts (server-only)
import "server-only"
const BASE_URL = `${process.env.STRAPI_BASE_URL || process.env.NEXT_PUBLIC_STRAPI_BASE_URL}/api`
export function getHeadersServer() { return { Authorization: `Bearer ${process.env.STRAPI_API_KEY}` } }

// client.ts (public safe, no token)
export const BASE_URL = `${NEXT_PUBLIC_STRAPI_BASE_URL}/api`
export function getHeaders() { return public headers only; client UI uses proxy }

// actions/*.ts provide reusable query/transformation logic
// In Next app, prefer proxy /api/* rather than direct actions

// app/api/articles/route.ts proxy mandatory
const res = await fetch(`${BASE_URL_SERVER}/articles?${searchParams}`, { headers: getHeadersServer(), next:{revalidate:3600, tags:["articles"]} })

// app/(root)/berita/BeritaClient.tsx "use client" fetches from proxy (no token)
fetch(`/api/articles?${qs}`) -> returns JSON, server injected Bearer internally

// app/(root)/kontak/page.tsx server wrapper (no "use client") does:
const contact = await fetch(`${BASE_URL_SERVER}/contact-page?populate=*`, { headers: getHeadersServer(), next:{revalidate:3600} })
// then <KontakFormClient initialContact={contact} />
// Client KontakFormClient "use client" holds form useState, NO import getContactPage or getHeadersServer
```

- `qs.stringify` selalu `encodeValuesOnly:true`
- Image: `getStrapiImageUrl`
- Pages app/(root) use proxy `/api/*` (no token in client bundle).

## 4. Import Rule Baru (Next final)

```ts
// BENAR Next app
import { getStrapiImageUrl } from '@/lib/getStrapiImageUrl'
import { formatDateID } from '@/lib/formatDate'
import { BASE_URL_SERVER, getHeadersServer } from '@/lib/api/client.server' // server only files
// client components fetch via proxy
fetch('/api/articles?pagination[pageSize]=1')

// Client components fetch same-origin /api/* routes.
```

## 5. UI Rules (JANGAN DILANGGAR)

- 100% persis redesign static. className verbatim.
- Tokens etc same as before.
- Tailwind KEEP v3.4.17 (not v4). Content includes ./src/app/**/*.
- Dark html.dark.

## 6. Bugfix Penting

- Slug panjang Not Found: isStrapiDocumentId() regex ^[a-z0-9]{20,30}$ no dash, slug dash>=3 && len>30 => slug. Hooks fallback retry. Now also in app/(root)/berita/[id]/page.tsx same logic + proxy fallback.

## 7. Testing Manual CMS

- `/cms-test` server wrapper masked ENV + 7 endpoint via /api/* proxy 200 OK green + count 215/27.
- DevTools F12 Network filter `cms.dinkominfo` should NOT show direct client Bearer (only via /api proxy). Filter `/api/articles` -> 200 OK.
- curl proxy:
```bash
curl http://localhost:3000/api/articles?pagination[pageSize]=1 | python3 -m json.tool | head
# -> 200 JSON without client Bearer, server injects internally

# Direct CMS (for comparison, needs token)
curl -H "Authorization: Bearer $STRAPI_API_KEY" "https://cms.dinkominfo.pekalongankab.go.id/api/articles?pagination[pageSize]=1&populate=*" | python3 -m json.tool | head
```
- Visual: `/` 3 real, `/berita` 9 + 27 pills paginated via proxy, `/berita/visi-misi` content, `/galeri` 12, `/kontak` contact-page via server + form client prop, `/cms-test` 7 green.

## 8. Do & Don't

Do:
- Logic baru taruh di `lib/actions/` per-file, mirip ref.
- Import image/date dari `lib/getStrapiImageUrl`, `lib/formatDate`.
- Next app pages use `/api/*` proxy for client interactivity, server wrappers use `client.server.ts` directly.
- Build must pass `npm run build` (Next routes).
- ENV via `process.env.NEXT_PUBLIC_*` public, `process.env.STRAPI_API_KEY` server-only, never `NEXT_PUBLIC_STRAPI_API_KEY`.

Don't:
- Don't ubah className/tokens/custom.css - UI locked.
- Don't add `NEXT_PUBLIC_STRAPI_API_KEY` ever. Client `client.ts` must NOT contain token. Check `grep -r NEXT_PUBLIC_STRAPI_API_KEY src/` = 0, `grep -r Bearer .next/static` should be only docs not token.
- Client components inside `src/app` fetch same-origin `/api/*` routes; server wrappers use `client.server.ts`.
- Don't `as any` / `@ts-ignore`.

## 9. Git Rules

1. NO force push unless absolutely necessary. If forced, MUST ask user permission first every time.
2. NO AI/dev attribution in commits. No co-author trailers.
3. User minta "jangan langsung push n commit" -> jangan push/commit sampai diminta. Kerja local dulu. Branch feat/next-migration local, not pushed yet per request.

## 10. Modes

- Caveman mode terse.
- Ponytail YAGNI.

## 11. Files Diabaikan

`.omo/`, `.env`, `.env.local`, `node_modules/`, `dist/`, `.next/`, `build/`, git-ignored. `.env.example` tracked.

## 12. Next Migration Verification (Phase6)

- [x] `npm run dev` 3000 OK no hydration (ThemeContext guard document)
- [x] `/` hero 500/600px hero-gradient, quick links -mt-10 grid 2/4, 3 real via /api proxy, bento, glass blur
- [x] `/berita` 9 real pills 27 via /api/categories proxy + pagination ?page= ?category= ?query= via /api/articles proxy
- [x] `/berita/:slug` long 120 NOT docId prose related 3 via proxy
- [x] `/profil` 4 docs profil via proxy
- [x] `/layanan` 6 cards hover-card translateY -4px
- [x] `/galeri` 12 real via proxy bento col-span-2
- [x] `/unduhan` 6 docs
- [x] `/kontak` server wrapper fetch contact-page via getHeadersServer (server-only) + KontakFormClient prop, no server-only import in client
- [x] `/cms-test` server masked + 7 proxy endpoints 200 OK
- [x] Dark mode localStorage html.dark no FOUC inline script
- [x] Mobile 44px tap grid 2->4 h-16
- [x] `npm run build` 18 routes (8 api + 8 app + _not-found + /)
- [x] Vite compatibility retired after explicit Decision B
- [x] No NEXT_PUBLIC_STRAPI_API_KEY in src/ (grep 0)
- [x] No VITE_ in src/app (grep 0)
- [x] No useCms in src/app (grep 0)
- [x] No token in .next/static grep STRAPI_API_KEY 0, Bearer only in docs pre tag (not raw token)
- [x] Legacy /pages/articles.html 308 redirect via next.config.mjs
- [x] next pinned 15.5.4 tailwind 3.4.17

Current branch `feat/next-migration` local only, not committed/pushed per user request. Pure-Next cleanup is complete locally; user decides when to commit/push.
