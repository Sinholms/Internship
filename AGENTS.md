# AGENTS.md — Dinkominfo Pekalongan Portal

Internal guide for agents and developers working on this repository.

## Project Truth

- Runtime: Next.js 15.5.4 App Router, React 19.2.4, TypeScript, Tailwind CSS 3.4.17.
- CMS: Strapi v5 at `https://cms.dinkominfo.pekalongankab.go.id`.
- Reference logic: `/home/holmes/Documents/MAGANG/next-strapi-main/`.
- Current UI redesign remains visual source of truth. Preserve current layout, tokens, and class names.
- Repository is pure Next. No Vite runtime or Vite compatibility path remains supported.

## Commands

```bash
npm install
cp .env.example .env.local
# Fill STRAPI_API_KEY and public URL variables in .env.local.
npm run dev
npm run build
npm run start
npm run lint
npm run test:article-html
npm run test:article-pdf
npm run test:reserved-cms-routes
```

## Environment Contract

```text
NEXT_PUBLIC_STRAPI_BASE_URL=https://cms.dinkominfo.pekalongankab.go.id
NEXT_PUBLIC_CDN_URL=https://cdn.pekalongankab.go.id
NEXT_PUBLIC_CDN=https://cdn.pekalongankab.go.id
STRAPI_BASE_URL=https://cms.dinkominfo.pekalongankab.go.id
STRAPI_API_KEY=<server-only read-only Strapi token>
```

- `STRAPI_API_KEY` must never use a `NEXT_PUBLIC_` prefix.
- Never expose token fragments, token length, or token state beyond a boolean configured/not-configured indicator.
- `.env`, `.env.local`, `.next/`, `node_modules/`, and `.omo/` are ignored.

## Source Boundaries

```text
src/app/(root)/*       Current UI routes and page composition.
src/components/*       Current UI components; do not replace with reference UI.
src/lib/actions/*      CMS query/transformation logic.
src/lib/api/client.server.ts
                       Server-only CMS origin and Bearer header.
src/app/api/*           Same-origin read-only CMS proxy routes.
src/types/cms.ts        Public-portal CMS types.
src/lib/sanitizeArticleHtml.ts
                       CMS HTML sanitization boundary.
```

Client components fetch `/api/*` only. They must not import `client.server.ts`, read `STRAPI_API_KEY`, or call the CMS origin directly.

## Reference Integration Rules

- Reuse reference CMS query shapes and data behavior, not reference page markup.
- Keep current route names: `/berita`, `/profil`, `/layanan`, `/galeri`, `/unduhan`, `/kontak`, `/cms-test`.
- Reference `/articles` maps to current `/berita`.
- Reference dynamic zones, auth, dashboard, uploads, mail, and form-submission systems are out of scope unless explicitly requested.
- New logic belongs in focused files under `src/lib/actions/` or a scoped `src/app/api/` route.
- Use `qs.stringify(..., { encodeValuesOnly: true })` for CMS query construction.
- Use `getStrapiImageUrl` and `formatDate` helpers; do not duplicate conversions.

## UI Rules

- Preserve `primary #002a58` and `secondary-container #fecb00`.
- Preserve current responsive layout, dark mode, 44px mobile targets, hero gradient, hover-card behavior, and current Indonesian copy.
- Do not import reference Header, Footer, Hero, 3D-card, tracing-beam, shadcn, or generic sidebar UI to replace current components.

## Known Open Findings

Track these in `.omo/docs/CURRENT_STATUS.md` and `.omo/docs/UI_LOGIC_POSITION_MAPPING.md`:

- Berita category UI currently caps visible categories at six and must use category slugs for filtering.
- Several `as any` casts remain and violate type-safety rules.
- Public CMS proxies forward too many caller-controlled query parameters; add endpoint allowlists and pagination caps.
- `/cms-test` must not expose token fragments/length and should be development/admin protected.
- Confirm gallery display count and profile document count against the intended UI contract.
- Decide whether public-facing action modules remain supported or become server-only/internal adapters.
- Runtime/build/network/visual verification must be recorded with actual command/browser evidence.

## Verification Before Completion

- Run `npm run build` and `npm run lint`.
- Run all three focused test scripts.
- Check every changed TS/TSX file with diagnostics.
- Smoke-test `/`, `/berita`, one article slug, `/profil`, `/layanan`, `/galeri`, `/unduhan`, `/kontak`, and `/cms-test`.
- Verify client network requests use same-origin `/api/*` and client bundles contain no token.
- Do not claim runtime or visual success from source inspection alone.

## Git Rules

- Do not commit or push unless explicitly requested.
- Never force-push without explicit permission.
- Do not add AI/developer attribution to commits.
- Never use `as any`, `@ts-ignore`, or `@ts-expect-error`.
