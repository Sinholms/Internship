# Dinkominfo Kabupaten Pekalongan Portal

Next.js redesign portal for Dinas Komunikasi dan Informatika Kabupaten Pekalongan. Current redesign UI stays authoritative; CMS data behavior follows compatible read logic from `/home/holmes/Documents/MAGANG/next-strapi-main/`.

## Stack

- Next.js 15.5.4 App Router
- React 19.2.4
- TypeScript 6
- Tailwind CSS 3.4.17
- Strapi CMS v5
- `qs` for CMS query construction

## Run

```bash
npm install
cp .env.example .env.local
# Fill .env.local with CMS values.
```

Open `http://localhost:3000`.

Production check:

```bash
npm run build
npm run start
```

Focused tests:

```bash
npm run test:article-html
npm run test:article-pdf
npm run test:reserved-cms-routes
npm run test:public-cms-proxy-query
npm run lint
```

## Environment

```text
NEXT_PUBLIC_STRAPI_BASE_URL=https://cms.dinkominfo.pekalongankab.go.id
NEXT_PUBLIC_CDN_URL=https://cdn.pekalongankab.go.id
NEXT_PUBLIC_CDN=https://cdn.pekalongankab.go.id
STRAPI_BASE_URL=https://cms.dinkominfo.pekalongankab.go.id
STRAPI_API_KEY=<server-only read-only Strapi token>
STRAPI_FORM_API_KEY=<optional server-only token for form submissions; falls back to STRAPI_API_KEY>
STRAPI_PENGADUAN_FORM_ID=<optional Strapi form documentId if the form-submissions collection requires a form relation>
```

The CMS requires Bearer authentication. `STRAPI_API_KEY` is server-only and must never be renamed to `NEXT_PUBLIC_STRAPI_API_KEY`. Client UI calls same-origin `/api/*` proxy routes; it does not call Strapi directly.

## Routes

| Route | Purpose |
|---|---|
| `/` | Redesign homepage, latest news, gallery, and social sections |
| `/berita` | CMS article listing, category filtering, search, pagination |
| `/berita/[id]` | Article detail by slug or Strapi documentId |
| `/profil` | Profile article content with sticky table of contents |
| `/layanan` | Service cards and related CMS information |
| `/galeri` | CMS article/image bento gallery |
| `/unduhan` | Download/information cards and CMS documents |
| `/kontak` | Contact data and real complaint form (Zod-validated, submits via `/api/pengaduan` proxy) |
| `/cms-test` | CMS proxy diagnostics; do not expose publicly in production without protection |

## Folder Ownership

```text
src/app/(root)/       Current route UI and page composition.
src/components/       Current redesign components.
src/app/api/          Server-side CMS proxy adapters (endpoint allowlists, pagination caps).
src/lib/actions/      CMS query and transformation logic (server-only internal adapters).
src/lib/api/          Public helper, server-only CMS client, and proxy query allowlists.
src/lib/articleIdentifier.ts
                      Canonical slug/documentId detector shared by server and client.
src/types/            Public portal CMS types.
src/lib/sanitizeArticleHtml.ts
                      Sanitization boundary for CMS HTML.
```

The reference project supplies CMS/data patterns, not replacement visual components. Do not copy its auth, dashboard, dynamic-zone, upload, mail, or form-submission systems into this public read-only portal without a separate scope and security review.

## Design Contract

- Navy primary: `#002a58`.
- Yellow secondary container: `#fecb00`.
- Preserve current responsive layout, dark mode, typography, hero gradient, hover cards, bento gallery, and 44px mobile targets.
- Do not replace current markup/classes with reference Header, Footer, Hero, Article, or shadcn components.

## Documentation

- `AGENTS.md`: internal engineering rules and current source boundaries.
- `.omo/docs/CURRENT_STATUS.md`: verified/unknown/open project status.
- `.omo/docs/UI_LOGIC_POSITION_MAPPING.md`: reference logic mapped to current UI positions.
- `.omo/docs/SECURITY_ENV_CHECKLIST.md`: token, proxy, HTML, and runtime security checks.
- `.omo/plans/`: active incomplete work only.

## Current Limitations

Verified and closed on 2026-07-23 (see `.omo/docs/CURRENT_STATUS.md` for evidence):

- Berita category filtering uses CMS slug and shows all categories.
- Forbidden `as any` casts removed from source.
- CMS proxy routes use endpoint-specific allowlists and pagination caps.
- `/cms-test` shows only a configured boolean and is development-only.
- Gallery/profile record-count behavior confirmed against the intended UI contract.

Still open:

- Browser/responsive/dark-mode visual verification requires a live browser session; not yet executed.
