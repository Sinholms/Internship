import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Galeri - Dinkominfo Kabupaten Pekalongan',
  description:
    'Galeri foto dan dokumentasi kegiatan Dinas Komunikasi dan Informatika Kabupaten Pekalongan.',
};

export default function GaleriLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: 'Galeri', path: '/galeri' }]} />
      {children}
    </>
  );
}
