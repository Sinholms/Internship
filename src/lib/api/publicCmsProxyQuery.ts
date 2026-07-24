import qs from 'qs';

type QuerySuccess = { readonly ok: true; readonly search: string };
type QueryFailure = { readonly ok: false; readonly message: string };
export type PublicCmsQuery = QuerySuccess | QueryFailure;

type QueryInput = {
  readonly searchParams: URLSearchParams;
  readonly allowedKeys: readonly string[];
  readonly pageSizeCap: number;
  readonly defaults: Readonly<Record<string, unknown>>;
};

const ARTICLES_ALLOWED_KEYS = [
  'pagination[page]',
  'pagination[pageSize]',
  'sort',
  'status',
  'populate',
  'filters[$or][0][title][$containsi]',
  'filters[$or][1][content][$containsi]',
  'filters[$or][2][tags][name][$containsi]',
  'filters[category][slug][$eq]',
  'filters[category][slug][$containsi]',
  'filters[publication_date][$lte]',
] as const;

const CATEGORY_ALLOWED_KEYS = ['pagination[page]', 'pagination[pageSize]', 'filters[slug][$containsi]'] as const;
const PAGES_ALLOWED_KEYS = ['pagination[page]', 'pagination[pageSize]', 'filters[slug][$eq]', 'populate'] as const;
const PAGINATION_ALLOWED_KEYS = ['pagination[page]', 'pagination[pageSize]', 'populate'] as const;

export const ARTICLE_LIST_POPULATE = {
  category: { fields: ['name', 'slug'] },
  tags: { fields: ['name', 'slug'] },
  author: { fields: ['firstname', 'lastname'] },
  featuredImage: { populate: '*' },
  pdfViewer: { populate: '*' },
} as const;

export const CATEGORY_LIST_FIELDS = ['name', 'slug'] as const;
export const PAGE_LIST_FIELDS = ['title', 'slug'] as const;
export const MENU_ITEMS_POPULATE = {
  page: { fields: ['slug'] },
  article: { fields: ['slug'] },
  category: { fields: ['slug'] },
  children: { populate: '*' },
  menu: { fields: ['name'] },
} as const;
export const GLOBAL_POPULATE = {
  siteIcon: { fields: ['url'] },
  siteIconDark: { fields: ['url'] },
  favicon: { fields: ['url'] },
  socialMedia: { populate: { icon: { fields: ['url'] } } },
  footerItems: { populate: '*' },
  defaultSeo: { populate: '*' },
} as const;
export const HOME_PAGE_POPULATE = {
  heroSlider: { populate: '*' },
  sections: { populate: { blocks: { on: { 'widgets.latest-articles': { populate: '*' } } } } },
  asides: { populate: { item: { on: { 'widgets.latest-articles': { populate: '*' } } } } },
} as const;
export const CONTACT_PAGE_POPULATE = {
  featuredImage: { populate: '*' },
  contactList: { populate: '*' },
} as const;

function failure(message: string): QueryFailure {
  return { ok: false, message };
}

function validPositiveInteger(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function addStringPath(target: Record<string, unknown>, path: readonly string[], value: string): void {
  let current = target;
  for (const key of path.slice(0, -1)) {
    const existing = current[key];
    const next = isRecord(existing) ? existing : {};
    current[key] = next;
    current = next;
  }
  const finalKey = path.at(-1);
  if (finalKey) current[finalKey] = value;
}

function parseQuery(input: QueryInput): PublicCmsQuery {
  const receivedKeys = [...input.searchParams.keys()];
  if (receivedKeys.some((key) => !input.allowedKeys.includes(key))) return failure('Parameter kueri tidak didukung.');
  if (new Set(receivedKeys).size !== receivedKeys.length) return failure('Parameter kueri tidak valid.');

  const query: Record<string, unknown> = { ...input.defaults };
  const pagination: Record<string, number> = {};
  const filters: Record<string, unknown> = {};

  for (const [key, value] of input.searchParams) {
    if (key === 'pagination[page]' || key === 'pagination[pageSize]') {
      const parsed = validPositiveInteger(value);
      if (parsed === null) return failure('Pagination tidak valid.');
      pagination[key === 'pagination[page]' ? 'page' : 'pageSize'] = key === 'pagination[pageSize]' ? Math.min(parsed, input.pageSizeCap) : parsed;
      continue;
    }
    if (key === 'sort' && value !== 'publication_date:asc' && value !== 'publication_date:desc') return failure('Urutan tidak valid.');
    if (key === 'status' && value !== 'published') return failure('Status tidak valid.');
    if (key === 'populate' && value !== '*') return failure('Populate tidak valid.');
    if (value.length === 0 || value.length > 500 || /\p{Cc}/u.test(value)) return failure('Nilai filter tidak valid.');

    if (key.startsWith('filters[')) {
      const path = key.match(/\[([^\]]+)\]/g)?.map((segment) => segment.slice(1, -1));
      if (!path || path.length === 0) return failure('Filter tidak valid.');
      addStringPath(filters, path, value);
    } else if (key !== 'populate') {
      query[key] = value;
    }
  }

  const defaultPagination = input.defaults['pagination'];
  if (Object.keys(pagination).length > 0) {
    query.pagination = isRecord(defaultPagination)
      ? { ...defaultPagination, ...pagination }
      : pagination;
  }
  if (Object.keys(filters).length > 0) query.filters = filters;
  return { ok: true, search: qs.stringify(query, { encodeValuesOnly: true }) };
}

export function buildArticlesQuery(searchParams: URLSearchParams): PublicCmsQuery {
  return parseQuery({
    searchParams,
    allowedKeys: ARTICLES_ALLOWED_KEYS,
    pageSizeCap: 20,
    defaults: { populate: ARTICLE_LIST_POPULATE, status: 'published' },
  });
}

export function buildCategoriesQuery(searchParams: URLSearchParams): PublicCmsQuery {
  return parseQuery({ searchParams, allowedKeys: CATEGORY_ALLOWED_KEYS, pageSizeCap: 100, defaults: { fields: CATEGORY_LIST_FIELDS } });
}

export function buildPagesQuery(searchParams: URLSearchParams): PublicCmsQuery {
  return parseQuery({ searchParams, allowedKeys: PAGES_ALLOWED_KEYS, pageSizeCap: 100, defaults: { fields: PAGE_LIST_FIELDS } });
}

export function buildMenuItemsQuery(searchParams: URLSearchParams): PublicCmsQuery {
  return parseQuery({
    searchParams,
    allowedKeys: PAGINATION_ALLOWED_KEYS,
    pageSizeCap: 100,
    defaults: { populate: MENU_ITEMS_POPULATE, filters: { menu: { name: { $eq: 'Main Menu' } } }, sort: 'order:asc', pagination: { pageSize: 100 } },
  });
}

export function buildFixedQuery(searchParams: URLSearchParams, populate: Readonly<Record<string, unknown>>): PublicCmsQuery {
  const receivedKeys = [...searchParams.keys()];
  const isFixedPopulateMarker = receivedKeys.length === 1 && receivedKeys[0] === 'populate' && searchParams.get('populate') === '*';
  return searchParams.size === 0 || isFixedPopulateMarker
    ? { ok: true, search: qs.stringify({ populate }, { encodeValuesOnly: true }) }
    : failure('Parameter kueri tidak didukung.');
}

export function isValidArticleIdentifier(id: string): boolean {
  return id.length > 0 && id.length <= 180 && !/[/\p{Cc}]/u.test(id);
}
