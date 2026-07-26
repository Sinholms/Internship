"use client";

import { useState } from 'react';
import { validatePengaduan, type PengaduanFieldErrors } from '@/lib/pengaduanSchema';

interface ContactData {
  title?: string;
  description?: string;
  contactList?: { platform: string; content: string; link: string }[];
  featuredImage?: { url: string; formats?: Record<string, { url: string }> | null } | null;
}

interface Props {
  initialContact?: ContactData | null;
}

type SubmitStatus =
  | { state: 'idle' }
  | { state: 'submitting' }
  | { state: 'success' }
  | { state: 'error'; message: string };

export default function KontakFormClient({ initialContact }: Props) {
  const [form, setForm] = useState({ nama: '', email: '', subjek: '', kategori: 'layanan', pesan: '' });
  const [fieldErrors, setFieldErrors] = useState<PengaduanFieldErrors>({});
  const [status, setStatus] = useState<SubmitStatus>({ state: 'idle' });

  const contact = initialContact;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setFieldErrors(prev => (prev[e.target.name as keyof PengaduanFieldErrors] ? { ...prev, [e.target.name]: undefined } : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validated = validatePengaduan(form);
    if (!validated.ok) {
      setFieldErrors(validated.fieldErrors);
      setStatus({ state: 'error', message: 'Periksa kembali isian formulir Anda.' });
      return;
    }
    setFieldErrors({});
    setStatus({ state: 'submitting' });
    try {
      const res = await fetch('/api/pengaduan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated.data),
      });
      const json: { error?: string; fieldErrors?: PengaduanFieldErrors } = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (json.fieldErrors) setFieldErrors(json.fieldErrors);
        setStatus({ state: 'error', message: json.error || 'Pengaduan gagal dikirim. Silakan coba lagi.' });
        return;
      }
      setStatus({ state: 'success' });
      setForm({ nama: '', email: '', subjek: '', kategori: 'layanan', pesan: '' });
    } catch {
      setStatus({ state: 'error', message: 'Pengaduan gagal dikirim. Periksa koneksi Anda dan coba lagi.' });
    }
  };

  return (
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
            {fieldErrors.nama && <p role="alert" className="text-label-sm font-label-sm text-red-600 mt-1">{fieldErrors.nama}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-label-md font-label-md font-bold text-primary mb-2">Email</label>
            <input id="email" name="email" value={form.email} onChange={handleChange} type="email" required className="w-full px-4 py-3 rounded-lg border border-border-light bg-surface-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="nama@email.com"/>
            {fieldErrors.email && <p role="alert" className="text-label-sm font-label-sm text-red-600 mt-1">{fieldErrors.email}</p>}
          </div>
          <div>
            <label htmlFor="subjek" className="block text-label-md font-label-md font-bold text-primary mb-2">Subjek</label>
            <input id="subjek" name="subjek" value={form.subjek} onChange={handleChange} type="text" required className="w-full px-4 py-3 rounded-lg border border-border-light bg-surface-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="Judul pengaduan"/>
            {fieldErrors.subjek && <p role="alert" className="text-label-sm font-label-sm text-red-600 mt-1">{fieldErrors.subjek}</p>}
          </div>
          <div>
            <label htmlFor="kategori" className="block text-label-md font-label-md font-bold text-primary mb-2">Kategori</label>
            <select id="kategori" name="kategori" value={form.kategori} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-border-light bg-surface-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all">
              <option value="layanan">Layanan</option>
              <option value="teknis">Teknis</option>
              <option value="informasi">Informasi</option>
              <option value="lainnya">Lainnya</option>
            </select>
            {fieldErrors.kategori && <p role="alert" className="text-label-sm font-label-sm text-red-600 mt-1">{fieldErrors.kategori}</p>}
          </div>
          <div>
            <label htmlFor="pesan" className="block text-label-md font-label-md font-bold text-primary mb-2">Pesan</label>
            <textarea id="pesan" name="pesan" value={form.pesan} onChange={handleChange} rows={5} required className="w-full px-4 py-3 rounded-lg border border-border-light bg-surface-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none" placeholder="Tuliskan pengaduan atau pertanyaan Anda..."></textarea>
            {fieldErrors.pesan && <p role="alert" className="text-label-sm font-label-sm text-red-600 mt-1">{fieldErrors.pesan}</p>}
          </div>
          {status.state === 'success' && (
            <p role="status" className="text-body-md font-body-md text-primary bg-primary-fixed rounded-lg px-4 py-3">
              Pengaduan berhasil dikirim. Terima kasih, kami akan menindaklanjuti pesan Anda.
            </p>
          )}
          {status.state === 'error' && (
            <p role="alert" className="text-body-md font-body-md text-red-600 bg-red-50 rounded-lg px-4 py-3">
              {status.message}
            </p>
          )}
          <button type="submit" disabled={status.state === 'submitting'} className="bg-primary text-on-primary px-8 py-3.5 rounded-lg font-label-md text-label-md font-bold hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
            <span className="material-symbols-outlined text-[20px]">send</span>
            {status.state === 'submitting' ? 'Mengirim...' : 'Kirim Pengaduan'}
          </button>
        </form>
      </div>
    </div>
  );
}
