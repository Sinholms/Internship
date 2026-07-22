"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getStrapiImageUrl } from '@/lib/getStrapiImageUrl';
import { formatDateID } from '@/lib/formatDate';
import type { ArticleCMS, CategoryCMS } from '@/types/cms';
import qs from 'qs';

interface Props {
  initialData?: { articles: ArticleCMS[]; total: number; pageCount: number };
}

export default function BeritaClient({ initialData }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams?.get('query') || undefined;
  const categoryParam = searchParams?.get('category') || undefined;
  const pageParam = parseInt(searchParams?.get('page') || '1', 10);

  const [activeCat, setActiveCat] = useState<string>(categoryParam || 'Semua');
  const [articles, setArticles] = useState<ArticleCMS[]>(initialData?.articles || []);
  const [pageCount, setPageCount] = useState(initialData?.pageCount || 1);
  const [total, setTotal] = useState(initialData?.total || 0);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryCMS[]>([]);

  // Fetch categories via proxy (no token)
  useEffect(() => {
    let cancelled = false;
    fetch('/api/categories?pagination[pageSize]=100')
      .then(r => r.json())
      .then(j => {
        if (!cancelled && j?.data) setCategories(j.data);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Fetch articles via proxy /api/articles (server injects Bearer)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const buildQuery = () => {
      const params = {
        sort: 'publication_date:desc',
        filters: {
          $or: query ? [{ title: { $containsi: query } }, { content: { $containsi: query } }, { tags: { name: { $containsi: query } } }] : undefined,
          category: activeCat !== 'Semua' ? { slug: { $containsi: activeCat } } : undefined,
          publication_date: { $lte: new Date().toISOString() },
        },
        populate: '*',
        pagination: { pageSize: 9, page: pageParam },
        status: 'published',
      };
      return qs.stringify(params, { encodeValuesOnly: true });
    };

    const q = buildQuery();
    fetch(`/api/articles?${q}`)
      .then(async r => {
        if (!r.ok) {
          const txt = await r.text();
          throw new Error(`${r.status} ${txt.slice(0,200)}`);
        }
        return r.json();
      })
      .then(j => {
        if (cancelled) return;
        setArticles(j.data || []);
        setPageCount(j.meta?.pagination?.pageCount || 1);
        setTotal(j.meta?.pagination?.total || 0);
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setError((e as Error).message);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [query, activeCat, pageParam]);

  const filterCategories = ['Semua', ...(categories?.map(c => c.name) || ['Teknologi', 'Layanan', 'Informasi'])];

  const handleCategory = (cat: string) => {
    setActiveCat(cat);
    const newParams = new URLSearchParams(searchParams?.toString() || '');
    if (cat === 'Semua') newParams.delete('category');
    else newParams.set('category', cat);
    newParams.set('page', '1');
    router.push(`/berita?${newParams.toString()}`);
  };

  const handlePage = (p: number) => {
    const newParams = new URLSearchParams(searchParams?.toString() || '');
    newParams.set('page', String(p));
    router.push(`/berita?${newParams.toString()}`);
    window.scrollTo(0, 0);
  };

  return (
    <>
      <section className="bg-primary text-on-primary py-10 md:py-14">
        <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-label-sm font-label-sm opacity-80">
            <Link href="/" className="hover:underline">Beranda</Link>
            <span className="material-symbols-outlined text-sm" aria-hidden="true">chevron_right</span>
            <span aria-current="page">Berita</span>
          </nav>
          <h2 className="font-headline-lg text-headline-lg mt-4">Berita & Informasi</h2>
          <p className="text-body-md font-body-md opacity-80 mt-2 max-w-2xl">Kabar terbaru, agenda, dan informasi layanan dari Dinas Komunikasi dan Informatika Kabupaten Pekalongan.</p>
        </div>
      </section>

      <section className="py-10 md:py-section-padding max-w-container-max mx-auto px-4 md:px-margin-desktop">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8 md:mb-10">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-primary">Berita Terkini</h2>
            <p className="text-body-md font-body-md text-on-surface-variant mt-2">Pilih kategori untuk menemukan informasi yang Anda butuhkan. {total ? `(${total} artikel)` : ''} {error ? '(Error)' : ''}</p>
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Filter kategori berita">
            {filterCategories.slice(0, 6).map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategory(cat)}
                className={activeCat === cat
                  ? "px-4 py-2 rounded-full bg-primary text-on-primary text-label-md font-label-md"
                  : "px-4 py-2 rounded-full bg-surface-white border border-border-light text-on-surface-variant text-label-md font-label-md hover:border-primary hover:text-primary transition-colors"}
                type="button"
                aria-pressed={activeCat === cat}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-gutter">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-surface-white rounded-xl overflow-hidden border border-border-light animate-pulse">
                <div className="h-48 w-full bg-surface-container-low"></div>
                <div className="p-5 space-y-3">
                  <div className="h-4 w-20 bg-surface-container-low rounded-full"></div>
                  <div className="h-6 w-full bg-surface-container-low rounded"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && !loading && articles.length === 0 && (
          <div className="text-center py-12 text-on-surface-variant">
            <p className="text-body-md">Gagal memuat berita: {error}</p>
          </div>
        )}

        {!loading && articles.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-gutter">
              {articles.map(article => {
                const img = (article as any).featuredImage
                  ? getStrapiImageUrl((article as any).featuredImage.formats?.medium?.url || (article as any).featuredImage.formats?.small?.url || (article as any).featuredImage.url)
                  : `https://picsum.photos/seed/${(article as any).documentId}/640/360`;
                const desc = (article as any).content ? (article as any).content.replace(/<[^>]*>/g, ' ').slice(0, 140) + '...' : 'Informasi selengkapnya dari Dinkominfo.';
                return (
                  <article key={(article as any).documentId || (article as any).id} className="bg-surface-white rounded-xl overflow-hidden border border-border-light hover-card flex flex-col">
                    <img alt={article.title} className="h-48 w-full object-cover" width="640" height="360" src={img} loading="lazy" />
                    <div className="p-5 md:p-6 flex flex-col grow">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="text-label-sm font-label-sm text-primary bg-primary-fixed px-3 py-1 rounded-full">{(article as any).category?.name || 'Informasi'}</span>
                        <time className="text-label-sm font-label-sm text-on-surface-variant" dateTime={(article as any).publication_date || (article as any).publishedAt}>{formatDateID((article as any).publication_date || (article as any).publishedAt)}</time>
                      </div>
                      <h3 className="font-headline-md text-headline-md text-primary leading-tight line-clamp-2">{article.title}</h3>
                      <p className="text-body-md font-body-md text-on-surface-variant line-clamp-2 mt-3">{desc}</p>
                      <Link className="mt-5 text-primary font-label-md text-label-md font-bold flex items-center gap-2 hover:underline" href={`/berita/${(article as any).slug}`}>Baca Selengkapnya <span className="material-symbols-outlined text-sm">arrow_forward</span></Link>
                    </div>
                  </article>
                );
              })}
            </div>

            <nav className="flex items-center justify-center gap-2 mt-10" aria-label="Navigasi halaman">
              <button onClick={() => pageParam > 1 && handlePage(pageParam - 1)} aria-label="Halaman sebelumnya" className="w-10 h-10 rounded-lg border border-border-light bg-surface-white flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              {Array.from({ length: Math.min(pageCount, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => handlePage(p)} aria-current={p === pageParam ? 'page' : undefined} className={p === pageParam ? 'w-10 h-10 rounded-lg bg-primary text-on-primary flex items-center justify-center font-label-md' : 'w-10 h-10 rounded-lg border border-border-light bg-surface-white flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary font-label-md'}>{p}</button>
              ))}
              {pageCount > 5 && <span className="w-8 text-center text-on-surface-variant">…</span>}
              <button onClick={() => pageParam < pageCount && handlePage(pageParam + 1)} aria-label="Halaman berikutnya" className="w-10 h-10 rounded-lg border border-border-light bg-surface-white flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </nav>
          </>
        )}
      </section>
    </>
  );
}
