import qs from 'qs';
import { BASE_URL, getHeaders } from '../api/client';
import type { StrapiSingleResponse } from '../api/client';
import type { GlobalCMS } from '../../types/cms';

export async function getGlobal(): Promise<StrapiSingleResponse<GlobalCMS>> {
  const q = qs.stringify(
    {
      populate: {
        siteIcon: { fields: ['url'] },
        siteIconDark: { fields: ['url'] },
        favicon: { fields: ['url'] },
        socialMedia: { populate: { icon: { fields: ['url'] } } },
        footerItems: { populate: '*' },
        defaultSeo: { populate: '*' },
      },
    },
    { encodeValuesOnly: true }
  );
  const res = await fetch(`${BASE_URL}/global?${q}`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`getGlobal ${res.status}`);
  return res.json();
}
