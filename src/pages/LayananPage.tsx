import { Link } from 'react-router-dom';
import { useArticles } from '../hooks/useCms';

export default function LayananPage() {
  const { articles: layananInfo } = useArticles({ query: 'layanan', pageSize: 5 });

  return (
    <>
      <nav aria-label="Breadcrumb" className="max-w-container-max mx-auto px-4 md:px-margin-desktop pt-8">
        <ol className="flex items-center gap-2 text-label-md font-label-md text-on-surface-variant">
          <li><Link className="hover:text-primary" to="/">Beranda</Link></li>
          <li><span className="material-symbols-outlined text-sm" aria-hidden="true">chevron_right</span></li>
          <li className="text-primary font-bold" aria-current="page">Layanan</li>
        </ol>
      </nav>

      <section className="py-10 md:py-section-padding max-w-container-max mx-auto px-4 md:px-margin-desktop">
        <div className="max-w-3xl">
          <h2 className="font-headline-lg text-headline-lg text-primary">Layanan Dinkominfo</h2>
          <p className="mt-4 text-body-md md:text-body-lg font-body-md md:font-body-lg text-on-surface-variant">Akses layanan informasi, komunikasi, dan transformasi digital Kabupaten Pekalongan. Kami hadir untuk memudahkan masyarakat memperoleh informasi publik serta menyampaikan kebutuhan dan aspirasi.</p>
          {layananInfo.length > 0 && <p className="mt-2 text-label-sm text-primary font-bold">{layananInfo.length} info terkait layanan dari CMS</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-gutter mt-10 md:mt-12">
          <article className="bg-surface-white p-6 rounded-xl border border-border-light flex flex-col gap-4 hover-card">
            <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary"><span className="material-symbols-outlined" aria-hidden="true">download</span></div>
            <div><h3 className="font-label-md text-label-md font-bold text-primary">Unduhan Dokumen</h3><p className="mt-2 text-body-md font-body-md text-on-surface-variant">Akses regulasi, materi publikasi, dan dokumen layanan Dinkominfo.</p></div>
            <Link to="/unduhan" className="mt-auto inline-flex items-center gap-2 text-primary font-label-md text-label-md font-bold hover:underline">Lihat unduhan <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span></Link>
          </article>
          <article className="bg-surface-white p-6 rounded-xl border border-border-light flex flex-col gap-4 hover-card">
            <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary"><span className="material-symbols-outlined" aria-hidden="true">support_agent</span></div>
            <div><h3 className="font-label-md text-label-md font-bold text-primary">Pengaduan Masyarakat</h3><p className="mt-2 text-body-md font-body-md text-on-surface-variant">Sampaikan pertanyaan, keluhan, dan aspirasi Anda kepada kami.</p></div>
            <Link to="/kontak" className="mt-auto inline-flex items-center gap-2 text-primary font-label-md text-label-md font-bold hover:underline">Hubungi kami <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span></Link>
          </article>
          <article className="bg-surface-white p-6 rounded-xl border border-border-light flex flex-col gap-4 hover-card">
            <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary"><span className="material-symbols-outlined" aria-hidden="true">description</span></div>
            <div><h3 className="font-label-md text-label-md font-bold text-primary">Informasi Publik</h3><p className="mt-2 text-body-md font-body-md text-on-surface-variant">Pelajari profil, tugas, fungsi, dan informasi publik Dinkominfo.</p></div>
            <Link to="/profil" className="mt-auto inline-flex items-center gap-2 text-primary font-label-md text-label-md font-bold hover:underline">Lihat informasi <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span></Link>
          </article>
          <article className="bg-surface-white p-6 rounded-xl border border-border-light flex flex-col gap-4 hover-card">
            <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary"><span className="material-symbols-outlined" aria-hidden="true">newspaper</span></div>
            <div><h3 className="font-label-md text-label-md font-bold text-primary">Berita dan Pengumuman</h3><p className="mt-2 text-body-md font-body-md text-on-surface-variant">Ikuti kabar, program, dan pengumuman terbaru dari Dinkominfo.</p></div>
            <Link to="/berita" className="mt-auto inline-flex items-center gap-2 text-primary font-label-md text-label-md font-bold hover:underline">Baca berita <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span></Link>
          </article>
          <article className="bg-surface-white p-6 rounded-xl border border-border-light flex flex-col gap-4 hover-card">
            <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary"><span className="material-symbols-outlined" aria-hidden="true">public</span></div>
            <div><h3 className="font-label-md text-label-md font-bold text-primary">Literasi Digital</h3><p className="mt-2 text-body-md font-body-md text-on-surface-variant">Dapatkan materi dan informasi untuk meningkatkan kecakapan digital masyarakat.</p></div>
            <Link to="/berita" className="mt-auto inline-flex items-center gap-2 text-primary font-label-md text-label-md font-bold hover:underline">Jelajahi artikel <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span></Link>
          </article>
          <article className="bg-surface-white p-6 rounded-xl border border-border-light flex flex-col gap-4 hover-card">
            <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary"><span className="material-symbols-outlined" aria-hidden="true">folder_open</span></div>
            <div><h3 className="font-label-md text-label-md font-bold text-primary">Data dan Publikasi</h3><p className="mt-2 text-body-md font-body-md text-on-surface-variant">Temukan dokumen, publikasi, dan sumber daya informasi untuk masyarakat.</p></div>
            <Link to="/unduhan" className="mt-auto inline-flex items-center gap-2 text-primary font-label-md text-label-md font-bold hover:underline">Buka publikasi <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span></Link>
          </article>
        </div>

        {layananInfo.length > 0 && (
          <div className="mt-10 bg-surface-container-low rounded-xl p-6 md:p-8">
            <h3 className="font-headline-md text-headline-md text-primary">Informasi Layanan dari CMS</h3>
            <ul className="mt-4 space-y-2">
              {layananInfo.map(a => (
                <li key={a.documentId} className="flex gap-2">
                  <span className="material-symbols-outlined text-primary text-sm mt-0.5">article</span>
                  <Link to={`/berita/${a.slug}`} className="text-body-md text-primary hover:underline">{a.title}</Link>
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
            <Link to="/kontak" className="mt-6 inline-flex items-center gap-2 bg-secondary-container text-on-secondary-container px-6 py-3 rounded-lg font-label-md text-label-md font-bold hover:scale-105 transition-transform">Hubungi Kami <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span></Link>
          </div>
        </div>
      </section>
    </>
  );
}
