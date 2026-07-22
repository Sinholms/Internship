/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.pekalongankab.go.id' },
      { protocol: 'https', hostname: 'cdn.pekalongankab.go.id' },
      { protocol: 'https', hostname: 'cms.dinkominfo.pekalongankab.go.id' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  async redirects() {
    return [
      { source: '/pages/articles.html', destination: '/berita', statusCode: 308 },
      { source: '/pages/article-detail.html', destination: '/berita', statusCode: 308 },
      { source: '/pages/content-page.html', destination: '/profil', statusCode: 308 },
      { source: '/pages/layanan.html', destination: '/layanan', statusCode: 308 },
      { source: '/pages/galeri.html', destination: '/galeri', statusCode: 308 },
      { source: '/pages/unduhan.html', destination: '/unduhan', statusCode: 308 },
      { source: '/pages/kontak.html', destination: '/kontak', statusCode: 308 },
      { source: '/articles', destination: '/berita', statusCode: 308 },
      { source: '/content-page', destination: '/profil', statusCode: 308 },
      { source: '/index.html', destination: '/', statusCode: 308 },
    ];
  },
};

export default nextConfig;
