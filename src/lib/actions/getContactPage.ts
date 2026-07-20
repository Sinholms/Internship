import qs from 'qs';
import { BASE_URL, getHeaders } from '../api/client';

export async function getContactPage() {
  const q = qs.stringify(
    {
      populate: {
        featuredImage: { populate: '*' },
        contactList: { populate: '*' },
      },
    },
    { encodeValuesOnly: true }
  );
  const res = await fetch(`${BASE_URL}/contact-page?${q}`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`getContactPage ${res.status}`);
  return res.json();
}
