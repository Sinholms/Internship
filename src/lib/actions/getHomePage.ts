import qs from 'qs';
import { BASE_URL, getHeaders } from '../api/client';
import type { StrapiSingleResponse } from '../api/client';
import type { HomePageCMS } from '../../types/cms';

export async function getHomePage(): Promise<StrapiSingleResponse<HomePageCMS>> {
  const q = qs.stringify(
    {
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
    },
    { encodeValuesOnly: true }
  );

  const res = await fetch(`${BASE_URL}/home-page?${q}`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`getHomePage ${res.status}`);
  return res.json();
}
