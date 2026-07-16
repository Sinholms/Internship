# NEXT AGENT — BACA INI DULU — CMS Integration Status

File lengkap: `.omo/docs/CMS_INTEGRATION_STATUS.md` (342 baris) + `docs/superpowers/plans/` — tapi docs di-gitignore. File ini ringkas tracked.

## TL;DR

- **Repo:** Sinholms/Internship main
- **UI:** React 19 + TSX + Vite 6 + Tailwind 3.4 — **100% persis** dari redesign static, token `primary #002a58`, `secondary-container #fecb00`, className verbatim
- **CMS:** Strapi v5 `https://cms.dinkominfo.pekalongankab.go.id/api` — 215 articles, 27 cats, public **403** tanpa Bearer, wajib `VITE_STRAPI_API_KEY` read-only di `.env` (git-ignored)
- **Logic Ref:** `/home/holmes/Documents/MAGANG/next-strapi-main/` — Next.js 16 App Router, `qs`, `getStrapiImageUrl` cdn rewrite, dynamic zone `widgets.*` 18 types, markdown, forms, auth
- **ENV:** `VITE_STRAPI_BASE_URL`, `VITE_CDN_URL=https://cdn.pekalongankab.go.id`, `VITE_STRAPI_API_KEY`
- **Tests:** `/cms-test` page — ENV masked + 7 endpoint raw tests 200 OK + curl + devtools + visual checklist

## Sudah ✅

- `src/lib/api/client.ts` — `qs.stringify {encodeValuesOnly:true}` + Bearer + BASE_URL/api — sama `getArticles.ts`
- `src/lib/api/image.ts` — `getStrapiImageUrl` regex `cms.[^.]+\.pekalongankab.go.id` → `cdn`, `/uploads` → CDN_URL — verbatim `getStrapiImageUrl.ts`
- `src/lib/api/queries.ts` — `getArticles` filters `$or` containsi + category + pub_date lte + populate * + pagination 9 + sort desc — copy `ArticleList.tsx`; `getArticleBySlug` populate category/tags/author/featuredImage/relatedArticles/pdfViewer — copy `getArticle.ts`; `getLatestArticles`, `getCategories`, `getGlobal`, `getHomePage` (heroSlider + sections.blocks on 18 widgets), `getPageBySlug`, `getMenuItems` buildPopulateObject depth 6, `getTopbarMenu`
- `src/hooks/useCms.ts` — `useArticles`, `useArticleBySlug` (fallback docId), `useLatestArticles`, `useCategories`, `useGlobal`, etc
- Pages REAL: Home `useLatestArticles(3)`, Articles `useCategories()` + pagination real, ArticleDetail slug/docId detection `isStrapiDocumentId()` fix, Galeri 12 featuredImage, ContentPage CMS-only category=profil 4 docs, Layanan query=layanan, Kontak `contact-page` REAL, Footer social dari global
- Bugfix: slug panjang 120 chars dengan banyak `-` ke-detect docId → fix `dashCount>=3 && length>30 => slug`, `^[a-z0-9]{20,30}$` => docId

## Partial ⚠️

- `getHomePage` fetch ada, tapi HomePage cuma latest-articles — hero static, quick links static, galeri bento static CDN, city news static
- `getGlobal` / footer — social + siteName real, footerItems widgets belum
- `contact-page` — raw fetch, form alert demo
- `menu-items` — fetch ada, Header hardcode NAV_ITEMS 7
- ContentPage CMS-only setelah `git stash@{0}` backup merge static+cms

## Belum ❌

- `getHeroImages` + blurData + embla carousel autoplay 10s + video
- Block resolver `Sections/Block.tsx` componentMap `__component` → 18 widgets: services, banners, brands, video-gallery, image-gallery, slider, quote, pdf-viewer, accordions, fa-qs, custom-html, embeds, social-links, tags-list, categories-list, latest-articles, featured-articles
- MarkdownRenderer `react-markdown` + `remarkGfm` + `rehypeRaw` + SyntaxHighlighter — sekarang `dangerouslySetInnerHTML`
- Forms `getForms`, `formSubmission`, `uploadFiles`, `sendMail`, zod dynamic schema, drawing-canvas, puppeteer PDF `generateHtmlString`
- Auth JWT httpOnly cookie, `proxy.ts` middleware
- `incrementView` PUT `/${model}/${slug}/views`
- `getBlurData` plaiceholder
- Search UI header dummy
- Revalidate tags, SEO `getDefaultSeo`

## Next TODO Priority

1. Search input Header → `?query=` + `useArticles({query})`
2. Block resolver Sections + Blocks 15 components (Services, ImageGallery FocusCards Dialog, VideoGallery, ParallaxCarousel embla, Quote, PdfViewer, Accordions, Embeds, etc) from `useHomePage()` sections.blocks
3. Hero embla-carousel + autoplay
4. MarkdownRenderer
5. Menu dynamic `useMenuItems('Main Menu')` recursive children
6. Forms, incrementView, SEO `react-helmet-async`, react-query

## Constraints

- UI 100% persis — className verbatim, token sama
- TSX strict, no `as any`
- No force push, main branch, only Sinholms commits
- Build must pass `npm run build`
- `.env` git-ignored, `.env.example` tracked

## Files

- Client: `src/lib/api/client.ts`
- Image: `src/lib/api/image.ts`
- Queries: `src/lib/api/queries.ts`
- Types: `src/types/cms.ts`
- Hooks: `src/hooks/useCms.ts`
- Pages: `src/pages/*.tsx`
- Full doc: `.omo/docs/CMS_INTEGRATION_STATUS.md` (git-ignored) + copy `docs/superpowers/plans/` (ignored)
- Ref: `/home/holmes/Documents/MAGANG/next-strapi-main/src/lib/actions/*.ts`, `getStrapiImageUrl.ts`, `components/DynamicZones/`, `Hero/`, `MarkdownRenderer/`

Run: `npm install && cp .env.example .env` isi key `&& npm run dev`
