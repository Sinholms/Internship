import qs from 'qs';
import { BASE_URL, getHeaders } from '../api/client';
import type { StrapiListResponse } from '../api/client';
import type { PageCMS } from '../../types/cms';

function blocksOn() {
  return {
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
  };
}

function asideOn() {
  return {
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
  };
}

export async function getPageBySlug(slug: string): Promise<StrapiListResponse<PageCMS>> {
  const q = qs.stringify(
    {
      filters: { slug: { $eq: slug } },
      populate: {
        sections: {
          populate: {
            blocks: { on: blocksOn() },
          },
        },
        asides: {
          populate: {
            item: { on: asideOn() },
          },
        },
        forms: {
          fields: ['title', 'description'],
          populate: { fields: { populate: '*' } },
        },
      },
    },
    { encodeValuesOnly: true }
  );

  const res = await fetch(`${BASE_URL}/pages?${q}`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`getPageBySlug ${res.status}`);
  return res.json();
}
