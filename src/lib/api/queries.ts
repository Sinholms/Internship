import qs from 'qs';
import { strapiFetch, type StrapiListResponse, type StrapiSingleResponse } from './client';
import type { ArticleCMS, CategoryCMS, MenuItemCMS, GlobalCMS, HomePageCMS, PageCMS } from '../../types/cms';

// --- Articles

export function buildArticlesQuery(params: {
  query?: string;
  category?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
  slug?: string;
}) {
  const { query, category, page, pageSize = 9, sort = 'desc', slug } = params;

  if (slug) {
    return qs.stringify({
      filters: { slug: { $eq: slug } },
      populate: {
        category: { fields: ['name', 'slug'] },
        tags: { fields: ['name', 'slug'] },
        author: { fields: ['firstname', 'lastname'] },
        featuredImage: { populate: '*' },
        relatedArticles: {
          populate: {
            articles: {
              populate: {
                featuredImage: { populate: '*' },
                category: { fields: ['name', 'slug'] },
                tags: { fields: ['name', 'slug'] },
              },
            },
          },
        },
        pdfViewer: { populate: '*' },
      },
    }, { encodeValuesOnly: true });
  }

  return qs.stringify({
    sort: `publication_date:${sort}`,
    filters: {
      $or: query
        ? [
            { title: { $containsi: query } },
            { content: { $containsi: query } },
            { tags: { name: { $containsi: query } } },
          ]
        : undefined,
      category: category ? { slug: { $containsi: category } } : undefined,
      publication_date: { $lte: new Date().toISOString() },
    },
    populate: '*',
    pagination: {
      pageSize,
      page: page || 1,
    },
    status: 'published',
  }, { encodeValuesOnly: true });
}

export function fetchArticles(params: {
  query?: string;
  category?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
}) {
  const qsStr = buildArticlesQuery(params);
  return strapiFetch<StrapiListResponse<ArticleCMS>>(`/articles?${qsStr}`);
  // Actually strapiFetch already adds ?, so use raw fetch style
}

export async function fetchArticlesRaw(params: {
  query?: string;
  category?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
  slug?: string;
}) {
  const qsStr = buildArticlesQuery(params);
  return strapiFetch<StrapiListResponse<ArticleCMS>>(`/articles?${qsStr}` as unknown as string);
  // workaround: strapiFetch does stringify again, so we need direct
}

// Correct wrappers using direct URL building (to avoid double qs)

import { BASE_URL } from './client';

function getHeaders(): HeadersInit {
  const key = import.meta.env.VITE_STRAPI_API_KEY as string | undefined;
  const h: HeadersInit = { Accept: 'application/json' };
  if (key) h['Authorization'] = `Bearer ${key}`;
  return h;
}

export async function getArticles(params: {
  query?: string;
  category?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
  limit?: number;
}): Promise<StrapiListResponse<ArticleCMS>> {
  const { query, category, page, pageSize, sort, limit } = params;
  const q = qs.stringify({
    sort: `publication_date:${sort || 'desc'}`,
    filters: {
      $or: query
        ? [
            { title: { $containsi: query } },
            { content: { $containsi: query } },
            { tags: { name: { $containsi: query } } },
          ]
        : undefined,
      category: category ? { slug: { $containsi: category } } : undefined,
      publication_date: { $lte: new Date().toISOString() },
    },
    populate: '*',
    pagination: {
      pageSize: limit || pageSize || 9,
      page: page || 1,
    },
    status: 'published',
  }, { encodeValuesOnly: true });

  const res = await fetch(`${BASE_URL}/articles?${q}`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`getArticles ${res.status}`);
  return res.json();
}

export async function getArticleBySlug(slug: string): Promise<ArticleCMS | null> {
  const q = qs.stringify({
    filters: { slug: { $eq: slug } },
    populate: {
      category: { fields: ['name', 'slug'] },
      tags: { fields: ['name', 'slug'] },
      author: { fields: ['firstname', 'lastname'] },
      featuredImage: { populate: '*' },
      relatedArticles: {
        populate: {
          articles: {
            populate: {
              featuredImage: { populate: '*' },
              category: { fields: ['name', 'slug'] },
              tags: { fields: ['name', 'slug'] },
            },
          },
        },
      },
      pdfViewer: { populate: '*' },
    },
  }, { encodeValuesOnly: true });

  const res = await fetch(`${BASE_URL}/articles?${q}`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`getArticleBySlug ${res.status}`);
  const json: StrapiListResponse<ArticleCMS> = await res.json();
  return json.data[0] || null;
}

