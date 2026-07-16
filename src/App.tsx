import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import ArticlesPage from './pages/ArticlesPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import ContentPage from './pages/ContentPage';
import LayananPage from './pages/LayananPage';
import GaleriPage from './pages/GaleriPage';
import UnduhanPage from './pages/UnduhanPage';
import KontakPage from './pages/KontakPage';
import CmsTestPage from './pages/CmsTestPage';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/berita" element={<ArticlesPage />} />
            <Route path="/berita/:id" element={<ArticleDetailPage />} />
            <Route path="/profil" element={<ContentPage />} />
            <Route path="/layanan" element={<LayananPage />} />
            <Route path="/galeri" element={<GaleriPage />} />
            <Route path="/unduhan" element={<UnduhanPage />} />
            <Route path="/kontak" element={<KontakPage />} />
            <Route path="/cms-test" element={<CmsTestPage />} />

            {/* legacy compat */}
            <Route path="/articles" element={<Navigate to="/berita" replace />} />
            <Route path="/content-page" element={<Navigate to="/profil" replace />} />
            <Route path="/pages/articles.html" element={<Navigate to="/berita" replace />} />
            <Route path="/pages/article-detail.html" element={<Navigate to="/berita/1" replace />} />
            <Route path="/pages/content-page.html" element={<Navigate to="/profil" replace />} />
            <Route path="/pages/layanan.html" element={<Navigate to="/layanan" replace />} />
            <Route path="/pages/galeri.html" element={<Navigate to="/galeri" replace />} />
            <Route path="/pages/unduhan.html" element={<Navigate to="/unduhan" replace />} />
            <Route path="/pages/kontak.html" element={<Navigate to="/kontak" replace />} />
            <Route path="/index.html" element={<Navigate to="/" replace />} />

            {/* fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
