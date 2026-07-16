import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStrapiImageUrl } from '../lib/api/image';
import { BASE_URL } from '../lib/api/client';

interface ContactData {
  title: string;
  description: string;
  contactList: { platform: string; content: string; link: string }[];
  featuredImage?: { url: string; formats?: any } | null;
}

export default function KontakPage() {
  const [form, setForm] = useState({ nama: '', email: '', subjek: '', kategori: 'layanan', pesan: '' });
  const [contact, setContact] = useState<ContactData | null>(null);
  const [loadingContact, setLoadingContact] = useState(true);

  useEffect(() => {
    const token = import.meta.env.VITE_STRAPI_API_KEY as string;
    fetch(`${BASE_URL}/contact-page?populate=*`, {
      headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    })
      .then(r => r.json())
      .then(j => {
        if (j.data) setContact({ title: j.data.title, description: j.data.description, contactList: j.data.contactList || [], featuredImage: j.data.featuredImage });
      })
      .catch(() => {})
      .finally(() => setLoadingContact(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Pengaduan berhasil dikirim (demo)!\n\nCatatan: Integrasi form submission CMS bisa via /api/form-submissions atau /api/mails dengan FORM_API_KEY jika tersedia.');
    setForm({ nama: '', email: '', subjek: '', kategori: 'layanan', pesan: '' });
  };

  return (
    <>
      <div className="bg-surface-container-low border-b border-border-light">
        <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-3 md:py-4">
          <nav className="flex items-center gap-2 text-label-sm font-label-sm text-on-surface-variant">
            <Link to="/" className="hover:text-primary transition-colors">Beranda</Link>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-primary font-bold">Kontak & Pengaduan</span>
          </nav>
        </div>
      </div>

      <section className="py-12 md:py-section-padding max-w-container-max mx-auto px-4 md:px-margin-desktop">
        <div className="mb-10 md:mb-12">
          <h2 className="font-headline-lg text-headline-lg text-primary">{contact?.title || 'Kontak & Pengaduan'}</h2>
          <p className="text-body-md font-body-md text-on-surface-variant mt-2 max-w-2xl">
            {contact?.description || 'Hubungi kami untuk informasi, bantuan layanan, atau sampaikan pengaduan Anda. Kami siap membantu pada jam layanan.'}
          </p>
          {loadingContact && <p className="text-label-sm text-on-surface-variant mt-2">Memuat info kontak dari CMS...</p>}
          {contact?.featuredImage && (
            <img src={getStrapiImageUrl(contact.featuredImage.formats?.small?.url || contact.featuredImage.url)} alt="Kontak" className="mt-4 rounded-xl w-full max-w-md h-48 object-cover" />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="bg-surface-white p-6 rounded-xl border border-border-light shadow-sm flex gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">location_on</span>
              </div>
              <div>
                <h3 className="font-label-md text-label-md font-bold text-primary">Alamat</h3>
                <p className="text-body-md font-body-md text-on-surface-variant mt-1">Jl. Krakatau No. 2 Kajen, Kabupaten Pekalongan, Jawa Tengah 51161</p>
              </div>
            </div>
            <div className="bg-surface-white p-6 rounded-xl border border-border-light shadow-sm flex gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">mail</span>
              </div>
              <div>
                <h3 className="font-label-md text-label-md font-bold text-primary">Email</h3>
                <p className="text-body-md font-body-md text-on-surface-variant mt-1">
                  {contact?.contactList?.find(c => c.platform === 'email')?.content || 'dinkominfo@pekalongankab.go.id'}
                </p>
                {contact?.contactList && contact.contactList.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {contact.contactList.map((c,i) => (
                      <li key={i} className="text-label-sm text-on-surface-variant">{c.platform}: <a href={c.link} className="text-primary hover:underline">{c.content}</a></li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="bg-surface-white p-6 rounded-xl border border-border-light shadow-sm flex gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">call</span>
              </div>
              <div>
                <h3 className="font-label-md text-label-md font-bold text-primary">Telepon</h3>
                <p className="text-body-md font-body-md text-on-surface-variant mt-1">(0285) 381175</p>
              </div>
            </div>
            <div className="bg-surface-white p-6 rounded-xl border border-border-light shadow-sm flex gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">schedule</span>
              </div>
              <div>
                <h3 className="font-label-md text-label-md font-bold text-primary">Jam Layanan</h3>
                <p className="text-body-md font-body-md text-on-surface-variant mt-1">Senin - Jumat, 08.00 - 16.00 WIB</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-surface-white p-6 md:p-8 rounded-xl border border-border-light shadow-sm">
            <h3 className="font-headline-md text-headline-md font-bold text-primary mb-6">Formulir Pengaduan</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="nama" className="block text-label-md font-label-md font-bold text-primary mb-2">Nama Lengkap</label>
                <input id="nama" name="nama" value={form.nama} onChange={handleChange} type="text" required className="w-full px-4 py-3 rounded-lg border border-border-light bg-surface-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="Masukkan nama Anda"/>
              </div>
              <div>
                <label htmlFor="email" className="block text-label-md font-label-md font-bold text-primary mb-2">Email</label>
                <input id="email" name="email" value={form.email} onChange={handleChange} type="email" required className="w-full px-4 py-3 rounded-lg border border-border-light bg-surface-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="nama@email.com"/>
              </div>
              <div>
                <label htmlFor="subjek" className="block text-label-md font-label-md font-bold text-primary mb-2">Subjek</label>
                <input id="subjek" name="subjek" value={form.subjek} onChange={handleChange} type="text" required className="w-full px-4 py-3 rounded-lg border border-border-light bg-surface-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="Judul pengaduan"/>
              </div>
              <div>
                <label htmlFor="kategori" className="block text-label-md font-label-md font-bold text-primary mb-2">Kategori</label>
                <select id="kategori" name="kategori" value={form.kategori} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-border-light bg-surface-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all">
                  <option value="layanan">Layanan</option>
                  <option value="teknis">Teknis</option>
                  <option value="informasi">Informasi</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label htmlFor="pesan" className="block text-label-md font-label-md font-bold text-primary mb-2">Pesan</label>
                <textarea id="pesan" name="pesan" value={form.pesan} onChange={handleChange} rows={5} required className="w-full px-4 py-3 rounded-lg border border-border-light bg-surface-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none" placeholder="Tuliskan pengaduan atau pertanyaan Anda..."></textarea>
              </div>
              <button type="submit" className="bg-primary text-on-primary px-8 py-3.5 rounded-lg font-label-md text-label-md font-bold hover:opacity-90 transition-opacity flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">send</span>
                Kirim Pengaduan
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
