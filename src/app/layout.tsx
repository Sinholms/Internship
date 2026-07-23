import type { Metadata } from 'next';
import qs from 'qs';
import './globals.css';
import { BASE_URL_SERVER, getHeadersServer } from '@/lib/api/client.server';
import { getStrapiImageUrl } from '@/lib/getStrapiImageUrl';
import type { GlobalCMS } from '@/types/cms';

const FALLBACK_TITLE = 'Dinkominfo Kabupaten Pekalongan - Portal Informasi Resmi';
const FALLBACK_DESCRIPTION =
  'Portal resmi Dinas Komunikasi dan Informatika Kabupaten Pekalongan';

async function fetchGlobal(): Promise<GlobalCMS | null> {
  const q = qs.stringify(
    {
      populate: {
        siteIcon: { fields: ['url'] },
        favicon: { fields: ['url'] },
        defaultSeo: { populate: '*' },
      },
    },
    { encodeValuesOnly: true }
  );
  try {
    const res = await fetch(`${BASE_URL_SERVER}/global?${q}`, {
      headers: getHeadersServer(),
      next: { revalidate: 3600, tags: ['global'] },
    });
    if (!res.ok) return null;
    const json: { data?: GlobalCMS | null } = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const global = await fetchGlobal();
  const seo = global?.defaultSeo;

  const title = seo?.metaTitle?.trim() || FALLBACK_TITLE;
  const description = seo?.metaDescription?.trim() || FALLBACK_DESCRIPTION;

  const metadata: Metadata = { title, description };

  const iconUrl = getStrapiImageUrl(global?.favicon?.url ?? global?.siteIcon?.url);
  if (iconUrl) {
    metadata.icons = { icon: iconUrl };
  }

  const shareUrl = getStrapiImageUrl(seo?.shareImage?.url);
  if (shareUrl) {
    metadata.openGraph = {
      title,
      description,
      images: [{ url: shareUrl }],
    };
  }

  return metadata;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="light scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.classList.remove('light','dark');document.documentElement.classList.add(t);}catch(e){}})();`,
          }}
        />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="text-on-surface bg-[#fbf9f8] antialiased">
        {children}
      </body>
    </html>
  );
}
