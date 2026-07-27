"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { ArticleCMS } from '@/types/cms';

export default function LayananPage() {
  const [layananInfo, setLayananInfo] = useState<ArticleCMS[]>([]);
  const [ziRbArticles, setZiRbArticles] = useState<ArticleCMS[]>([]);

  useEffect(() => {
    let cancelled = false;
    const now = new Date().toISOString();

    // Fetch general layanan articles
    fetch(`/api/articles?filters[$or][0][title][$containsi]=layanan&filters[$or][1][content][$containsi]=layanan&filters[publication_date][$lte]=${encodeURIComponent(now)}&pagination[pageSize]=5&sort=publication_date:desc&populate=*&status=published`)
      .then(r => r.json())
      .then(j => {
        if (!cancelled) setLayananInfo(j.data || []);
      })
      .catch(() => {});

    // Fetch Zona Integritas & Reformasi Birokrasi articles from CMS
    fetch(`/api/articles?filters[category][slug][$eq]=zona-integritas&sort=publication_date:desc&populate=*&status=published`)
      .then(r => r.json())
      .then(j => {
        if (!cancelled) setZiRbArticles(j.data || []);
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <nav aria-label="Breadcrumb" className="max-w-container-max mx-auto px-4 md:px-margin-desktop pt-8">
        <ol className="flex items-center gap-2 text-label-md font-label-md text-on-surface-variant">
          <li><Link className="hover:text-primary" href="/">Beranda</Link></li>
          <li><span className="material-symbols-outlined text-sm" aria-hidden="true">chevron_right</span></li>
          <li className="text-primary font-bold" aria-current="page">Layanan</li>
        </ol>
      </nav>

      <section className="py-10 md:py-section-padding max-w-container-max mx-auto px-4 md:px-margin-desktop">
        <div className="max-w-3xl">
          <h2 className="font-headline-lg text-headline-lg text-primary">Layanan & Akuntabilitas Dinkominfo</h2>
          <p className="mt-4 text-body-md md:text-body-lg font-body-md md:font-body-lg text-on-surface-variant">Akses layanan informasi, komunikasi, transformasi digital, serta komitmen Zona Integritas & Reformasi Birokrasi Kabupaten Pekalongan.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-gutter mt-10 md:mt-12">
          <article className="bg-surface-white p-6 rounded-xl border border-border-light flex flex-col gap-4 hover-card">
            <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary"><span className="material-symbols-outlined" aria-hidden="true">verified_user</span></div>
            <div>
              <h3 className="font-label-md text-label-md font-bold text-primary">Zona Integritas & Reformasi Birokrasi (ZI & RB)</h3>
              <p className="mt-2 text-body-md font-body-md text-on-surface-variant">Dokumen Pakta Integritas, komitmen anti-korupsi, dan transparansi tata kelola birokrasi.</p>
            </div>
            <Link href="/berita?category=zona-integritas" className="mt-auto inline-flex items-center gap-2 text-primary font-label-md text-label-md font-bold hover:underline">
              Lihat Dokumen ZI & RB {ziRbArticles.length > 0 ? `(${ziRbArticles.length} dokumen)` : ''} <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span>
            </Link>
          </article>
          <article className="bg-surface-white p-6 rounded-xl border border-border-light flex flex-col gap-4 hover-card">
            <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary"><span className="material-symbols-outlined" aria-hidden="true">download</span></div>
            <div><h3 className="font-label-md text-label-md font-bold text-primary">Unduhan Dokumen</h3><p className="mt-2 text-body-md font-body-md text-on-surface-variant">Akses regulasi, materi publikasi, dan dokumen layanan Dinkominfo.</p></div>
            <Link href="/unduhan" className="mt-auto inline-flex items-center gap-2 text-primary font-label-md text-label-md font-bold hover:underline">Lihat unduhan <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span></Link>
          </article>
          <article className="bg-surface-white p-6 rounded-xl border border-border-light flex flex-col gap-4 hover-card">
            <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary"><span className="material-symbols-outlined" aria-hidden="true">support_agent</span></div>
            <div><h3 className="font-label-md text-label-md font-bold text-primary">Pengaduan Masyarakat</h3><p className="mt-2 text-body-md font-body-md text-on-surface-variant">Sampaikan pertanyaan, keluhan, dan aspirasi Anda kepada kami.</p></div>
            <Link href="/kontak" className="mt-auto inline-flex items-center gap-2 text-primary font-label-md text-label-md font-bold hover:underline">Hubungi kami <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span></Link>
          </article>
          <article className="bg-surface-white p-6 rounded-xl border border-border-light flex flex-col gap-4 hover-card">
            <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary"><span className="material-symbols-outlined" aria-hidden="true">description</span></div>
            <div><h3 className="font-label-md text-label-md font-bold text-primary">Informasi Publik</h3><p className="mt-2 text-body-md font-body-md text-on-surface-variant">Pelajari profil, tugas, fungsi, dan informasi publik Dinkominfo.</p></div>
            <Link href="/profil" className="mt-auto inline-flex items-center gap-2 text-primary font-label-md text-label-md font-bold hover:underline">Lihat informasi <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span></Link>
          </article>
          <article className="bg-surface-white p-6 rounded-xl border border-border-light flex flex-col gap-4 hover-card">
            <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary"><span className="material-symbols-outlined" aria-hidden="true">newspaper</span></div>
            <div><h3 className="font-label-md text-label-md font-bold text-primary">Berita dan Pengumuman</h3><p className="mt-2 text-body-md font-body-md text-on-surface-variant">Ikuti kabar, program, dan pengumuman terbaru dari Dinkominfo.</p></div>
            <Link href="/berita" className="mt-auto inline-flex items-center gap-2 text-primary font-label-md text-label-md font-bold hover:underline">Baca berita <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span></Link>
          </article>
          <article className="bg-surface-white p-6 rounded-xl border border-border-light flex flex-col gap-4 hover-card">
            <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary"><span className="material-symbols-outlined" aria-hidden="true">folder_open</span></div>
            <div><h3 className="font-label-md text-label-md font-bold text-primary">Data dan Publikasi</h3><p className="mt-2 text-body-md font-body-md text-on-surface-variant">Temukan dokumen, publikasi, dan sumber daya informasi untuk masyarakat.</p></div>
            <Link href="/unduhan" className="mt-auto inline-flex items-center gap-2 text-primary font-label-md text-label-md font-bold hover:underline">Buka publikasi <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span></Link>
          </article>
        </div>

        {/* Dynamic CMS Section: Zona Integritas & Reformasi Birokrasi */}
        {ziRbArticles.length > 0 && (
          <div id="zona-integritas-cms" className="mt-12 bg-surface-container-low rounded-xl p-6 md:p-8 border border-border-light">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-headline-md text-headline-md text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">verified_user</span>
                  Dokumen Zona Integritas & Reformasi Birokrasi (CMS Data)
                </h3>
                <p className="text-body-md font-body-md text-on-surface-variant mt-1">Dokumen resmi Pakta Integritas yang dipublikasikan oleh Dinkominfo melalui CMS.</p>
              </div>
              <Link href="/berita?category=zona-integritas" className="hidden sm:inline-flex items-center gap-1 text-label-md text-primary font-bold hover:underline">
                Lihat Semua <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              {ziRbArticles.map(a => (
                <Link key={a.documentId} href={`/berita/${a.slug}`} className="bg-surface-white p-4 rounded-lg border border-border-light hover:border-primary transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-xl">description</span>
                    <span className="text-body-md font-medium text-on-surface group-hover:text-primary transition-colors line-clamp-1">{a.title}</span>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary text-sm shrink-0">chevron_right</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {layananInfo.length > 0 && (
          <div className="mt-10 bg-surface-container-low rounded-xl p-6 md:p-8">
            <h3 className="font-headline-md text-headline-md text-primary">Informasi Layanan Lainnya dari CMS</h3>
            <ul className="mt-4 space-y-2">
              {layananInfo.map(a => (
                <li key={a.documentId} className="flex gap-2">
                  <span className="material-symbols-outlined text-primary text-sm mt-0.5">article</span>
                  <Link href={`/berita/${a.slug}`} className="text-body-md text-primary hover:underline">{a.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="max-w-container-max mx-auto px-4 md:px-margin-desktop pb-12 md:pb-section-padding">
        <div className="bg-primary dark:bg-surface-container-lowest rounded-xl p-8 md:p-12 text-on-primary">
          <div className="max-w-2xl">
            <h2 className="font-headline-lg text-headline-lg">Butuh bantuan atau informasi lebih lanjut?</h2>
            <p className="mt-4 text-body-md md:text-body-lg font-body-md md:font-body-lg opacity-80">Tim Dinkominfo siap membantu Anda mendapatkan layanan dan informasi yang diperlukan.</p>
            <Link href="/kontak" className="mt-6 inline-flex items-center gap-2 bg-secondary-container text-on-secondary-container px-6 py-3 rounded-lg font-label-md text-label-md font-bold hover:scale-105 transition-transform">Hubungi Kami <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span></Link>
          </div>
        </div>
      </section>
    </>
  );
}
