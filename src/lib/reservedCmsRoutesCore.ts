export const RESERVED_CMS_ROUTES: ReadonlySet<string> = new Set<string>([
  '/',
  '/berita',
  '/profil',
  '/layanan',
  '/galeri',
  '/unduhan',
  '/kontak',
  '/cms-test',
]);

function normalizeCmsRoutePath(path: string): string {
  const trimmed = path.trim().replace(/^\/+|\/+$/g, '');
  return trimmed === '' ? '/' : `/${trimmed}`;
}

export function isReservedCmsRoute(path: string): boolean {
  return RESERVED_CMS_ROUTES.has(normalizeCmsRoutePath(path));
}
