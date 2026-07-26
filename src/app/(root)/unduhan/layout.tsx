import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unduhan - Dinkominfo Kabupaten Pekalongan',
  description:
    'Dokumen dan berkas unduhan resmi Dinas Komunikasi dan Informatika Kabupaten Pekalongan.',
};

export default function UnduhanLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: 'Unduhan', path: '/unduhan' }]} />
      {children}
    </>
  );
}
