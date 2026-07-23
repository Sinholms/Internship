import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { isReservedCmsRoute } from '@/lib/reservedCmsRoutes.server';
import { fetchPageBySlug } from '@/lib/actions/getPage.server';
import PageContent from './PageContent';

const PORTAL_TITLE = 'Dinkominfo Kabupaten Pekalongan - Portal Informasi Resmi';
const PORTAL_DESCRIPTION = 'Portal resmi Dinas Komunikasi dan Informatika Kabupaten Pekalongan';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (isReservedCmsRoute(slug)) {
    return { title: PORTAL_TITLE, description: PORTAL_DESCRIPTION };
  }

  const page = await fetchPageBySlug(slug);
  if (!page) {
    return { title: PORTAL_TITLE, description: PORTAL_DESCRIPTION };
  }

  const title = page.title || PORTAL_TITLE;
  const description = page.description || PORTAL_DESCRIPTION;
  return { title, description };
}

export default async function CmsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Defense-in-depth: dedicated routes take Next routing priority, but a
  // reserved slug must never fall through to a CMS lookup.
  if (isReservedCmsRoute(slug)) notFound();

  const page = await fetchPageBySlug(slug);
  if (!page) notFound();

  return (
    <>
      <nav aria-label="Breadcrumb" className="max-w-container-max mx-auto px-4 md:px-margin-desktop pt-8">
        <ol className="flex items-center gap-2 text-label-md font-label-md text-on-surface-variant flex-wrap">
          <li><Link className="hover:text-primary" href="/">Beranda</Link></li>
          <li><span className="material-symbols-outlined text-sm" aria-hidden="true">chevron_right</span></li>
          <li className="text-primary font-bold line-clamp-1 max-w-[200px] md:max-w-[400px]" aria-current="page">{page.title}</li>
        </ol>
      </nav>

      <section className="bg-primary text-on-primary mt-8">
        <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-12 md:py-section-padding">
          <h1 className="max-w-3xl font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-primary leading-tight">{page.title}</h1>
          {page.description && (
            <p className="max-w-2xl mt-4 text-body-md md:text-body-lg font-body-md md:font-body-lg opacity-90">{page.description}</p>
          )}
        </div>
      </section>

      <article className="max-w-4xl mx-auto px-4 md:px-margin-desktop py-8 md:py-12">
        <PageContent content={page.content || ''} />
      </article>
    </>
  );
}
