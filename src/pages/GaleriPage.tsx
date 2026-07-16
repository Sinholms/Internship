import { Link } from 'react-router-dom';
import { useArticles } from '../hooks/useCms';
import { getStrapiImageUrl } from '../lib/api/image';

export default function GaleriPage() {
  const { articles, loading } = useArticles({ pageSize: 12, sort: 'desc' });

  // Fallback static gallery images if CMS has no featured images
  const fallbackImages = [
    "https://dinkominfo.pekalongankab.go.id/_next/image?url=https%3A%2F%2Fcdn.pekalongankab.go.id%2Fuploads%2FRakor_JKS_1265587acc.jpeg&w=3840&q=75",
    "https://dinkominfo.pekalongankab.go.id/_next/image?url=https%3A%2F%2Fcdn.pekalongankab.go.id%2Fuploads%2FKemanan_Siber_3_2a13d3ee69.jpeg&w=3840&q=75",
    "https://dinkominfo.pekalongankab.go.id/_next/image?url=https%3A%2F%2Fcdn.pekalongankab.go.id%2Fuploads%2FKemanan_Siber_2_16c34baee7.jpeg&w=3840&q=75",
    "https://dinkominfo.pekalongankab.go.id/_next/image?url=https%3A%2F%2Fcdn.pekalongankab.go.id%2Fuploads%2FHalal_Bihalal_3_1505332cd6.jpeg&w=3840&q=75",
    "https://dinkominfo.pekalongankab.go.id/_next/image?url=https%3A%2F%2Fcdn.pekalongankab.go.id%2Fuploads%2FHalal_Bihalal_4_1d897512af.jpeg&w=3840&q=75",
    "https://dinkominfo.pekalongankab.go.id/_next/image?url=https%3A%2F%2Fcdn.pekalongankab.go.id%2Fuploads%2F21042026_Kartini_web_eb5716753b.jpg&w=3840&q=75",
    "https://dinkominfo.pekalongankab.go.id/_next/image?url=https%3A%2F%2Fcdn.pekalongankab.go.id%2Fuploads%2FHalal_Bihalal_4_1d897512af.jpeg&w=3840&q=75",
    "https://dinkominfo.pekalongankab.go.id/_next/image?url=https%3A%2F%2Fcdn.pekalongankab.go.id%2Fuploads%2F21042026_Kartini_web_eb5716753b.jpg&w=3840&q=75",
  ];

  const galleryItems = articles.length > 0
    ? articles.map(a => ({
        title: a.title,
        img: a.featuredImage ? getStrapiImageUrl(a.featuredImage.formats?.large?.url || a.featuredImage.url) : null,
      }))
    : fallbackImages.map((img, i) => ({ title: `Galeri ${i+1}`, img }));

  // Ensure we have at least 8 for bento layout
  const displayItems = galleryItems.length >= 8 ? galleryItems.slice(0,8) : [...galleryItems, ...fallbackImages.map((img,i) => ({ title: `Galeri ${i}`, img }))].slice(0,8);

  return (
    <>
      <div className="bg-surface-container-low border-b border-border-light">
        <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-3 md:py-4">
          <nav className="flex items-center gap-2 text-label-sm font-label-sm text-on-surface-variant">
            <Link to="/" className="hover:text-primary transition-colors">Beranda</Link>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-primary font-bold">Galeri</span>
          </nav>
        </div>
      </div>

      <section className="py-12 md:py-section-padding max-w-container-max mx-auto px-4 md:px-margin-desktop">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="font-headline-lg text-headline-lg text-primary">Galeri Kegiatan</h2>
          <p className="text-body-md font-body-md text-on-surface-variant mt-2 max-w-2xl mx-auto">
            Dokumentasi momen berharga Dinas Komunikasi dan Informatika Kabupaten Pekalongan dalam mendukung transformasi digital
            {!loading && articles.length > 0 ? ` — ${articles.length} foto dari CMS` : ''}
          </p>
        </div>

        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[150px] md:auto-rows-[200px] animate-pulse">
            {Array.from({length:8}).map((_,i) => <div key={i} className={`bg-surface-container-low rounded-xl ${i===0 ? 'col-span-2 row-span-2' : ''} ${i===5 ? 'col-span-2' : ''}`}></div>)}
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[150px] md:auto-rows-[200px]">
            {displayItems.map((item, idx) => {
              const isLarge = idx === 0;
              const isWide = idx === 5;
              return (
                <div key={idx} className={`${isLarge ? 'col-span-2 row-span-2' : ''} ${isWide ? 'col-span-2' : ''} group relative overflow-hidden rounded-xl md:rounded-2xl`}>
                  <img alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={item.img || fallbackImages[idx % fallbackImages.length]} loading="lazy" />
                  <div className={`absolute inset-0 ${isLarge || isWide ? 'bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100' : 'bg-black/40 opacity-0 group-hover:opacity-100'} transition-opacity duration-300 flex ${isLarge || isWide ? 'items-end p-4 md:p-6' : 'items-center justify-center'}`}>
                    {isLarge || isWide ? (
                      <span className="text-white font-label-md text-label-md font-bold line-clamp-2">{item.title}</span>
                    ) : (
                      <span className="material-symbols-outlined text-white text-2xl md:text-3xl">zoom_in</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
