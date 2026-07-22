import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dinkominfo Kabupaten Pekalongan - Portal Informasi Resmi',
  description: 'Portal resmi Dinas Komunikasi dan Informatika Kabupaten Pekalongan',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="light scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.classList.remove('light','dark');document.documentElement.classList.add(t);}catch(e){}})();`,
          }}
        />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="text-on-surface bg-[#fbf9f8] antialiased">
        {children}
      </body>
    </html>
  );
}
