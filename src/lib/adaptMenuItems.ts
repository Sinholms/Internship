export interface HeaderNavItem {
  readonly label: string;
  readonly path: string;
  readonly match: readonly string[];
}

export const DEFAULT_HEADER_NAV_ITEMS: readonly HeaderNavItem[] = [
  { label: 'Beranda', path: '/', match: ['/', '/index'] },
  { label: 'Profil', path: '/profil', match: ['/profil', '/content-page', '/visi-misi', '/struktur-organisasi', '/profil'] },
  { label: 'Berita', path: '/berita', match: ['/berita', '/articles', '/article-detail'] },
  { label: 'Layanan', path: '/layanan', match: ['/layanan'] },
  { label: 'Galeri', path: '/galeri', match: ['/galeri'] },
  { label: 'Informasi', path: '/unduhan', match: ['/unduhan', '/informasi'] },
  { label: 'Pengaduan', path: '/kontak', match: ['/kontak', '/pengaduan', '/contact-page'] },
] as const;

type MenuRecord = Readonly<Record<string, unknown>>;

function isMenuRecord(value: unknown): value is MenuRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readSlug(value: unknown): string | null {
  if (!isMenuRecord(value) || typeof value.slug !== 'string') return null;
  return value.slug.trim().toLowerCase() || null;
}

function readChildren(value: unknown): readonly unknown[] {
  if (!isMenuRecord(value) || !Array.isArray(value.children)) return [];
  return value.children;
}

function readInternalUrl(value: unknown): string | null {
  if (!isMenuRecord(value) || typeof value.url !== 'string') return null;
  const url = value.url.trim();
  return url.startsWith('/') && !url.startsWith('//') ? url : null;
}

function resolvePath(item: MenuRecord): string | null {
  const directUrl = readInternalUrl(item);
  if (directUrl) return directUrl;

  const pageSlug = readSlug(item.page);
  if (pageSlug) {
    const pageRoutes: Readonly<Record<string, string>> = {
      home: '/',
      beranda: '/',
      profil: '/profil',
      layanan: '/layanan',
      galeri: '/galeri',
      unduhan: '/unduhan',
      informasi: '/unduhan',
      kontak: '/kontak',
      pengaduan: '/kontak',
      'cms-test': '/cms-test',
    };
    return pageRoutes[pageSlug] ?? null;
  }

  const articleSlug = readSlug(item.article);
  if (articleSlug) return `/berita/${articleSlug}`;

  const categorySlug = readSlug(item.category);
  return categorySlug ? `/berita?category=${encodeURIComponent(categorySlug)}` : null;
}

function readLabel(item: MenuRecord): string | null {
  if (typeof item.title !== 'string') return null;
  const label = item.title.trim();
  return label || null;
}

function toMenuRecord(value: unknown): MenuRecord | null {
  return isMenuRecord(value) ? value : null;
}

function readMenuData(payload: unknown): readonly MenuRecord[] {
  if (Array.isArray(payload)) {
    return payload.map(toMenuRecord).filter((item): item is MenuRecord => item !== null);
  }
  if (!isMenuRecord(payload) || !Array.isArray(payload.data)) return [];
  return payload.data.map(toMenuRecord).filter((item): item is MenuRecord => item !== null);
}

function pathsEqual(left: string, right: string): boolean {
  return left === right || (left === '/' && right === '/index');
}

export function adaptMenuItems(payload: unknown, fallback: readonly HeaderNavItem[] = DEFAULT_HEADER_NAV_ITEMS): readonly HeaderNavItem[] {
  const labelsByPath = new Map<string, string>();

  for (const item of readMenuData(payload)) {
    if (readChildren(item).length > 0) continue;
    const label = readLabel(item);
    const path = resolvePath(item);
    if (!label || !path) continue;
    const currentItem = fallback.find(candidate => pathsEqual(candidate.path, path));
    if (currentItem) labelsByPath.set(currentItem.path, label);
  }

  return fallback.map(item => {
    const label = labelsByPath.get(item.path);
    return label ? { ...item, label } : item;
  });
}