export async function getArticleByDocumentId(documentId: string): Promise<ArticleCMS | null> {
  const q = qs.stringify({
    filters: { documentId: { $eq: documentId } },
    populate: {
      category: { fields: ['name', 'slug'] },
      tags: { fields: ['name', 'slug'] },
      author: { fields: ['firstname', 'lastname'] },
      featuredImage: { populate: '*' },
      relatedArticles: {
        populate: {
          articles: {
            populate: {
              featuredImage: { populate: '*' },
              category: { fields: ['name', 'slug'] },
              tags: { fields: ['name', 'slug'] },
            },
          },
        },
      },
      pdfViewer: { populate: '*' },
    },
  }, { encodeValuesOnly: true });

  const res = await fetch(`${BASE_URL}/articles?${q}`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`getArticleByDocumentId ${res.status}`);
  const json: StrapiListResponse<ArticleCMS> = await res.json();
  return json.data[0] || null;
}

export async function getLatestArticles(params: { limit?: number; category?: string }): Promise<StrapiListResponse<ArticleCMS>> {
  const { limit = 3, category } = params;
  const q = qs.stringify({
    sort: 'publication_date:desc',
    filters: category ? { category: { slug: category } } : undefined,
    'pagination[limit]': limit,
    populate: '*',
  }, { encodeValuesOnly: true });

  const res = await fetch(`${BASE_URL}/articles?${q}`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`getLatestArticles ${res.status}`);
  return res.json();
}

export async function getCategories(slug?: string): Promise<StrapiListResponse<CategoryCMS>> {
  const q = slug ? qs.stringify({ filters: { slug: { $containsi: slug } } }, { encodeValuesOnly: true }) : '';
  const url = `${BASE_URL}/categories${q ? `?${q}` : ''}`;
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) throw new Error(`getCategories ${res.status}`);
  return res.json();
}

export async function getGlobal(): Promise<StrapiSingleResponse<GlobalCMS>> {
  const q = qs.stringify({
    populate: {
      siteIcon: { fields: ['url'] },
      siteIconDark: { fields: ['url'] },
      favicon: { fields: ['url'] },
      socialMedia: { populate: { icon: { fields: ['url'] } } },
      footerItems: { populate: '*' },
      defaultSeo: { populate: '*' },
    },
  }, { encodeValuesOnly: true });
  const res = await fetch(`${BASE_URL}/global?${q}`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`getGlobal ${res.status}`);
  return res.json();
}

export async function getHomePage(): Promise<StrapiSingleResponse<HomePageCMS>> {
  const q = qs.stringify({
    populate: {
      heroSlider: { populate: '*' },
      sections: {
        populate: {
          blocks: {
            on: {
              'widgets.tags-list': { populate: '*' },
              'widgets.latest-articles': { populate: '*' },
              'widgets.featured-articles': { populate: { articles: { populate: '*' } } },
              'widgets.embeds': { populate: '*' },
              'widgets.custom-html': { populate: '*' },
              'widgets.categories-list': { populate: '*' },
              'widgets.banners': { populate: { items: { populate: '*' } } },
              'widgets.brands': { populate: { items: { populate: '*' } } },
              'widgets.services': { populate: { items: { populate: '*' } } },
              'widgets.social-links': { populate: { socials: { populate: '*' } } },
              'widgets.fa-qs': { populate: '*' },
              'widgets.accordions': { populate: '*' },
              'widgets.video-gallery': { populate: { videos: { populate: '*' }, iframes: { populate: '*' } } },
              'widgets.image-gallery': { populate: { images: { populate: '*' } } },
              'shared.slider': { populate: '*' },
              'shared.quote': { populate: '*' },
              'shared.pdf-viewer': { populate: '*' },
            },
          },
        },
      },
      asides: {
        populate: {
          item: {
            on: {
              'widgets.tags-list': { populate: '*' },
              'widgets.latest-articles': { populate: '*' },
              'widgets.featured-articles': { populate: { articles: { populate: '*' } } },
              'widgets.embeds': { populate: '*' },
              'widgets.custom-html': { populate: '*' },
              'widgets.categories-list': { populate: '*' },
              'widgets.banners': { populate: { items: { populate: '*' } } },
              'widgets.social-links': { populate: { socials: { populate: '*' } } },
              'widgets.fa-qs': { populate: '*' },
              'widgets.accordions': { populate: '*' },
              'shared.slider': { populate: '*' },
            },
          },
        },
      },
    },
  }, { encodeValuesOnly: true });

  const res = await fetch(`${BASE_URL}/home-page?${q}`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`getHomePage ${res.status}`);
  return res.json();
}

