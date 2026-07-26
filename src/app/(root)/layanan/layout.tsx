import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Layanan - Dinkominfo Kabupaten Pekalongan',
  description:
    'Layanan publik Dinas Komunikasi dan Informatika Kabupaten Pekalongan: informasi, aplikasi, dan layanan digital.',
};

export default function LayananLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: 'Layanan', path: '/layanan' }]} />
      {children}
    </>
  );
}
