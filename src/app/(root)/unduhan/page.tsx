"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { ArticleCMS } from '@/types/cms';

interface DocItem {
  title: string;
  type: string;
  size: string;
  icon: string;
}

const staticDocs: DocItem[] = [
  { title: "Peraturan Bupati tentang SPBE", type: "PDF", size: "1.2MB", icon: "picture_as_pdf" },
  { title: "Formulir Permohonan Informasi Publik", type: "DOCX", size: "240KB", icon: "description" },
  { title: "Data Statistik Sektoral 2023", type: "XLSX", size: "890KB", icon: "table" },
  { title: "LKjIP Dinkominfo 2023", type: "PDF", size: "3.4MB", icon: "picture_as_pdf" },
  { title: "Materi Literasi Digital", type: "PDF", size: "5.1MB", icon: "picture_as_pdf" },
  { title: "Rencana Strategis Dinkominfo 2021-2026", type: "PDF", size: "2.8MB", icon: "picture_as_pdf" },
];

export default function UnduhanPage() {
  const [downloadArticles, setDownloadArticles] = useState<ArticleCMS[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch('/api/articles?filters[category][slug][$containsi]=download&pagination[pageSize]=20&sort=publication_date:desc&populate=*&status=published')
      .then(r => r.json())
      .then(j => {
        if (cancelled) return;
        setDownloadArticles(j.data || []);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // If CMS has download articles, transform them to doc list, otherwise static
  const docs = downloadArticles.length > 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? downloadArticles.map(a => ({
        title: a.title,
        type: (a as any).fileType || 'PDF',
        size: '-',
        icon: 'picture_as_pdf',
        slug: a.slug,
        href: `/berita/${a.slug}`,
      }))
    : staticDocs.map(d => ({ ...d, href: '#', slug: '' }));

  return (
    <>
      <div className="bg-surface-container-low border-b border-border-light">
        <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-3 md:py-4">
          <nav className="flex items-center gap-2 text-label-sm font-label-sm text-on-surface-variant">
            <Link href="/" className="hover:text-primary transition-colors">Beranda</Link>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-primary font-bold">Unduhan</span>
          </nav>
        </div>
      </div>

      <section className="py-12 md:py-section-padding max-w-container-max mx-auto px-4 md:px-margin-desktop">
        <div className="mb-10 md:mb-12">
          <h2 className="font-headline-lg text-headline-lg text-primary">Unduhan & Informasi Publik</h2>
          <p className="text-body-md font-body-md text-on-surface-variant mt-2 max-w-2xl">
            Akses dokumen resmi, regulasi, dan informasi publik dari Dinkominfo Kabupaten Pekalongan.
            {loading ? ' Memuat dari CMS...' : downloadArticles.length > 0 ? ` — ${downloadArticles.length} dokumen dari CMS` : ' — data statis (CMS kategori download kosong)'}
          </p>
        </div>

        <div className="space-y-4">
          {docs.map((doc, i) => (
            <div key={i} className="bg-surface-white rounded-xl border border-border-light shadow-sm p-4 md:p-6 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary-fixed text-primary flex items-center justify-center shrink-0">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <span className="material-symbols-outlined">{(doc as any).icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-label-md text-label-md font-bold text-primary truncate">{doc.title}</h3>
                <p className="text-label-sm font-label-sm text-on-surface-variant mt-1">{doc.type} · {(doc as any).size}</p>
              </div>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(doc as any).href && (doc as any).href !== '#' ? (
                <Link href={(doc as any).href} className="inline-flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-lg font-label-md text-label-md font-bold hover:opacity-90 transition-opacity shrink-0">
                  <span className="material-symbols-outlined text-[18px]">visibility</span> Lihat
                </Link>
              ) : (
                <a href="#" download className="inline-flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-lg font-label-md text-label-md font-bold hover:opacity-90 transition-opacity shrink-0">
                  <span className="material-symbols-outlined text-[18px]">download</span> Unduh
                </a>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
