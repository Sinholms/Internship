import qs from 'qs';
import { BASE_URL, getHeaders } from '../api/client';
import type { StrapiListResponse } from '../api/client';
import type { MenuItemCMS } from '../../types/cms';

export async function getMenuItems(menuName = 'Main Menu'): Promise<StrapiListResponse<MenuItemCMS>> {
  const q = qs.stringify(
    {
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
    },
    { encodeValuesOnly: true }
  );

  const res = await fetch(`${BASE_URL}/menu-items?${q}`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`getMenuItems ${res.status}`);
  return res.json();
}

export async function getTopbarMenu(): Promise<StrapiListResponse<MenuItemCMS>> {
  const q = qs.stringify(
    {
      populate: {
        page: { fields: ['slug'] },
        article: { fields: ['slug'] },
        category: { fields: ['slug'] },
        menu: { fields: ['name'] },
      },
      filters: {
        menu: {
          $or: [{ name: { $eq: 'Top Left Menu' } }, { name: { $eq: 'Top Right Menu' } }],
        },
      },
      sort: 'order:asc',
    },
    { encodeValuesOnly: true }
  );

  const res = await fetch(`${BASE_URL}/menu-items?${q}`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`getTopbarMenu ${res.status}`);
  return res.json();
}
