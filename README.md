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
npm run lint
```

## Environment

```text
NEXT_PUBLIC_STRAPI_BASE_URL=https://cms.dinkominfo.pekalongankab.go.id
NEXT_PUBLIC_CDN_URL=https://cdn.pekalongankab.go.id
NEXT_PUBLIC_CDN=https://cdn.pekalongankab.go.id
STRAPI_BASE_URL=https://cms.dinkominfo.pekalongankab.go.id
STRAPI_API_KEY=<server-only read-only Strapi token>
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
| `/kontak` | Contact data and demo complaint form |
| `/cms-test` | CMS proxy diagnostics; do not expose publicly in production without protection |

## Folder Ownership

```text
src/app/(root)/       Current route UI and page composition.
src/components/       Current redesign components.
src/app/api/          Server-side CMS proxy adapters.
src/lib/actions/      CMS query and transformation logic.
src/lib/api/          Public helper and server-only CMS client.
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

Review findings remain open until verified and fixed:

- Berita category UI currently shows only a subset of CMS categories and must use display name/slug separately.
- Forbidden `as any` casts remain in several TSX files.
- CMS proxy query parameters need endpoint-specific allowlists and pagination caps.
- CMS test must not reveal token fragments or token length and should be protected outside development.
- Gallery/profile record-count behavior needs confirmation against the intended UI contract.
- Build, network, and visual claims require fresh executable evidence.
