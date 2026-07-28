"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import heroFallback from '@/assets/foto-kominfo.png';
import { getStrapiImageUrl } from '@/lib/getStrapiImageUrl';
import { formatDateID } from '@/lib/formatDate';
import { adaptHomePage, type ServiceItemConfig } from '@/lib/adaptHomePage';
import type { ArticleCMS } from '@/types/cms';

type RecordValue = Readonly<Record<string, unknown>>;

function isRecord(value: unknown): value is RecordValue {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export default function HomePage() {
  const [latestNews, setLatestNews] = useState<ArticleCMS[]>([]);
  const [newsPool, setNewsPool] = useState<ArticleCMS[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const heroSrc = typeof heroFallback === 'string' ? heroFallback : heroFallback.src;
  const [latestArticlesLimit, setLatestArticlesLimit] = useState(3);
  const [latestArticlesCategory, setLatestArticlesCategory] = useState<string | null>(null);
  const [quickServices, setQuickServices] = useState<readonly ServiceItemConfig[]>([]);
  const [homeConfigReady, setHomeConfigReady] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/home-page', { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error(`Home page request failed with status ${response.status}`);
        return response.json();
      })
      .then(payload => {
        const config = adaptHomePage(payload);
        setLatestArticlesLimit(config.latestArticlesLimit);
        setLatestArticlesCategory(config.latestArticlesCategory);
        setQuickServices(config.services);
        setHomeConfigReady(true);
      })
      .catch(error => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.warn('[HomePage] CMS home data unavailable; using static home fallbacks');
        setHomeConfigReady(true);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const params = new URLSearchParams({
      'pagination[pageSize]': '10',
      populate: '*',
      sort: 'publication_date:desc',
      status: 'published',
    });

    fetch(`/api/articles?${params.toString()}`, { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error(String(r.status));
        const payload: unknown = await r.json();
        return payload;
      })
      .then((j) => {
        setNewsPool(isArticleListResponse(j) ? j.data : []);
      })
      .catch((e) => {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        console.warn('[HomePage] CMS article pool unavailable; using static section fallbacks');
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!homeConfigReady) return;

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      'pagination[pageSize]': String(latestArticlesLimit),
      populate: '*',
      sort: 'publication_date:desc',
      status: 'published',
    });
    if (latestArticlesCategory) {
      params.set('filters[category][slug][$eq]', latestArticlesCategory);
    }

    fetch(`/api/articles?${params.toString()}`, { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) {
          const txt = await r.text();
          throw new Error(`${r.status} ${txt.slice(0, 200)}`);
        }
        const payload: unknown = await r.json();
        return payload;
      })
      .then((j) => {
        setLatestNews(isArticleListResponse(j) ? j.data : []);
        setLoading(false);
      })
      .catch((e) => {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        setError(e instanceof Error ? e.message : 'Permintaan berita gagal');
        setLoading(false);
      });
    return () => controller.abort();
  }, [homeConfigReady, latestArticlesCategory, latestArticlesLimit]);

  function isArticleListResponse(value: unknown): value is { readonly data: ArticleCMS[] } {
    if (!isRecord(value) || !Array.isArray(value.data)) return false;
    return value.data.every(isArticleCMS);
  }

  function isArticleCMS(value: unknown): value is ArticleCMS {
    if (!isRecord(value)) return false;
    const article = value;
    return typeof article.id === 'number'
      && typeof article.documentId === 'string'
      && typeof article.title === 'string'
      && typeof article.slug === 'string'
      && typeof article.content === 'string'
      && typeof article.createdAt === 'string'
      && typeof article.updatedAt === 'string'
      && typeof article.publishedAt === 'string';
  }

  const latestIds = new Set(latestNews.map(a => a.documentId));
  // Prefer items that are not in latestNews, or slice next 3 items
  const kabupatenNewsPool = newsPool.filter(a => !latestIds.has(a.documentId));
  const kabupatenNews = (kabupatenNewsPool.length >= 3 ? kabupatenNewsPool : newsPool).slice(0, 3);

  const kabupatenItems = kabupatenNews.length > 0
    ? kabupatenNews.map(a => {
        const featImg = a.featuredImage;
        const resolvedImg = featImg?.url
          ? getStrapiImageUrl(featImg.formats?.small?.url || featImg.url)
          : `https://picsum.photos/seed/${a.documentId}/400/260`;

        return {
          key: a.documentId,
          date: formatDateID(a.publication_date || a.publishedAt),
          title: a.title,
          category: a.category?.name || 'Informasi',
          href: `/berita/${a.slug}`,
          img: resolvedImg,
        };
      })
    : [
        { key: 'fallback-1', date: '22 Sep 2024', title: 'WaliKabupaten Pekalongan Tinjau Implementasi SPBE di Setiap OPD', category: 'Pemerintahan', href: '/berita', img: 'https://picsum.photos/seed/kab1/400/260' },
        { key: 'fallback-2', date: '20 Jun 2023', title: 'Peringatan Hari Jadi Kabupaten Pekalongan ke-117: Sinergi Menuju Era Digital', category: 'Kabupaten', href: '/berita', img: 'https://picsum.photos/seed/kab2/400/260' },
        { key: 'fallback-3', date: '15 Mei 2023', title: 'Workshop Digitalisasi Pelayanan Publik OPD Pekalongan', category: 'Teknologi', href: '/berita', img: 'https://picsum.photos/seed/kab3/400/260' },
      ];

  const galleryFallback = [
    { title: 'Rapat Koordinasi Jaringan Komunikasi Sandi', img: 'https://dinkominfo.pekalongankab.go.id/_next/image?url=https%3A%2F%2Fcdn.pekalongankab.go.id%2Fuploads%2FRakor_JKS_1265587acc.jpeg&w=3840&q=75' },
    { title: 'Keamanan Siber', img: 'https://dinkominfo.pekalongankab.go.id/_next/image?url=https%3A%2F%2Fcdn.pekalongankab.go.id%2Fuploads%2FKemanan_Siber_3_2a13d3ee69.jpeg&w=3840&q=75' },
    { title: 'Sosialisasi Keamanan Siber', img: 'https://dinkominfo.pekalongankab.go.id/_next/image?url=https%3A%2F%2Fcdn.pekalongankab.go.id%2Fuploads%2FKemanan_Siber_2_16c34baee7.jpeg&w=3840&q=75' },
    { title: 'Halal Bihalal Dinkominfo', img: 'https://dinkominfo.pekalongankab.go.id/_next/image?url=https%3A%2F%2Fcdn.pekalongankab.go.id%2Fuploads%2FHalal_Bihalal_3_1505332cd6.jpeg&w=3840&q=75' },
    { title: 'Silaturahmi Pegawai', img: 'https://dinkominfo.pekalongankab.go.id/_next/image?url=https%3A%2F%2Fcdn.pekalongankab.go.id%2Fuploads%2FHalal_Bihalal_4_1d897512af.jpeg&w=3840&q=75' },
  ];

  const cmsGallery = newsPool.flatMap(a => {
    const img = a.featuredImage?.url
      ? getStrapiImageUrl(a.featuredImage.formats?.large?.url || a.featuredImage.formats?.medium?.url || a.featuredImage.url)
      : null;
    return img ? [{ title: a.title, img }] : [];
  });
  const galleryItems = [...cmsGallery, ...galleryFallback].slice(0, 5);

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[500px] md:h-[600px] overflow-hidden">
        <div className="absolute inset-0 w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${heroSrc})` }}>
          <div className="absolute inset-0 hero-gradient"></div>
        </div>

        <div className="relative max-w-container-max mx-auto px-4 md:px-margin-desktop h-full flex flex-col justify-center items-start text-on-primary">
          <div className="max-w-2xl space-y-4 md:space-y-6">
            <h2 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg leading-tight">Digitalisasi Layanan Publik Menuju Pekalongan Smart City</h2>
            <p className="font-body-md md:font-body-lg text-body-md md:text-body-lg opacity-90 line-clamp-3 md:line-clamp-none">Mewujudkan tata kelola pemerintahan yang transparan, akuntabel, dan berbasis teknologi untuk masyarakat Kabupaten Pekalongan yang lebih sejahtera.</p>
            <div className="flex flex-wrap gap-3 md:gap-4 pt-2 md:pt-4">
              <Link href="/layanan" className="bg-secondary-container text-on-secondary-container px-5 md:px-8 py-3 md:py-3.5 rounded-lg font-label-md text-label-md font-bold hover:scale-105 transition-transform shadow-lg">Lihat Layanan</Link>
              <Link href="/profil" className="bg-white/10 backdrop-blur-md border border-white/30 px-5 md:px-8 py-3 md:py-3.5 rounded-lg font-label-md text-label-md hover:bg-white/20 transition-all">Tentang Kami</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links / Services - dynamic via CMS or fallback with exact target links */}
      <section className="relative -mt-10 md:-mt-16 z-10 max-w-container-max mx-auto px-4 md:px-margin-desktop">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-gutter">
          {quickServices.map((item) => {
            const isExternal = item.isExternal || item.href.startsWith('http://') || item.href.startsWith('https://');
            const iconElement = item.iconUrl ? (
              <img src={item.iconUrl} alt={item.title} className="w-8 h-8 md:w-10 md:h-10 object-contain" />
            ) : (
              <span className="material-symbols-outlined text-2xl md:text-3xl">{item.iconName || 'apps'}</span>
            );

            const cardContent = (
              <>
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary-fixed mb-3 md:mb-4 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  {iconElement}
                </div>
                <span className="font-label-sm md:font-label-md text-label-sm md:text-label-md text-primary font-bold">{item.title}</span>
                <p className="text-xs md:text-label-sm font-label-sm text-on-surface-variant mt-1 line-clamp-2">{item.description}</p>
              </>
            );

            return isExternal ? (
              <a
                key={item.title}
                className="bg-surface-white p-4 md:p-8 rounded-xl shadow-md flex flex-col items-center text-center hover-card group"
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {cardContent}
              </a>
            ) : (
              <Link
                key={item.title}
                className="bg-surface-white p-4 md:p-8 rounded-xl shadow-md flex flex-col items-center text-center hover-card group"
                href={item.href}
              >
                {cardContent}
              </Link>
            );
          })}
        </div>
      </section>

      {/* News Section: Berita Terbaru - REAL DATA */}
      <section className="py-12 md:py-section-padding max-w-container-max mx-auto px-4 md:px-margin-desktop">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 md:mb-12 gap-4">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-primary">Berita Terbaru</h2>
            <p className="text-body-md font-body-md text-on-surface-variant mt-2">Update informasi terkini seputar kegiatan Dinkominfo</p>
          </div>
          <Link className="text-primary font-label-md text-label-md flex items-center gap-2 hover:underline" href="/berita">
            Lihat Semua Berita <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-gutter">
            {[1,2,3].map(i => (
              <div key={i} className="bg-surface-white rounded-xl overflow-hidden shadow-sm border border-border-light animate-pulse">
                <div className="h-48 md:h-56 bg-surface-container-low"></div>
                <div className="p-4 md:p-6 space-y-3">
                  <div className="h-4 w-20 bg-surface-container-low rounded-full"></div>
                  <div className="h-6 w-full bg-surface-container-low rounded"></div>
                  <div className="h-4 w-full bg-surface-container-low rounded"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="bg-error-container text-on-error-container p-4 rounded-xl text-body-md">
            Gagal memuat berita: {error} — menampilkan data fallback.
          </div>
        )}

        {!loading && latestNews.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-gutter">
            {latestNews.map((article) => {
              const imgUrl = article.featuredImage?.url
                ? getStrapiImageUrl(article.featuredImage.formats?.medium?.url || article.featuredImage.formats?.small?.url || article.featuredImage.url)
                : heroSrc;

              const excerpt = article.content
                ? article.content.replace(/<[^>]*>/g, ' ').slice(0, 150) + '...'
                : 'Informasi selengkapnya dari Dinkominfo Kabupaten Pekalongan.';

              return (
                <article key={article.documentId} className="bg-surface-white rounded-xl overflow-hidden shadow-sm hover-card border border-border-light flex flex-col">
                  <div className="h-48 md:h-56 bg-cover bg-center" style={{ backgroundImage: `url('${imgUrl}')` }}></div>
                  <div className="p-4 md:p-6 flex flex-col grow">
                    <div className="flex gap-2 mb-3 flex-wrap">
                      <span className="text-label-sm font-label-sm text-primary bg-primary-fixed px-3 py-1 rounded-full">
                        {article.category?.name || 'Informasi'}
                      </span>
                      <span className="text-label-sm font-label-sm text-on-surface-variant">
                        {formatDateID(article.publication_date || article.publishedAt)}
                      </span>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-primary leading-tight mb-3 line-clamp-2">{article.title}</h3>
                    <p className="text-body-md font-body-md text-on-surface-variant line-clamp-2 mb-4 md:mb-6">{excerpt}</p>
                    <Link className="text-primary font-label-md text-label-md font-bold hover:gap-3 transition-all flex items-center gap-2 mt-auto" href={`/berita/${article.slug}`}>
                      Baca Selengkapnya <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* City News and Announcements */}
      <section className="bg-surface-container-low py-12 md:py-section-padding">
        <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="font-headline-lg text-headline-lg text-primary">Berita Kabupaten</h2>
                <Link className="text-label-md font-label-md text-primary" href="/berita">Arsip Kabupaten</Link>
              </div>

              <div className="space-y-4 md:space-y-5">
                {kabupatenItems.map(item => (
                  <div key={item.key} className="flex gap-4 md:gap-5 bg-surface-white p-3.5 md:p-4 rounded-xl border border-border-light shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="w-28 h-20 md:w-36 md:h-24 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex flex-col justify-center grow min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-semibold text-primary bg-primary-fixed px-2 py-0.5 rounded-full">
                          {item.category}
                        </span>
                        <span className="text-label-sm font-label-sm text-on-surface-variant">{item.date}</span>
                      </div>
                      <h4 className="font-label-md text-label-md text-primary group-hover:text-primary-container font-semibold line-clamp-2 transition-colors">
                        {item.title}
                      </h4>
                      <Link className="text-primary font-label-sm text-label-sm font-bold mt-2 flex items-center gap-1 hover:underline" href={item.href}>
                        Selengkapnya <span className="material-symbols-outlined text-xs">arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6 md:space-y-8">
              <h2 className="font-headline-lg text-headline-lg text-primary">Pengumuman</h2>

              <div className="bg-primary-container text-on-primary-container p-6 md:p-8 rounded-xl relative overflow-hidden group">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <span className="inline-block px-3 py-1 bg-secondary-container text-on-secondary-container text-label-sm font-label-sm rounded-full mb-4">Penting</span>
                  <h4 className="font-headline-md text-headline-md mb-4">Open Recruitment: Programmer & Tenaga Teknis IT 2024</h4>
                  <p className="text-body-md font-body-md opacity-80 mb-6">Bergabunglah bersama tim IT Dinkominfo untuk membangun ekosistem digital Kabupaten Pekalongan.</p>
                  <Link className="inline-flex items-center gap-2 bg-surface-white text-primary px-6 py-2.5 rounded-lg font-label-md text-label-md hover:bg-secondary-container transition-colors" href="/kontak">Daftar Sekarang <span className="material-symbols-outlined">launch</span></Link>
                </div>
              </div>

              <div className="bg-surface-white p-4 md:p-6 rounded-xl border-l-4 border-secondary-container shadow-sm">
                <h4 className="font-label-md text-label-md text-primary">Survei Kepuasan Masyarakat 2024</h4>
                <p className="text-label-sm font-label-sm text-on-surface-variant mt-2">Bantu kami meningkatkan kualitas layanan dengan mengisi kuesioner singkat.</p>
                <Link className="text-primary font-label-md text-label-md mt-4 inline-block hover:underline" href="/layanan">Isi Survei</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Galeri Foto */}
      <section className="py-12 md:py-section-padding max-w-container-max mx-auto px-4 md:px-margin-desktop">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="font-headline-lg text-headline-lg text-primary">Galeri Kegiatan</h2>
          <p className="text-body-md font-body-md text-on-surface-variant mt-2">Dokumentasi momen berharga Dinas Komunikasi dan Informatika</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[150px] md:auto-rows-[200px]">
          {galleryItems.map((item, idx) => (
            idx === 0 ? (
              <div key={idx} className="col-span-2 row-span-2 group relative overflow-hidden rounded-xl md:rounded-2xl">
                <img alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={item.img}/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 md:p-6">
                  <span className="text-white font-label-md text-label-md line-clamp-2">{item.title}</span>
                </div>
              </div>
            ) : (
              <div key={idx} className="group relative overflow-hidden rounded-xl md:rounded-2xl">
                <img alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={item.img}/>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-2xl md:text-3xl">zoom_in</span>
                </div>
              </div>
            )
          ))}
        </div>
      </section>

      {/* Social Media Embed Section */}
      <section className="bg-primary text-on-primary py-12 md:py-section-padding">
        <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-4 md:space-y-6">
            <h2 className="font-headline-lg text-headline-lg">Terhubung Dengan Kami</h2>
            <p className="text-body-md md:text-body-lg text-body-md md:text-body-lg opacity-80">Dapatkan informasi real-time dan interaksi langsung melalui platform media sosial resmi Kabupaten Pekalongan.</p>
            <div className="flex gap-4">
              <Link className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary-container hover:text-on-secondary-container transition-all" href="/berita" aria-label="Bagikan informasi">
                <span className="material-symbols-outlined">share</span>
              </Link>
              <a className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary-container hover:text-on-secondary-container transition-all" href="https://www.instagram.com/dinkominfopekalongankab/" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <span className="material-symbols-outlined">public</span>
              </a>
              <a className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary-container hover:text-on-secondary-container transition-all" href="https://www.youtube.com/channel/UCIUtCxMVq9TsqJVpjXn8lJA" aria-label="Youtube" target="_blank" rel="noopener noreferrer">
                <span className="material-symbols-outlined">video_library</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <div className="bg-white/5 backdrop-blur-sm p-4 md:p-6 rounded-xl border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-info-blue rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-sm md:text-base">play_arrow</span>
                </div>
                <div>
                  <h4 className="font-label-md text-label-md">Youtube</h4>
                  <p className="text-label-sm font-label-sm opacity-60">@dinkominfokab.pekalongan1329</p>
                </div>
              </div>
              <p className="text-label-sm font-label-sm italic opacity-80 line-clamp-3">&quot;Upaya percepatan pembangunan infrastruktur digital di wilayah Pekalongan Selatan terus dimonitor...&quot;</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-4 md:p-6 rounded-xl border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-error-container rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-error-container text-sm md:text-base">photo_camera</span>
                </div>
                <div>
                  <h4 className="font-label-md text-label-md">Instagram</h4>
                  <p className="text-label-sm font-label-sm opacity-60">dinkominfopekalongankab</p>
                </div>
              </div>
              <p className="text-label-sm font-label-sm italic opacity-80 line-clamp-3">&quot;Intip keseruan workshop literasi digital bersama komunitas kreatif pekan lalu!&quot;</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
