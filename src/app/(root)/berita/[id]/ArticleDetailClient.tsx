"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getStrapiImageUrl } from '@/lib/getStrapiImageUrl';
import { formatDateID } from '@/lib/formatDate';
import { sanitizeArticleHtml } from '@/lib/sanitizeArticleHtml';
import { resolveArticlePdf } from '@/lib/articlePdfCore';
import type { ArticleCMS } from '@/types/cms';
import { detectArticleIdentifierField } from '@/lib/articleIdentifier';

export default function ArticleDetailClient() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string | undefined;
  const idStr = id || '';
  const isDocId = detectArticleIdentifierField(idStr) === 'documentId';

  const [article, setArticle] = useState<ArticleCMS | null>(null);
  const [related, setRelated] = useState<ArticleCMS[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!idStr) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    // Scoped proxy owns query building + slug/docId fallback + Bearer injection
    fetch(`/api/articles/${encodeURIComponent(idStr)}`)
      .then(async (r) => {
        if (!r.ok) {
          const txt = await r.text();
          throw new Error(`${r.status} ${txt.slice(0, 300)}`);
        }
        return r.json();
      })
      .then((j) => {
        if (cancelled) return;
        const found = Array.isArray(j.data) ? j.data[0] : j.data;
        if (!found) {
          setError('Artikel tidak ditemukan');
          setLoading(false);
          return;
        }
        setArticle(found as ArticleCMS);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError('Gagal memuat artikel. Silakan coba lagi.');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [idStr, isDocId]);

  // Related via proxy - 3 latest
  useEffect(() => {
    let cancelled = false;
    fetch('/api/articles?pagination[pageSize]=3&populate=*&sort=publication_date:desc&status=published')
      .then((r) => r.json())
      .then((j) => {
        if (!cancelled) setRelated(j.data || []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-margin-desktop py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-32 bg-surface-container-low rounded"></div>
          <div className="h-12 w-full bg-surface-container-low rounded"></div>
          <div className="h-64 w-full bg-surface-container-low rounded-xl"></div>
          <div className="h-4 w-full bg-surface-container-low rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-margin-desktop py-12 text-center">
        <h1 className="font-headline-lg text-headline-lg text-primary">Artikel tidak ditemukan</h1>
        <p className="text-body-md text-on-surface-variant mt-4">Slug: {idStr}</p>
        <p className="text-label-sm text-on-surface-variant mt-2">Mode: {isDocId ? 'documentId' : 'slug'} - Error: {String(error)}</p>
        <div className="mt-6 flex gap-3 justify-center">
          <Link href="/berita" className="inline-flex bg-primary text-on-primary px-6 py-3 rounded-lg font-label-md">Kembali ke Berita</Link>
          <button onClick={() => window.location.reload()} className="inline-flex bg-surface-white border border-border-light text-primary px-6 py-3 rounded-lg font-label-md">Coba Lagi</button>
        </div>
      </div>
    );
  }

  const imageUrl = article.featuredImage
    ? getStrapiImageUrl(article.featuredImage.formats?.large?.url || article.featuredImage.formats?.medium?.url || article.featuredImage.formats?.small?.url || article.featuredImage.url)
    : 'https://dinkominfo.pekalongankab.go.id/_next/image?url=https%3A%2F%2Fcdn.pekalongankab.go.id%2Fuploads%2FKemanan_Siber_3_2a13d3ee69.jpeg&w=1920&q=75';

  const authorName = article.author
    ? `${article.author.firstname || ''} ${article.author.lastname || ''}`.trim() || 'Admin Dinkominfo'
    : 'Admin Dinkominfo';

  const content = sanitizeArticleHtml(article.content || '<p>Konten tidak tersedia.</p>');
  const articlePdf = resolveArticlePdf(article.pdfViewer, getStrapiImageUrl);

  return (
    <>
      <nav aria-label="Breadcrumb" className="max-w-container-max mx-auto px-4 md:px-margin-desktop pt-8">
        <ol className="flex items-center gap-2 text-label-md font-label-md text-on-surface-variant flex-wrap">
          <li><Link className="hover:text-primary" href="/">Beranda</Link></li>
          <li><span className="material-symbols-outlined text-sm" aria-hidden="true">chevron_right</span></li>
          <li><Link className="hover:text-primary" href="/berita">Berita</Link></li>
          <li><span className="material-symbols-outlined text-sm" aria-hidden="true">chevron_right</span></li>
          <li className="text-primary font-bold line-clamp-1 max-w-[200px] md:max-w-[400px]" aria-current="page">{article.title}</li>
        </ol>
      </nav>

      <article className="max-w-4xl mx-auto px-4 md:px-margin-desktop py-8 md:py-12">
        <header className="mb-8 md:mb-10">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-label-md font-label-md text-on-surface-variant mb-5">
            <span className="px-3 py-1 rounded-full bg-primary-fixed text-primary">{article.category?.name || 'Informasi'}</span>
            <span className="inline-flex items-center gap-2"><span className="material-symbols-outlined text-lg" aria-hidden="true">calendar_today</span>{formatDateID(article.publication_date || article.publishedAt)}</span>
            <span className="inline-flex items-center gap-2"><span className="material-symbols-outlined text-lg" aria-hidden="true">person</span>{authorName}</span>
            {article.views !== undefined && <span className="inline-flex items-center gap-2"><span className="material-symbols-outlined text-lg" aria-hidden="true">visibility</span>{article.views} views</span>}
          </div>
          <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary leading-tight">{article.title}</h1>
        </header>

        <img alt={article.featuredImage?.alternativeText || article.title} className="w-full h-64 md:h-96 object-cover rounded-xl mb-8 md:mb-10" width="896" height="384" src={imageUrl} loading="lazy" />

        <div className="space-y-6 text-body-md md:text-body-lg font-body-md md:font-body-lg leading-relaxed text-on-surface-variant">
          <div className="prose max-w-none text-body-md md:text-body-lg leading-relaxed prose-headings:text-primary prose-p:text-on-surface-variant prose-a:text-primary prose-img:rounded-xl prose-img:w-full prose-headings:font-headline-lg" dangerouslySetInnerHTML={{ __html: content }} />
        </div>

        {articlePdf && (
          <div className="mt-10 rounded-xl border border-border-light bg-surface-white overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-border-light bg-surface-container-low">
              <span className="inline-flex items-center gap-2 font-label-md text-label-md text-primary"><span className="material-symbols-outlined" aria-hidden="true">picture_as_pdf</span>{articlePdf.description || 'Dokumen Lampiran'}</span>
              <a className="inline-flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md text-label-md hover:bg-primary-container transition-colors" href={articlePdf.url} target="_blank" rel="noopener noreferrer"><span className="material-symbols-outlined text-lg" aria-hidden="true">download</span>Unduh PDF</a>
            </div>
            <object data={articlePdf.url} type="application/pdf" className="w-full h-[600px]" aria-label={articlePdf.name}>
              <div className="px-5 py-6 text-body-md font-body-md text-on-surface-variant">Pratinjau PDF tidak dapat ditampilkan. <a className="text-primary underline" href={articlePdf.url} target="_blank" rel="noopener noreferrer">Buka dokumen di tab baru</a>.</div>
            </object>
          </div>
        )}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-8">
            <span className="font-label-md text-label-md text-primary mr-1">Tags:</span>
            {article.tags.map(tag => (
              <Link key={tag.slug} href={`/berita?query=${encodeURIComponent(tag.name)}`} className="px-3 py-1 rounded-full bg-surface-container-low text-primary text-label-sm font-label-sm hover:bg-primary-fixed transition-colors">#{tag.name}</Link>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 border-t border-border-light mt-10 pt-6">
          <span className="font-label-md text-label-md text-primary mr-1">Bagikan berita:</span>
          <a aria-label="Facebook" className="w-11 h-11 rounded-full bg-primary text-on-primary inline-flex items-center justify-center hover:bg-primary-container transition-colors" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} target="_blank" rel="noopener noreferrer"><span className="material-symbols-outlined" aria-hidden="true">thumb_up</span></a>
          <a aria-label="WhatsApp" className="w-11 h-11 rounded-full bg-surface-container-low text-primary inline-flex items-center justify-center hover:bg-primary-fixed transition-colors" href={`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + (typeof window !== 'undefined' ? window.location.href : ''))}`} target="_blank" rel="noopener noreferrer"><span className="material-symbols-outlined" aria-hidden="true">chat</span></a>
          <button aria-label="Salin tautan" className="w-11 h-11 rounded-full bg-surface-container-low text-primary inline-flex items-center justify-center hover:bg-primary-fixed transition-colors" onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Link disalin!'); }}><span className="material-symbols-outlined" aria-hidden="true">link</span></button>
        </div>
      </article>

      <section className="bg-surface-container-low py-12" aria-labelledby="related-news-title">
        <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div><h2 id="related-news-title" className="font-headline-lg text-headline-lg text-primary">Berita Terkait</h2><p className="text-body-md font-body-md text-on-surface-variant mt-2">Informasi terkini seputar transformasi digital Kabupaten Pekalongan.</p></div>
            <Link className="text-primary font-label-md text-label-md inline-flex items-center gap-2 hover:underline" href="/berita">Lihat Semua Berita <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-gutter">
            {(article.relatedArticles?.articles?.length ? article.relatedArticles.articles : related.slice(0,3)).map((rel: ArticleCMS) => {
              const relImg = rel.featuredImage ? getStrapiImageUrl(rel.featuredImage.formats?.medium?.url || rel.featuredImage.url) : `https://picsum.photos/seed/${rel.documentId || rel.id}/384/192`;
              return (
                <article key={rel.documentId || rel.id} className="bg-surface-white rounded-xl overflow-hidden border border-border-light shadow-sm hover-card">
                  <img alt={rel.title} className="w-full h-48 object-cover" width="384" height="192" loading="lazy" src={relImg} />
                  <div className="p-5">
                    <span className="text-label-sm font-label-sm text-primary bg-primary-fixed px-3 py-1 rounded-full">{rel.category?.name || 'Informasi'}</span>
                    <h3 className="font-headline-md text-headline-md text-primary leading-tight mt-4 line-clamp-2">{rel.title}</h3>
                    <Link className="mt-4 text-primary font-label-md text-label-md inline-flex items-center gap-2 hover:underline" href={`/berita/${rel.slug}`}>Baca Selengkapnya <span className="material-symbols-outlined text-sm">chevron_right</span></Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
