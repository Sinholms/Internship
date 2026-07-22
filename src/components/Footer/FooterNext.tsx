"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface GlobalData {
  siteName: string;
  copyrightText?: string | null;
  socialMedia?: { platform: string; link: string }[];
}

export default function FooterNext() {
  const [global, setGlobal] = useState<GlobalData | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/global?populate=*')
      .then(r => r.json())
      .then(j => {
        if (cancelled) return;
        if (j.data) setGlobal({ siteName: j.data.siteName, copyrightText: j.data.copyrightText, socialMedia: j.data.socialMedia });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const socialLinks = global?.socialMedia || [
    { platform: 'instagram', link: 'https://www.instagram.com/dinkominfopekalongankab/' },
    { platform: 'youtube', link: 'https://www.youtube.com/channel/UCIUtCxMVq9TsqJVpjXn8lJA' },
  ];

  return (
    <footer className="bg-primary dark:bg-surface-container-lowest text-on-primary">
      <div className="w-full py-12 md:py-section-padding px-4 md:px-margin-desktop grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-gutter max-w-container-max mx-auto">
        <div className="md:col-span-4 space-y-6">
          <h3 className="font-headline-md text-headline-md text-surface-white">Dinkominfo</h3>
          <p className="font-body-md text-body-md opacity-80">Dinas Komunikasi dan Informatika Kabupaten Pekalongan berkomitmen memberikan layanan informasi dan teknologi terbaik bagi masyarakat.</p>
          <div className="space-y-2">
            <div className="flex items-center gap-3 opacity-80">
              <span className="material-symbols-outlined text-sm">location_on</span>
              <span className="text-label-md font-label-md">Jl. Krakatau Nomor 2, Kajen, Pekalongan, Jawa Tengah</span>
            </div>
            <div className="flex items-center gap-3 opacity-80">
              <span className="material-symbols-outlined text-sm">mail</span>
              <span className="text-label-md font-label-md">dinkominfo@pekalongankab.go.id</span>
            </div>
            {socialLinks.length > 0 && (
              <div className="flex gap-2 pt-2">
                {socialLinks.map((s, i) => (
                  <a key={i} href={s.link} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary-container hover:text-on-secondary-container transition-all" aria-label={s.platform}>
                    <span className="material-symbols-outlined text-sm">{s.platform === 'instagram' ? 'photo_camera' : s.platform === 'youtube' ? 'play_arrow' : 'public'}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2 md:col-start-6 space-y-6">
          <h4 className="font-label-md text-label-md font-bold text-secondary-container">Aplikasi</h4>
          <ul className="space-y-3">
            <li><a className="text-on-primary dark:text-on-surface-variant opacity-80 hover:opacity-100 hover:underline decoration-secondary-container decoration-2 underline-offset-4 transition-opacity font-label-md text-label-md" href="https://pekalongankab.go.id">Website Resmi Pemerintah Kabupaten Pekalongan</a></li>
            <li><Link className="text-on-primary dark:text-on-surface-variant opacity-80 hover:opacity-100 hover:underline decoration-secondary-container decoration-2 underline-offset-4 transition-opacity font-label-md text-label-md" href="/">Dinas Komunikasi dan informatika Kabupaten Pekalongan</Link></li>
            <li><a className="text-on-primary dark:text-on-surface-variant opacity-80 hover:opacity-100 hover:underline decoration-secondary-container decoration-2 underline-offset-4 transition-opacity font-label-md text-label-md" href="https://ppid.pekalongankab.go.id">PPID Kabupaten Pekalongan</a></li>
          </ul>
        </div>

        <div className="md:col-span-2 space-y-6">
          <h4 className="font-label-md text-label-md font-bold text-secondary-container">Tautan</h4>
          <ul className="space-y-3">
            <li><Link className="text-on-primary dark:text-on-surface-variant opacity-80 hover:opacity-100 hover:underline decoration-secondary-container decoration-2 underline-offset-4 transition-opacity font-label-md text-label-md" href="/unduhan">JDIH</Link></li>
            <li><Link className="text-on-primary dark:text-on-surface-variant opacity-80 hover:opacity-100 hover:underline decoration-secondary-container decoration-2 underline-offset-4 transition-opacity font-label-md text-label-md" href="/layanan">E-Government</Link></li>
            <li><a className="text-on-primary dark:text-on-surface-variant opacity-80 hover:opacity-100 hover:underline decoration-secondary-container decoration-2 underline-offset-4 transition-opacity font-label-md text-label-md" href="https://pekalongankab.go.id">Portal Kabupaten</a></li>
          </ul>
        </div>

        <div className="md:col-span-3 space-y-6">
          <h4 className="font-label-md text-label-md font-bold text-secondary-container">Newsletter</h4>
          <p className="text-label-sm font-label-sm opacity-70">Langganan berita terbaru langsung ke email Anda.</p>
          <div className="flex gap-2">
            <label htmlFor="footer-email" className="sr-only">Email Anda</label>
            <input id="footer-email" className="bg-white/10 border-white/20 text-white rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-secondary-container outline-none transition-all placeholder:text-white/40" placeholder="Email Anda" type="email"/>
            <button aria-label="Berlangganan newsletter" className="bg-secondary-container text-on-secondary-container p-2 rounded-lg">
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
          {global && <p className="text-label-sm opacity-60">Data footer dari CMS: {global.siteName}</p>}
        </div>

        <div className="md:col-span-12 pt-8 md:pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-label-md text-label-md opacity-60 text-center md:text-left">{global?.copyrightText || '© 2024 Dinkominfo Kabupaten Pekalongan. All rights reserved.'}</p>
          <div className="flex gap-6 opacity-60">
            <Link className="font-label-sm text-label-sm hover:text-white" href="/profil">Kebijakan Privasi</Link>
            <Link className="font-label-sm text-label-sm hover:text-white" href="/layanan">Syarat &amp; Ketentuan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
