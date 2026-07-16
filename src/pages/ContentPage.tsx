import { Link } from 'react-router-dom';
import { useArticles } from '../hooks/useCms';
import { getStrapiImageUrl } from '../lib/api/image';

export default function ContentPage() {
  const { articles: profilArticles, loading } = useArticles({ category: 'profil', pageSize: 10, sort: 'desc' });

  // Sort profil articles for display order
  const sorted = [...profilArticles].sort((a,b) => (a.title || '').localeCompare(b.title || ''));

  return (
    <>
      <nav aria-label="Breadcrumb" className="max-w-container-max mx-auto px-4 md:px-margin-desktop pt-8">
        <ol className="flex items-center gap-2 text-label-md font-label-md text-on-surface-variant">
          <li><Link className="hover:text-primary" to="/">Beranda</Link></li>
          <li><span className="material-symbols-outlined text-sm" aria-hidden="true">chevron_right</span></li>
          <li className="text-primary font-bold" aria-current="page">Profil</li>
        </ol>
      </nav>

      <section className="bg-primary text-on-primary mt-8">
        <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-12 md:py-section-padding">
          <span className="inline-flex items-center gap-2 bg-secondary-container text-on-secondary-container px-4 py-1.5 rounded-full font-label-md text-label-md">
            <span className="material-symbols-outlined text-base" aria-hidden="true">account_balance</span> Profil {loading ? '(memuat...)' : `(${sorted.length} dokumen CMS)`}
          </span>
          <h2 className="max-w-3xl mt-5 font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg leading-tight">Dinas Komunikasi dan Informatika Kabupaten Pekalongan</h2>
          <p className="max-w-2xl mt-4 text-body-md md:text-body-lg font-body-md md:font-body-lg opacity-90">Data profil diambil langsung dari CMS - Visi Misi, Struktur Organisasi, Profil Kantor, Data Pegawai. UI tetap persis.</p>
        </div>
      </section>

      <section className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-12 md:py-section-padding">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          <aside className="lg:col-span-3">
            <div className="lg:sticky lg:top-28 space-y-6">
              <nav aria-label="Daftar isi" className="bg-surface-white border border-border-light rounded-xl p-5 md:p-6">
                <h2 className="text-headline-md font-headline-md text-primary">Daftar Isi</h2>
                {loading ? (
                  <div className="mt-4 space-y-2 animate-pulse">
                    {[1,2,3,4].map(i => <div key={i} className="h-8 bg-surface-container-low rounded"></div>)}
                  </div>
                ) : (
                  <ol className="mt-4 space-y-1 border-l border-border-light">
                    {sorted.map(a => (
                      <li key={a.documentId}>
                        <a className="block border-l-2 border-transparent -ml-px px-4 py-2 text-label-md font-label-md text-on-surface-variant hover:border-primary hover:text-primary transition-colors" href={`#${a.slug}`}>
                          {a.title}
                        </a>
                      </li>
                    ))}
                  </ol>
                )}
              </nav>
              <div className="border-l-4 border-secondary-container bg-primary-fixed p-5 rounded-r-xl">
                <h2 className="text-label-md font-label-md text-primary">Sumber Data</h2>
                <p className="mt-2 text-label-sm font-label-sm text-on-surface-variant">Data profil diambil dari CMS kategori profil - {sorted.length} dokumen. Klik untuk lihat detail.</p>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-9 space-y-12 md:space-y-16">
            {loading && (
              <div className="space-y-6 animate-pulse">
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-surface-white border border-border-light rounded-xl p-6 space-y-3">
                    <div className="h-6 w-1/3 bg-surface-container-low rounded"></div>
                    <div className="h-4 w-full bg-surface-container-low rounded"></div>
                    <div className="h-32 w-full bg-surface-container-low rounded-xl"></div>
                  </div>
                ))}
              </div>
            )}

            {!loading && sorted.length === 0 && (
              <div className="bg-surface-white border border-border-light rounded-xl p-8 text-center">
                <p className="text-body-md text-on-surface-variant">Tidak ada dokumen profil di CMS kategori profil.</p>
                <Link to="/berita?category=profil" className="inline-flex mt-4 bg-primary text-on-primary px-6 py-2 rounded-lg">Lihat Berita Kategori Profil</Link>
              </div>
            )}

            {!loading && sorted.map((article) => {
              const hasImage = !!article.featuredImage;
              const imgUrl = hasImage ? getStrapiImageUrl(article.featuredImage!.formats?.medium?.url || article.featuredImage!.url) : null;

              return (
                <section key={article.documentId} id={article.slug} className="scroll-mt-28 border-b border-border-light pb-12 md:pb-16 last:border-0">
                  <p className="text-label-md font-label-md text-primary uppercase">PROFIL CMS • {article.category?.name || 'Profil'} • {article.views || 0} views</p>
                  <h2 className="mt-2 text-headline-lg font-headline-lg text-primary">{article.title}</h2>
                  <div className="mt-2 flex items-center gap-2 text-label-sm text-on-surface-variant">
                    <span>Slug: {article.slug}</span>
                    <span>•</span>
                    <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('id-ID') : ''}</span>
                  </div>

                  {imgUrl && (
                    <img src={imgUrl} alt={article.title} className="mt-6 w-full h-64 object-cover rounded-xl" />
                  )}

                  <div className="mt-5">
                    {/* Content HTML dari CMS - render dengan prose styling yang sama dengan design system */}
                    <div className="prose max-w-none text-body-md font-body-md text-on-surface-variant prose-headings:text-primary prose-p:text-on-surface-variant prose-a:text-primary prose-img:rounded-xl prose-img:w-full prose-headings:font-headline-lg prose-headings:text-headline-lg leading-relaxed space-y-4"
                         dangerouslySetInnerHTML={{ __html: article.content || '<p>Konten tidak tersedia.</p>' }} />
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <Link to={`/berita/${article.slug}`} className="inline-flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity">
                      Baca Detail <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                    <span className="inline-flex items-center gap-2 bg-surface-container-low text-primary px-4 py-2 rounded-lg font-label-sm">
                      <span className="material-symbols-outlined text-sm">visibility</span> {article.views || 0} views
                    </span>
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
