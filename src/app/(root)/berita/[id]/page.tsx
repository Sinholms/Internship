import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getStrapiImageUrl } from '@/lib/getStrapiImageUrl';
import { fetchArticleDetail } from '@/lib/actions/getArticleDetail.server';
import ArticleDetailClient from './ArticleDetailClient';

const PORTAL_TITLE = 'Dinkominfo Kabupaten Pekalongan - Portal Informasi Resmi';
const PORTAL_DESCRIPTION = 'Portal resmi Dinas Komunikasi dan Informatika Kabupaten Pekalongan';

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const article = await fetchArticleDetail(id);

  if (!article) {
    return { title: PORTAL_TITLE, description: PORTAL_DESCRIPTION };
  }

  const title = article.title || PORTAL_TITLE;
  const description = article.content
    ? stripHtml(article.content).slice(0, 160)
    : PORTAL_DESCRIPTION;

  const ogImage = article.featuredImage
    ? getStrapiImageUrl(
        article.featuredImage.formats?.large?.url ||
          article.featuredImage.formats?.medium?.url ||
          article.featuredImage.formats?.small?.url ||
          article.featuredImage.url
      )
    : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await fetchArticleDetail(id);

  if (!article) notFound();

  // Client child owns loading/error/share interactions and re-fetches via proxy.
  return <ArticleDetailClient />;
}
