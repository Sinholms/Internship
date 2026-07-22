import { useParams, Link } from 'react-router-dom';
import { useArticleBySlug, useArticleByDocumentId, useLatestArticles } from '../hooks/useCms';
import { getStrapiImageUrl } from '../lib/getStrapiImageUrl';
import { formatDateID } from '../lib/formatDate';

function isStrapiDocumentId(id: string): boolean {
  // Strapi v5 documentId: 25 chars alphanumeric lowercase, e.g. "a3rkzd3y47hqddmhtso115np"
  // Slug: kebab-case with words > 2, length usually > 30, contains multiple dashes + readable words
  if (!id) return false;
  // If contains uppercase or spaces, not documentId
  if (/[A-Z\s]/.test(id)) return false;
  // DocumentId pattern: 20-30 chars, no repeated dash words that look like sentence
  // Heuristic: documentId is 25 chars [a-z0-9] without long readable words (>=4 consecutive letters that are not random)
  // Simpler: if length 25 and /^[a-z0-9]{25}$/ and not contain 3+ dashes -> documentId
  // If slug: contains > 2 dashes AND total parts > 3
  const dashCount = (id.match(/-/g) || []).length;
  // Slug: dashCount >= 3 and length > 30 -> definitely slug
  if (dashCount >= 3 && id.length > 30) return false;
  // DocumentId: exactly 25 alphanum lowercase, or 20-30 alphanum, no dash or at most 0 dashes in our CMS data is no dash
  if (/^[a-z0-9]{20,30}$/.test(id)) return true;
  // If still ambiguous and contains dash but short (< 30) and <=2 dashes, could be documentId? No, documentId never has dash in this CMS
  // So anything with dash and length > 15 is slug
  return false;
}

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const idStr = id || '';
  const isDocId = isStrapiDocumentId(idStr);

  const slugData = useArticleBySlug(isDocId ? undefined : idStr);
  const docData = useArticleByDocumentId(isDocId ? idStr : undefined);

  const article = slugData.article || docData.article;
  // Loading logic: if we are in docId mode, only care about docData, otherwise slugData
  const loading = isDocId ? docData.loading : slugData.loading;
  // For slug mode, also check if slug fetch finished with no article but doc fetch might? we try both
  const bothDone = !slugData.loading && !docData.loading;
  const err = !article && (bothDone || !loading) ? (slugData.error || docData.error || 'Artikel tidak ditemukan') : null;

  const { articles: related } = useLatestArticles(3);

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

  if (err || !article) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-margin-desktop py-12 text-center">
        <h1 className="font-headline-lg text-headline-lg text-primary">Artikel tidak ditemukan</h1>
        <p className="text-body-md text-on-surface-variant mt-4">Slug: {idStr}</p>
        <p className="text-label-sm text-on-surface-variant mt-2">Mode: {isDocId ? 'documentId' : 'slug'} - Error: {String(err)}</p>
        <div className="mt-6 flex gap-3 justify-center">
          <Link to="/berita" className="inline-flex bg-primary text-on-primary px-6 py-3 rounded-lg font-label-md">Kembali ke Berita</Link>
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

  return (
    <>
      <nav aria-label="Breadcrumb" className="max-w-container-max mx-auto px-4 md:px-margin-desktop pt-8">
        <ol className="flex items-center gap-2 text-label-md font-label-md text-on-surface-variant flex-wrap">
          <li><Link className="hover:text-primary" to="/">Beranda</Link></li>
          <li><span className="material-symbols-outlined text-sm" aria-hidden="true">chevron_right</span></li>
          <li><Link className="hover:text-primary" to="/berita">Berita</Link></li>
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
          <div className="prose max-w-none text-body-md md:text-body-lg leading-relaxed prose-headings:text-primary prose-p:text-on-surface-variant prose-a:text-primary prose-img:rounded-xl prose-img:w-full prose-headings:font-headline-lg" dangerouslySetInnerHTML={{ __html: article.content || '<p>Konten tidak tersedia.</p>' }} />
        </div>

        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-8">
            <span className="font-label-md text-label-md text-primary mr-1">Tags:</span>
            {article.tags.map(tag => (
              <Link key={tag.slug} to={`/berita?query=${encodeURIComponent(tag.name)}`} className="px-3 py-1 rounded-full bg-surface-container-low text-primary text-label-sm font-label-sm hover:bg-primary-fixed transition-colors">#{tag.name}</Link>
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
            <Link className="text-primary font-label-md text-label-md inline-flex items-center gap-2 hover:underline" to="/berita">Lihat Semua Berita <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-gutter">
            {(article.relatedArticles?.articles?.length ? article.relatedArticles.articles : related.slice(0,3)).map((rel: any) => {
              const relImg = rel.featuredImage ? getStrapiImageUrl(rel.featuredImage.formats?.medium?.url || rel.featuredImage.url) : `https://picsum.photos/seed/${rel.documentId || rel.id}/384/192`;
              return (
                <article key={rel.documentId || rel.id} className="bg-surface-white rounded-xl overflow-hidden border border-border-light shadow-sm hover-card">
                  <img alt={rel.title} className="w-full h-48 object-cover" width="384" height="192" loading="lazy" src={relImg} />
                  <div className="p-5">
                    <span className="text-label-sm font-label-sm text-primary bg-primary-fixed px-3 py-1 rounded-full">{rel.category?.name || 'Informasi'}</span>
                    <h3 className="font-headline-md text-headline-md text-primary leading-tight mt-4 line-clamp-2">{rel.title}</h3>
                    <Link className="mt-4 text-primary font-label-md text-label-md inline-flex items-center gap-2 hover:underline" to={`/berita/${rel.slug}`}>Baca Selengkapnya <span className="material-symbols-outlined text-sm">chevron_right</span></Link>
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
