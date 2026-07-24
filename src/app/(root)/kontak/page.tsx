import Link from 'next/link';
import { BASE_URL_SERVER, getHeadersServer } from '@/lib/api/client.server';
import KontakFormClient from './KontakFormClient';
import { getStrapiImageUrl } from '@/lib/getStrapiImageUrl';

interface ContactData {
  title?: string;
  description?: string;
  contactList?: { platform: string; content: string; link: string }[];
  featuredImage?: { url: string; formats?: Record<string, { url: string }> } | null;
}

async function fetchContactServer(): Promise<ContactData | null> {
  try {
    const res = await fetch(`${BASE_URL_SERVER}/contact-page?populate=*`, {
      headers: getHeadersServer(),
      next: { revalidate: 3600, tags: ['contact-page'] },
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.data) return null;
    return {
      title: json.data.title,
      description: json.data.description,
      contactList: json.data.contactList || [],
      featuredImage: json.data.featuredImage,
    };
  } catch {
    return null;
  }
}

export default async function KontakPage() {
  const contact = await fetchContactServer();

  const featuredUrl = contact?.featuredImage
    ? getStrapiImageUrl(contact.featuredImage.formats?.small?.url || contact.featuredImage.url)
    : null;

  return (
    <>
      <div className="bg-surface-container-low border-b border-border-light">
        <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-3 md:py-4">
          <nav className="flex items-center gap-2 text-label-sm font-label-sm text-on-surface-variant">
            <Link href="/" className="hover:text-primary transition-colors">Beranda</Link>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-primary font-bold">Kontak & Pengaduan</span>
          </nav>
        </div>
      </div>

      <section className="py-12 md:py-section-padding max-w-container-max mx-auto px-4 md:px-margin-desktop">
        <div className="mb-10 md:mb-12">
          <h2 className="font-headline-lg text-headline-lg text-primary">{contact?.title || 'Kontak & Pengaduan'}</h2>
          <p className="text-body-md font-body-md text-on-surface-variant mt-2 max-w-2xl">
            {contact?.description || 'Hubungi kami untuk informasi, bantuan layanan, atau sampaikan pengaduan Anda. Kami siap membantu pada jam layanan.'}
          </p>
          {featuredUrl && (
            <img src={featuredUrl} alt="Kontak" className="mt-4 rounded-xl w-full max-w-md h-48 object-cover" />
          )}
          {!contact && <p className="text-label-sm text-on-surface-variant mt-2">Data kontak CMS tidak tersedia, menampilkan fallback.</p>}
        </div>

        {/* Client form receives server data via props - no server-only import in client */}
        <KontakFormClient initialContact={contact} />
      </section>
    </>
  );
}