export async function getPageBySlug(slug: string): Promise<StrapiListResponse<PageCMS>> {
  const q = qs.stringify({
    filters: { slug: { $eq: slug } },
    populate: {
      sections: {
        populate: {
          blocks: {
            on: {
              'widgets.tags-list': { populate: '*' },
              'widgets.latest-articles': { populate: '*' },
              'widgets.featured-articles': { populate: { articles: { populate: '*' } } },
              'widgets.embeds': { populate: '*' },
              'widgets.custom-html': { populate: '*' },
              'widgets.categories-list': { populate: '*' },
              'widgets.banners': { populate: { items: { populate: '*' } } },
              'widgets.brands': { populate: { items: { populate: '*' } } },
              'widgets.services': { populate: { items: { populate: '*' } } },
              'widgets.social-links': { populate: { socials: { populate: '*' } } },
              'widgets.fa-qs': { populate: '*' },
              'widgets.accordions': { populate: '*' },
              'widgets.video-gallery': { populate: { videos: { populate: '*' }, iframes: { populate: '*' } } },
              'widgets.image-gallery': { populate: { images: { populate: '*' } } },
              'shared.slider': { populate: '*' },
              'shared.quote': { populate: '*' },
              'shared.pdf-viewer': { populate: '*' },
            },
          },
        },
      },
      asides: {
        populate: {
          item: {
            on: {
              'widgets.tags-list': { populate: '*' },
              'widgets.latest-articles': { populate: '*' },
              'widgets.featured-articles': { populate: { articles: { populate: '*' } } },
              'widgets.embeds': { populate: '*' },
              'widgets.custom-html': { populate: '*' },
              'widgets.categories-list': { populate: '*' },
              'widgets.banners': { populate: { items: { populate: '*' } } },
              'widgets.social-links': { populate: { socials: { populate: '*' } } },
              'widgets.fa-qs': { populate: '*' },
              'widgets.accordions': { populate: '*' },
              'shared.slider': { populate: '*' },
            },
          },
        },
      },
      forms: {
        fields: ['title', 'description'],
        populate: { fields: { populate: '*' } },
      },
    },
  }, { encodeValuesOnly: true });

  const res = await fetch(`${BASE_URL}/pages?${q}`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`getPageBySlug ${res.status}`);
  return res.json();
}

export async function getMenuItems(menuName = 'Main Menu'): Promise<StrapiListResponse<MenuItemCMS>> {
  const q = qs.stringify({
    populate: {
      page: { fields: ['slug'] },
      article: { fields: ['slug'] },
      category: { fields: ['slug'] },
      children: { populate: '*' },
      menu: { fields: ['name'] },
    },
    filters: {
      menu: { name: { $eq: menuName } },
    },
    sort: 'order:asc',
  }, { encodeValuesOnly: true });

  const res = await fetch(`${BASE_URL}/menu-items?${q}`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`getMenuItems ${res.status}`);
  return res.json();
}

export async function getTopbarMenu(): Promise<StrapiListResponse<MenuItemCMS>> {
  const q = qs.stringify({
    populate: {
      page: { fields: ['slug'] },
      article: { fields: ['slug'] },
      category: { fields: ['slug'] },
      menu: { fields: ['name'] },
    },
    filters: {
      menu: {
        $or: [
          { name: { $eq: 'Top Left Menu' } },
          { name: { $eq: 'Top Right Menu' } },
        ],
      },
    },
    sort: 'order:asc',
  }, { encodeValuesOnly: true });

  const res = await fetch(`${BASE_URL}/menu-items?${q}`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`getTopbarMenu ${res.status}`);
  return res.json();
}
